const axios = require("axios");

// Conversation history store karne ke liye (sirf last 5 messages)
const conversationHistory = {};

module.exports.config = {
    name: "babu",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Google Cloud AI (Gemini) by Priyansh",
    commandCategory: "Noprefix",
    usages: "Just type 'babu' and ask anything",
    cooldowns: 2,
    dependencies: {
        "axios": "1.4.0"
    }
};

module.exports.handleEvent = async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID, body } = event;
    if (!body) return; // Agar message empty ho to kuch na kare

    const messageText = body.toLowerCase().trim(); // Message ko lowercase aur trim karein
    if (!messageText.startsWith("babu")) return; // Sirf "babu" se shuru hone wale messages handle karein

    const query = messageText.slice(4).trim(); // "babu" ke baad jo likha hai, use query banao
    if (!query) return api.sendMessage("Mujhse kuch puchne ke liye 'babu' ke baad apna sawal likho!", threadID, messageID);

    const name = await Users.getNameUser(senderID);

    api.sendMessage("🔍 Searching for an answer, please wait...", threadID, messageID);

    try {
        api.setMessageReaction("⌛", messageID, () => { }, true);

        // Google Cloud AI (Gemini API) Configuration
        const geminiApiKey = "AIzaSyBLJasBu3OUFEzFlVI-E1l1O0GXvbk1cxA"; // Apni Gemini API key yahan dalen
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

        // Conversation history ko include karein (sirf last 5 messages)
        if (!conversationHistory[threadID]) {
            conversationHistory[threadID] = [];
        }
        const previousConversation = conversationHistory[threadID];

        // User ka new message add karein (sahi format mein)
        previousConversation.push({
            role: "user", // User ka message
            parts: [{ text: query }]
        });

        // Sirf last 5 messages rakhein
        if (previousConversation.length > 5) {
            previousConversation.shift(); // Sabse purana message remove karein
        }

        console.log("Sending request to Gemini API with:", previousConversation); // Debugging ke liye

        const response = await axios.post(geminiApiUrl, {
            contents: previousConversation
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("Received response from Gemini API:", response.data); // Debugging ke liye

        // Check if response is valid
        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            const geminiResponse = response.data.candidates[0].content.parts[0].text; // Gemini se mila jawab

            // Bot ka response bhi history mein add karein (sahi format mein)
            previousConversation.push({
                role: "model", // Bot ka response
                parts: [{ text: geminiResponse }]
            });

            // Fir se last 5 messages rakhein
            if (previousConversation.length > 5) {
                previousConversation.shift(); // Sabse purana message remove karein
            }

            api.sendMessage(geminiResponse, threadID, messageID); // User ko jawab bhejna
            api.setMessageReaction("✅", messageID, () => { }, true);
        } else {
            throw new Error("Invalid response from API");
        }
    } catch (error) {
        console.error('Error fetching response from Gemini:', error.response ? error.response.data : error.message);
        api.sendMessage(`⚠️ Error: ${error.message}. Please try again later.`, threadID, messageID);
    }
};
