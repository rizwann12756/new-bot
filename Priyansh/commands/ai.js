const axios = require("axios");

module.exports.config = {
    name: "ai",
    version: "1.0.0",
    hasPermission: 0,
    credits: "Modified by ChatGPT",
    description: "Gemini AI Chatbot - Triggered by 'janu'",
    commandCategory: "ai",
    usages: "[message]",
    cooldowns: 2,
};

const API_KEY = "AIzaSyD8AUi70sMMjKS6DP3x07Olku6oT-YgnFY"; // Tumhari Google Gemini API key

async function fetchGeminiResponse(query) {
    try {
        const res = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
            { contents: [{ parts: [{ text: query }] }] },
            { headers: { "Content-Type": "application/json" } }
        );

        if (res.data && res.data.candidates && res.data.candidates.length > 0) {
            return res.data.candidates[0].content.parts[0].text;
        } else {
            return "😕 Sorry, I couldn't understand that.";
        }
    } catch (error) {
        console.error("❌ Error fetching response:", error);
        return "❌ Gemini API is not responding. Please try again later.";
    }
}

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, body } = event;
    const query = body.toLowerCase().trim();

    if (!query.startsWith("janu")) return; // Sirf "janu" se start hone par hi bot chalega

    const actualQuery = query.replace("janu", "").trim(); // "janu" hata kar message extract karo
    if (!actualQuery) return api.sendMessage("Jee Janu? 💖", threadID, messageID);

    api.sendMessage("🔍 Janu soch raha hai... zara rukho!", threadID, messageID);

    try {
        const reply = await fetchGeminiResponse(actualQuery);
        api.sendMessage(reply, threadID, messageID);
    } catch (error) {
        api.sendMessage("❌ Kuch masla ho gaya, Janu baad me try karega!", threadID, messageID);
    }
};
