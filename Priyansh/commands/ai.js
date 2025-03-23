const axios = require("axios");

module.exports.config = {
    name: "ai",
    version: "1.0.0",
    hasPermission: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Gemini AI Chatbot - Triggered by 'babu'",
    commandCategory: "ai",
    usages: "[message]",
    cooldowns: 2,
};

const API_KEY = "AIzaSyD8AUi70sMMjKS6DP3x07Olku6oT-YgnFY"; // Tumhari Google Gemini API key

async function fetchGeminiResponse(query) {
    try {
        console.log("🔍 Query Sent to Gemini:", query);

        const res = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
            { contents: [{ parts: [{ text: query }] }] },
            { headers: { "Content-Type": "application/json" } }
        );

        console.log("✅ API Response Received!");

        if (res.data && res.data.candidates && res.data.candidates.length > 0) {
            return res.data.candidates[0].content.parts[0].text;
        } else {
            console.log("⚠️ Empty response from API!");
            return "😕 Sorry babu, mujhe yeh samajh nahi aya.";
        }
    } catch (error) {
        console.error("❌ API Error:", error.response ? error.response.data : error);
        return "❌ Babu ka dimag hang ho gaya, baad me try karo!";
    }
}

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, body } = event;
    console.log("📩 Message Received:", body);

    if (!body.toLowerCase().startsWith("babu")) {
        console.log("⛔ Ignored (Not Starting with 'babu')");
        return;
    }

    const actualQuery = body.replace(/^babu/i, "").trim();
    if (!actualQuery) {
        console.log("💡 Empty Query After 'babu'");
        return api.sendMessage("Jee babu? 💖", threadID, messageID);
    }

    console.log("🚀 Processing Query:", actualQuery);
    api.sendMessage("🔍 Babu soch raha hai... zara rukho!", threadID, messageID);

    try {
        const reply = await fetchGeminiResponse(actualQuery);
        console.log("📨 Sending Reply:", reply);
        api.sendMessage(reply, threadID, messageID);
    } catch (error) {
        console.error("❌ Error Sending Message:", error);
        api.sendMessage("❌ Babu ko masla ho gaya, baad me try karega!", threadID, messageID);
    }
};
