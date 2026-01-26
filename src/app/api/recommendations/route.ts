import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export async function GET(request: Request) {
    try {
        // 1. Initialize Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // 2. Auth Check
        // Get the session from the Authorization header or cookie
        // For simplicity in this specific flow, we'll trust the client to send the session token if needed, 
        // but better to just get the user from the token passed in headers.
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
        }
        
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        // 3. Data Gathering: Interest Cloud
        // Fetch projects where user is leader or collaborator
        const { data: collabData, error: collabError } = await supabase
            .from('project_collaborators')
            .select(`
          role,
          projects (
          title,
          abstract,
          tech_stack,
          category
        )
      `)
            .eq('student_id', user.id);

        if (collabError) {
            console.error('Error fetching user history:', collabError);
            return NextResponse.json({ error: 'Failed to fetch user history' }, { status: 500 });
        }

        // Construct User Profile Text
        const pastProjects = collabData?.map((c: any) => c.projects).filter(Boolean) || [];
        const userProfileText = pastProjects.map((p: any) =>
            `Title: ${p.title}, Category: ${p.category}, Tech: ${p.tech_stack}`
        ).join('; ');

        // 4. Candidate Pool
        // Fetch recent approved projects (excluding user's own if possible, though 'projects' table key is author ID checking might be needed if we want strict exclusion)
        // We already know user.id. The projects table has a 'student_id' column for the owner.

        const { data: candidates, error: candidateError } = await supabase
            .from('projects')
            .select('id, title, abstract, tech_stack, category, student_id')
            .eq('status', 'approved')
            .neq('student_id', user.id) // Exclude own projects
            .order('created_at', { ascending: false })
            .limit(30);

        if (candidateError) {
            console.error('Error fetching candidates:', candidateError);
            return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
        }

        if (!candidates || candidates.length === 0) {
            return NextResponse.json({ recommendations: [] }); // No candidates to recommend
        }

        // 5. Grok API Call
        const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
        if (!apiKey) {
            console.warn('GROK_API_KEY is missing. Returning fallback (latest 4).');
            return NextResponse.json({ recommendations: candidates.slice(0, 4) });
        }

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: 'https://api.x.ai/v1',
        });

        const candidateList = candidates.map(p => ({
            id: p.id,
            title: p.title,
            tech: p.tech_stack,
            category: p.category
        }));

        const systemPrompt = "You are an expert academic project advisor.";
        const userPrompt = `
      Analyze this student's project history to understand their interests and tech stack expertise.
      
      Student History: "${userProfileText}"
      
      Candidate Projects: ${JSON.stringify(candidateList)}
      
      Task: Select the top 4 projects from the Candidate Projects list that are most relevant to this student's interests and expertise.
      Criteria: match tech stacks, complementary categories, or logical next steps in learning.
      
      Return ONLY a JSON array of the 4 matching Project IDs strings. Example: ["id1", "id2", "id3", "id4"]. Do not include any other text.
    `;

        try {
            const completion = await openai.chat.completions.create({
                model: "grok-beta", // or "grok-2-latest" etc. dependent on availability. Using "grok-beta" as safe default or "grok-2-vision-1212"
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.3, // Low temperature for deterministic output
            });

            const responseContent = completion.choices[0].message.content?.trim();
            console.log("Grok Response:", responseContent);

            // Parse JSON
            let recommendedIds: string[] = [];
            try {
                // Try to parse clean JSON
                recommendedIds = JSON.parse(responseContent || "[]");
            } catch (e) {
                // Fallback: try to extract array from string if markdown ticks are used
                const match = responseContent?.match(/\[.*\]/s);
                if (match) {
                    recommendedIds = JSON.parse(match[0]);
                } else {
                    throw new Error("Could not parse JSON from Grok response");
                }
            }

            // Filter the full candidate objects based on IDs
            const finalRecommendations = candidates.filter(c => recommendedIds.includes(c.id));

            // If AI returns fewer than 4 or fails to match, fill with top candidates
            if (finalRecommendations.length < 4) {
                const existingIds = new Set(finalRecommendations.map(r => r.id));
                for (const c of candidates) {
                    if (!existingIds.has(c.id)) {
                        finalRecommendations.push(c);
                        if (finalRecommendations.length >= 4) break;
                    }
                }
            }

            return NextResponse.json({ recommendations: finalRecommendations.slice(0, 4) });

        } catch (aiError) {
            console.error('Grok API Error:', aiError);
            // Fallback to latest 4
            return NextResponse.json({ recommendations: candidates.slice(0, 4) });
        }

    } catch (err: any) {
        console.error('Server Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
