const axios = require("axios");

module.exports.config = {
    name: "ai",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Priyansh Rajput",
    description: "ChatGPT AI",
    commandCategory: "ai",
    usages: "[ask]",
    cooldowns: 2,
    dependencies: {
        "axios": "1.4.0"
    }
};

module.exports.run = async function ({ api, event, args, Users }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) {
        return api.sendMessage("Please type a message...", threadID, messageID);
    }

    api.sendMessage("Searching for an answer, please wait...", threadID, messageID);

    try {
        api.setMessageReaction("⌛", event.messageID, () => {}, true);

        const res = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: query }]
            },
            {
                headers: {
                    "Authorization": `Bearer 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`, // 🔴 API key yahan add ki hai
                    "Content-Type": "application/json"
                }
            }
        );

        const reply = res.data.choices[0].message.content;

        api.sendMessage(reply, threadID, messageID);
        api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (error) {
        console.error("Error fetching ChatGPT response:", error.response ? error.response.data : error.message);
        api.sendMessage("An error occurred while fetching data. Please try again later.", threadID, messageID);
    }
};
