async function testApi() {
    console.log("Testing API /api/grok...");
    try {
        const response = await fetch('http://localhost:3000/api/grok', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'insights',
                context: {
                    title: "Test Project",
                    abstract: "This is a test abstract for an AI project using Machine Learning.",
                    tech_stack: ["Python", "TensorFlow", "React"]
                }
            })
        });

        const status = response.status;
        console.log("Status:", status);

        const text = await response.text();
        const fs = require('fs');
        fs.writeFileSync('debug_output.txt', text);
        console.log("Response written to debug_output.txt");

        try {
            const json = JSON.parse(text);
            if (json.debug_info) {
                console.log("DEBUG INFO:", JSON.stringify(json.debug_info, null, 2));
            }
        } catch (e) {
            console.log("Could not parse JSON body");
        }

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

testApi();
