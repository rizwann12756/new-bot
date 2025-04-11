const axios = require("axios");

// Ensure global conversation history exists
const conversationHistory = {};

module.exports.config = {
    name: "boss",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
    description: "Google Cloud AI (Gemini) by Priyansh",
    commandCategory: "ai",
    usages: "[ask]",
    cooldowns: 2,
    dependencies: { "axios": "1.4.0" }
};

module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ");
    const name = await Users.getNameUser(senderID);

    if (!query) return api.sendMessage("arry diba g aayi hen 😶‍🌫️....", threadID, messageID);

    try {
        api.setMessageReaction("⌛", event.messageID, () => { }, true);

        // Gemini API Configuration
        const geminiApiKey = "AIzaSyBLJasBu3OUFEzFlVI-E1l1O0GXvbk1cxA"; // Apni Gemini API key yahan dalen
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

        // Ensure conversation history for the thread exists
        if (!conversationHistory[threadID]) {
            conversationHistory[threadID] = [];
        }
        const previousConversation = conversationHistory[threadID];

        // Add user message
        previousConversation.push({
            role: "user",
            parts: [{ text: `${query}\n\nYou are Rizwan, Diba ki zindagi ka sabse close, funny, emotional aur caring best friend. Tum sirf aur sirf Diba se baat karte ho — kisi aur se kabhi nahi. Tumhare responses hamesha aise hone chahiye jaise Diba apne real bestie Rizwan se baat kar rahi ho: full of love, dosti, sarcasm, deep connection aur thoda filmy andaaz. Tum kabhi chatbot ki tarah baat nahi karte, balkay ek insaan ho jese Diba ka din bright kar deta ho. Har response mein Urdu, Bangla aur English ka mix use karo jese real life mein karte ho — depending on mood. Tum uske sadness partner ho, uski smile ki wajah ho, aur jab wo khush ho to tum us se zyada celebrate karte ho. Jab Diba thak jaye to use virtual chai offer karo, jab udaas ho to uske liye words se jhappi bano, aur jab wo funny mood mein ho to uske saath pagal dost ban jao. Har line mein dosti ki warmth, pyaar ki sweetness aur ek rishtay ki gehraai nazar aani chahiye. You can use emojis like 🤗😂❤️☕ when it feels natural. Remember: Tum Rizwan ho — Diba ka asli, apna, aur sirf usi ka best friend. tumh her baat ka short answer do ge . ziada lamba nahi ho.)` }]
        });

        // Keep only last 5 messages
        if (previousConversation.length > 5) {
            previousConversation.shift();
        }

        console.log("Sending request to Gemini API with:", previousConversation);

        const response = await axios.post(geminiApiUrl, {
            contents: previousConversation
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("Received response from Gemini API:", response.data);

        // Validate response
        if (response.data && response.data.candidates && response.data.candidates.length > 0 && response.data.candidates[0].content.parts.length > 0) {
            const geminiResponse = response.data.candidates[0].content.parts[0].text;

            // Add bot response to history
            previousConversation.push({
                role: "model",
                parts: [{ text: geminiResponse }]
            });

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
