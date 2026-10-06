require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function testGemini() {
    try {
        console.log("==========================================");
        console.log("TESTING GEMINI");
        console.log("==========================================");

        console.log(
            "API key loaded:",
            !!process.env.GEMINI_API_KEY
        );

        console.log("Model: gemini-3.8-flash");
        console.log("------------------------------------------");

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: "Say hello in one short sentence."
        });

        console.log("==========================================");
        console.log("GEMINI TEST SUCCESSFUL");
        console.log("==========================================");

        console.log("Response:");
        console.log(response.text);

    } catch (error) {

        console.log("==========================================");
        console.log("GEMINI TEST FAILED");
        console.log("==========================================");

        console.log("Status:", error.status);
        console.log("Message:", error.message);
    }
}

testGemini();