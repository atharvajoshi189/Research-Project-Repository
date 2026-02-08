async function testApi() {
    console.log("Testing API /api/grok for new fields...");
    try {
        const response = await fetch('http://localhost:3000/api/grok', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'insights',
                context: {
                    title: "AI Powered Healthcare System",
                    abstract: "A system using deep learning to diagnose diseases from X-rays.",
                    tech_stack: ["Python", "TensorFlow", "React"]
                }
            })
        });

        const text = await response.text();
        console.log("Raw Body:", text);

        const json = JSON.parse(text);
        const data = json.data;

        console.log("--- Verification ---");
        console.log("Summary exists:", !!data.summary);
        console.log("Innovations exists:", !!data.innovations);
        console.log("Author Expertise:", data.author_expertise);
        console.log("Key Roles:", data.key_roles);

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

testApi();
