const axios = require("axios");

// Conversation history store karne ke liye (sirf last 5 messages)
const conversationHistory = {};

module.exports.config = {
    name: "ai",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Google Cloud AI (Gemini) by Priyansh",
    commandCategory: "Noprefix", // No prefix command
    usages: "[ask]",
    cooldowns: 2,
    dependencies: {
        "axios": "1.4.0"
    }
};

// ✅ Handle messages without prefix
module.exports.handleEvent = async function ({ api, event, Users }) {
    const { threadID, messageID, senderID, body } = event;

    // Agar message exist nahi karta to return
    if (!body) return;

    const query = body.toLowerCase().trim(); // Lowercase & trim for better detection
    const name = await Users.getNameUser(senderID);

    // ✅ Sirf "babu" per react kare
    if (query !== "babu") return;

    api.sendMessage("Searching for an answer, please wait...", threadID, messageID);

    try {
        api.setMessageReaction("⌛", event.messageID, () => { }, true);

        // Google Cloud AI (Gemini API) Configuration
        const geminiApiKey = "AIzaSyBLJasBu3OUFEzFlVI-E1l1O0GXvbk1cxA";
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

        // ✅ Conversation history maintain karein
        if (!conversationHistory[threadID]) {
            conversationHistory[threadID] = [];
        }
        const previousConversation = conversationHistory[threadID];

        // ✅ User ka new message add karein
        previousConversation.push({
            role: "user",
            parts: [{ text: "Hello, Babu!" }] // Default message to Gemini
        });

        // ✅ Sirf last 5 messages rakhein
        if (previousConversation.length > 5) {
            previousConversation.shift();
        }

        console.log("Sending request to Gemini API with:", previousConversation);

        // ✅ Request bhejna API ko
        const response = await axios.post(geminiApiUrl, {
            contents: previousConversation
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("Received response from Gemini API:", response.data);

        // ✅ Check response
        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            const geminiResponse = response.data.candidates[0].content.parts[0].text;

            // ✅ Response history me add karein
            previousConversation.push({
                role: "model",
                parts: [{ text: geminiResponse }]
            });

            // ✅ Sirf last 5 messages rakhein
            if (previousConversation.length > 5) {
                previousConversation.shift();
            }

            api.sendMessage(geminiResponse, threadID, messageID);
            api.setMessageReaction("✅", event.messageID, () => { }, true);
        } else {
            throw new Error("Invalid response from API");
        }
    } catch (error) {
        console.error('Error fetching response from Gemini:', error.response ? error.response.data : error.message);
        api.sendMessage(`An error occurred: ${error.message}. Please try again later.`, threadID, messageID);
    }
};
