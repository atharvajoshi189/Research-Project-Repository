const fetch = require('node-fetch');

async function testSearch() {
    try {
        const response = await fetch('http://localhost:3000/api/ai-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: "give me the project of rajas",
                history: []
            })
        });

        if (!response.ok) {
            console.error(`Status: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Body:", text);
            return;
        }

        const data = await response.json();
        console.log("Status: 200 OK");
        console.log("Response Data:", JSON.stringify(data, null, 2));

    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

testSearch();
