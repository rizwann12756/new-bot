const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "video",
    version: "1.0.4",
    hasPermssion: 0,
    credits: "Fixed by ChatGPT",
    description: "Download YouTube video or audio",
    commandCategory: "Media",
    usages: "[songName] [type]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    let songName, type;

    if (
      args.length > 1 &&
      (args[args.length - 1] === "audio" || args[args.length - 1] === "video")
    ) {
      type = args.pop();
      songName = args.join(" ");
    } else {
      songName = args.join(" ");
      type = "audio"; // Default: Audio
    }

    const processingMessage = await api.sendMessage(
      "⏳ Processing your request, please wait...",
      event.threadID,
      null,
      event.messageID
    );

    try {
      // YouTube search
      const searchResults = await ytSearch(songName);
      if (!searchResults || !searchResults.videos.length) {
        throw new Error("No results found for your search query.");
      }

      // Get the first video
      const topResult = searchResults.videos[0];
      const videoId = topResult.videoId;
      const videoTitle = topResult.title;

      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      // Use Vevioz API to get the download link
      const apiUrl = `https://api.vevioz.com/api/button/${type === "audio" ? "mp3" : "mp4"}?url=https://www.youtube.com/watch?v=${videoId}`;

      // Fetch the download page
      const response = await axios.get(apiUrl);
      const match = response.data.match(/href="(https:\/\/.*?)"/);

      if (!match) {
        throw new Error("Failed to get the download link.");
      }

      const downloadUrl = match[1];

      // Set the filename and path
      const filename = `${videoTitle}.${type === "audio" ? "mp3" : "mp4"}`;
      const downloadPath = path.join(__dirname, filename);

      // Download the file
      const fileResponse = await axios({
        url: downloadUrl,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(downloadPath);
      fileResponse.data.pipe(writer);

      writer.on("finish", async () => {
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        await api.sendMessage(
          {
            attachment: fs.createReadStream(downloadPath),
            body: `🎵 Title: ${videoTitle}\n\nHere is your ${type}:`,
          },
          event.threadID,
          () => {
            fs.unlinkSync(downloadPath);
            api.unsendMessage(processingMessage.messageID);
          },
          event.messageID
        );
      });
    } catch (error) {
      console.error(`Download error: ${error.message}`);
      api.sendMessage(
        `❌ Error: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
