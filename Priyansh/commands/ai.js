const axios = require("axios");

module.exports.config = {
    name: "ai",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Modified by ChatGPT",
    description: "Gemini AI Chatbot - Triggered by 'babu'",
    commandCategory: "ai",
    usages: "[message]",
    cooldowns: 2,
};

const API_KEY = "AIzaSyD8AUi70sMMjKS6DP3x07Olku6oT-YgnFY"; // Tumhari Google Gemini API key

async function fetchGeminiResponse(query) {
    try {
        console.log("🔍 Query Sent to Gemini:", query); // Debugging

        const res = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
            { contents: [{ parts: [{ text: query }] }] },
            { headers: { "Content-Type": "application/json" } }
        );

        console.log("✅ API Response:", JSON.stringify(res.data, null, 2)); // Debugging

        if (res.data && res.data.candidates && res.data.candidates.length > 0) {
            return res.data.candidates[0].content.parts[0].text;
        } else {
            return "😕 Sorry babu, mujhe yeh samajh nahi aya.";
        }
    } catch (error) {
        console.error("❌ Error fetching response:", error.response ? error.response.data : error);
        return "❌ Gemini API ka masla hai, thodi dair baad try karo babu!";
    }
}

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, body } = event;
    console.log("📩 Received Message:", body); // Debugging

    if (!body.toLowerCase().startsWith("babu")) {
        console.log("⛔ Not starting with 'babu', ignoring...");
        return;
    }

    const actualQuery = body.replace(/^babu/i, "").trim();
    if (!actualQuery) {
        console.log("💡 Empty query after 'babu', sending default reply.");
        return api.sendMessage("Jee babu? 💖", threadID, messageID);
    }

    console.log("🚀 Processing Query:", actualQuery); // Debugging
    api.sendMessage("🔍 Babu soch raha hai... zara rukho!", threadID, messageID);

    try {
        const reply = await fetchGeminiResponse(actualQuery);
        console.log("📨 Sending Reply:", reply); // Debugging
        api.sendMessage(reply, threadID, messageID);
    } catch (error) {
        api.sendMessage("❌ Kuch masla ho gaya, babu baad me try karega!", threadID, messageID);
    }
};
