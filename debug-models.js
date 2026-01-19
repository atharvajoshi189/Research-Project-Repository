const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // For v1beta, we might need to access the model list differently or just try to instantiate.
    // The SDK doesn't always expose listModels directly on the main class in older versions, 
    // but let's try the standard way if available, or just check the error.

    // Actually, the JS SDK doesn't have a simple listModels method exposed on the top level easily in all versions.
    // But we can try to hit the REST API directly for listing if SDK fails, or just use a known robust model.

    // Let's rely on a simple test of models.
    const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.0-pro"];

    console.log("Testing Model Availability...");

    for (const modelName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            console.log(`✅ ${modelName} is WORKING.`);
            // If one works, we can stop or just list all working ones.
        } catch (error) {
            console.log(`❌ ${modelName} failed: ${error.message.split('[')[0]}`); // Print concise error
        }
    }
}

listModels();
