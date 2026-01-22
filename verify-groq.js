require('dotenv').config({ path: '.env.local' });

async function verifyGroq() {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
        console.error("Error: GROK_API_KEY not found in .env.local");
        return;
    }

    console.log("Testing Groq API...");

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: "Hi"
                    }
                ],
                model: "llama-3.3-70b-versatile"
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error: ${response.status}`);
            console.error(errorText);
            return;
        }

        const data = await response.json();
        console.log("Success!");
        console.log(data.choices[0].message.content);

    } catch (error) {
        console.error("Network Error:", error);
    }
}

verifyGroq();
