'use server'

import { createClient } from '@supabase/supabase-js'
import { getProjectMetadataForAI } from '@/lib/ai-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const grokApiKey = process.env.GROK_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function searchProjectsWithAI(userQuery: string) {
    try {
        console.log("Starting AI Search...");

        // 1. Fetch Context using our optimized Data Retriever
        const projectContext = await getProjectMetadataForAI();

        if (!projectContext) {
            return { projects: [], summary: "I couldn't access the project repository at the moment." };
        }

        // 2. The Prompt Injection (St. Vincent Pallotti College Persona)
        const systemPrompt = `
      You are the official Research Assistant for St. Vincent Pallotti College.
      Here is the list of available projects from our repository:

        [BEGIN KNOWLEDGE BASE]
      ${projectContext}
        [END KNOWLEDGE BASE]

        Now, based ONLY on this list, answer the user's question.

      Return a JSON object containing:
        1. "summary": A detailed, insightful response. 
          - If specific projects are found, summarize their core value or technical approach. 
          - If searching for a student(e.g., "Soham"), mention their specific contributions.
          - Example: "I found 1 project by Soham Rothe. His work on 'FitPlus' focuses on AI-based gym instruction..."
        2. "matches": An array of matched project_ids from the list.Each match must have:
        - "id": The exact project ID(uuid).
         - "reason": A brief explanation of why this project matches the query.

      Respond ONLY in valid JSON.Do not include markdown formatting(like \`\`\`json).
    `;

        console.log("Sending request to Grok API...");

        // 3. Call Groq API (using the provided gsk_ key)
        // Check if the key looks like a Groq key (starts with gsk_) or xAI key
        const isGroqKey = grokApiKey.startsWith('gsk_');
        const apiUrl = isGroqKey ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.x.ai/v1/chat/completions";
        const model = isGroqKey ? "llama-3.3-70b-versatile" : "grok-beta";

        console.log(`Sending request to ${isGroqKey ? 'Groq' : 'xAI'} API...`);

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${grokApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `User Query: "${userQuery}"` }
                ],
                model: model,
                temperature: 0.1,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Grok API Error:", errorText);
            throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
        }

        const aiData = await response.json();
        const content = aiData.choices[0].message.content;

        console.log("Grok Response:", content);

        // 4. Parse Response
        // Robust JSON extraction: Find reference to the first '{' and last '}'
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');

        let jsonString = "";
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonString = content.substring(firstBrace, lastBrace + 1);
        } else {
            // If no JSON structure is found, treat entire content as summary
            return { projects: [], summary: content.replace(/```/g, '') }; // basic cleanup
        }

        let parsedResult;
        try {
            parsedResult = JSON.parse(jsonString);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Fallback if AI returns plain text
            return { projects: [], summary: content };
        }

        // 5. Fetch Full Project Details for Matches
        // We need to fetch the full projects again to return them to the UI, 
        // or we could have cached them. Since we only fetched metadata string before, 
        // we now fetch the specific projects by ID.
        if (parsedResult.matches && parsedResult.matches.length > 0) {
            const matchIds = parsedResult.matches.map((m: any) => m.id);

            const { data: fullProjects, error } = await supabase
                .from('projects')
                .select('id, title, abstract, tech_stack, authors, guide_name, academic_year, status, github_url, pdf_url') // Ensure all UI fields are fetched
                .in('id', matchIds);

            if (error) {
                console.error("Supabase Error fetching full projects:", error);
            }

            // Merge AI reason with project data
            const finalResults = fullProjects?.map(p => {
                const match = parsedResult.matches.find((m: any) => m.id === p.id);
                return {
                    ...p,
                    aiReason: match ? match.reason : "Related project"
                };
            }) || [];

            // Sort by the order Grok returned them (relevance)
            const sortedResults = finalResults.sort((a, b) => {
                const indexA = matchIds.indexOf(a.id);
                const indexB = matchIds.indexOf(b.id);
                return indexA - indexB;
            });

            return {
                projects: sortedResults,
                summary: parsedResult.summary
            };
        }

        return {
            projects: [],
            summary: parsedResult.summary
        };

    } catch (error) {
        console.error("AI Search Action Error:", error);
        return { error: "My logic circuits are currently overloaded. Please try again." };
    }
}
