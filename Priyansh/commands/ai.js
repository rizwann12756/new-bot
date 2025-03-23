const axios = require("axios");

// Conversation history store karne ke liye (sirf last 5 messages)
const conversationHistory = {};

module.exports.config = {
    name: "ai",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Google Cloud AI (Gemini) by Priyansh",
    commandCategory: "ai",
    usages: "[ask]",
    cooldowns: 2,
    dependencies: {
        "axios": "1.4.0"
    }
};

module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" "); // User ka input
    const name = await Users.getNameUser(senderID);

    // Agar message "babu" se start ho raha hai
    if (event.body.toLowerCase().startsWith("babu")) {
        const userQuery = event.body.slice(4).trim(); // "babu" ko remove karein
        if (!userQuery) return api.sendMessage("Yes, how can I help you?", threadID, messageID);

        api.sendMessage("Searching for an answer, please wait...", threadID, messageID);

        try {
            api.setMessageReaction("⌛", event.messageID, () => { }, true);

            // Google Cloud AI (Gemini API) Configuration
            const geminiApiKey = "AIzaSyBLJasBu3OUFEzFlVI-E1l1O0GXvbk1cxA"; // Apni Gemini API key yahan dalen
            const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

            // Conversation history ko include karein (sirf last 5 messages)
            if (!conversationHistory[threadID]) {
                conversationHistory[threadID] = [];
            }
            const previousConversation = conversationHistory[threadID];

            // User ka new message add karein
            previousConversation.push({ parts: [{ text: userQuery }] });

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

                // Bot ka response bhi history mein add karein
                previousConversation.push({ parts: [{ text: geminiResponse }] });

                // Fir se last 5 messages rakhein
                if (previousConversation.length > 5) {
                    previousConversation.shift(); // Sabse purana message remove karein
                }

                api.sendMessage(geminiResponse, threadID, messageID); // User ko jawab bhejna
                api.setMessageReaction("✅", event.messageID, () => { }, true);
            } else {
                throw new Error("Invalid response from API");
            }
        } catch (error) {
            console.error('Error fetching response from Gemini:', error.response ? error.response.data : error.message);
            api.sendMessage(`An error occurred: ${error.message}. Please try again later.`, threadID, messageID);
        }
    } else {
        console.log("Message does not start with 'babu'"); // Debugging ke liye
    }
};
