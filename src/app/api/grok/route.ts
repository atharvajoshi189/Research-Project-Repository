import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize client based on available keys
// Priority: GROQ_API_KEY (Groq Cloud) -> GROK_API_KEY (Common Typo/Alt) -> XAI_API_KEY (xAI) -> OPENAI_API_KEY (Fallback)


const rawApiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
    const isGroq = (process.env.GROQ_API_KEY || (process.env.GROK_API_KEY && process.env.GROK_API_KEY.trim().startsWith('gsk_')));
    const isXAI = (process.env.XAI_API_KEY || (process.env.GROK_API_KEY && !process.env.GROK_API_KEY.trim().startsWith('gsk_'))); // Assume xAI if provided but not gsk_

    // Default model selection - updated to latest Groq model
    const modelName = isGroq
        ? 'llama-3.3-70b-versatile' // Latest recommended for Groq
        : (isXAI ? 'grok-beta' : 'gpt-3.5-turbo');

    const apiKey = rawApiKey;
    const baseURL = isGroq
        ? 'https://api.groq.com/openai/v1'
        : (isXAI ? 'https://api.x.ai/v1' : undefined);

    console.log(`[AI API] Using model: ${modelName}`);

    if (!apiKey) {
        return NextResponse.json({ error: 'Server misconfiguration: No AI API Key found.' }, { status: 500 });
    }

    const openai = new OpenAI({
        apiKey: apiKey || 'dummy',
        baseURL: baseURL
    });

    try {
        const body = await req.json();
        const { action, context } = body;

        if (!action || !context) {
            return NextResponse.json({ error: 'Missing action or context' }, { status: 400 });
        }

        let systemPrompt = "You are an expert academic research assistant.";
        let userPrompt = "";

        switch (action) {
            case 'insights':
                systemPrompt += " You summarize research projects concisely. You output valid JSON only.";
                userPrompt = `
                    Analyze this project:
                    Title: ${context.title}
                    Abstract: ${context.abstract}
                    Tech Stack: ${context.tech_stack}

                    Provide a JSON response with:
                    1. "summary": A 3-line punchy summary "At a Glance".
                    2. "innovations": An array of 3 short, bullet-point assertions about its key innovations.
                    3. "author_expertise": A 2-word expertise badge for the lead author (e.g. "AI Architect").
                    4. "key_roles": An array of 3 other likely technical roles for this project (e.g. "Frontend Dev", "Data Scientist").
                    
                    Format: { "summary": "...", "innovations": ["..."], "author_expertise": "...", "key_roles": ["..."] }
                `;
                break;

            case 'simplify_abstract':
                systemPrompt += " You explain complex technical concepts to non-technical readers.";
                userPrompt = `
                    Rewrite this abstract for a high-school student or investor (simple, engaging, no jargon):
                    "${context.abstract}"
                    
                    Keep it under 150 words.
                `;
                break;

            case 'team_expertise':
                systemPrompt += " You infer technical roles based on project complexity.";
                userPrompt = `
                    Based on this project: "${context.title}" and tech stack: "${context.tech_stack}",
                    assign a 2-word "Expertise Badge" for a contributor.
                    Examples: "AI Architect", "Blockchain Dev", "Frontend Wizard".
                    Return ONLY the badge name.
                `;
                break;

            case 'tech_snippet':
                systemPrompt += " You explain technology choices in context.";
                userPrompt = `
                    Explain why "${context.tech}" is crucial for a project titled "${context.title}" that involves "${context.abstract}".
                    Keep it one short sentence (max 20 words).
                `;
                break;

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: modelName,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 300,
            // Only use json_object for models that definitely support it or when strictly required
            response_format: (action === 'insights' && (modelName.includes('gpt') || modelName.includes('llama'))) ? { type: "json_object" } : undefined
        });

        const content = completion.choices[0].message.content;

        // Parse JSON if needed
        let data: any = content;
        if (action === 'insights') {
            try {
                // If the model didn't return pure JSON, try to extract it
                const jsonMatch = content?.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : content;
                data = JSON.parse(jsonStr || '{}');
            } catch (e) {
                console.error("JSON Parse Error", e);
                data = { summary: "Could not generate summary.", innovations: [] };
            }
        }

        return NextResponse.json({ data });

    } catch (error: any) {
        console.error('AI API Error:', error);
        return NextResponse.json({ error: error.message || 'AI Service Failed' }, { status: 500 });
    }
}
