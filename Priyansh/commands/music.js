const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "song", // Command name set as "song"
    version: "2.0.2",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Download YouTube song or video",
    commandCategory: "Media",
    usages: "[songName] [optional: video]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    // Make sure the command starts with ".song"
    if (!event.body.startsWith(".song")) {
      return; // Do nothing if it's not a .song command
    }

    let songName, type;

    // Command argument parsing: If 'audio' or 'video' is provided, set the type
    if (
      args.length > 1 &&
      (args[args.length - 1] === "audio" || args[args.length - 1] === "video")
    ) {
      type = args.pop(); // Get the last argument as type (audio/video)
      songName = args.join(" "); // Join the rest of the args as song name
    } else {
      songName = args.join(" "); // Join all args as song name
      type = "audio"; // Default to audio if no type is specified
    }

    const processingMessage = await api.sendMessage(
      `🔍 Searching for "${songName}"... Please wait! 😏`,
      event.threadID,
      null,
      event.messageID
    );

    try {
      // Search for the song on YouTube using yt-search
      const searchResults = await ytSearch(songName);
      if (!searchResults || !searchResults.videos.length) {
        throw new Error("No results found for your search query.");
      }

      // Get the top result from the search
      const topResult = searchResults.videos[0];
      const videoId = topResult.videoId;

      // Construct API URL for downloading the song using your render API
      const apiUrl = `https://music-hax2.onrender.com/download?url=https://www.youtube.com/watch?v=${videoId}&type=${type}`;

      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      // Get the direct download URL from the API
      const downloadResponse = await axios.get(apiUrl);
      const downloadUrl = downloadResponse.data.file_url;

      if (!downloadUrl) {
        throw new Error("Download URL not found.");
      }

      // Set the filename based on the song title and type
      const safeTitle = topResult.title.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${safeTitle}.${type === "audio" ? "mp3" : "mp4"}`;
      const downloadPath = path.join(__dirname, filename);

      // Download the media file
      const file = fs.createWriteStream(downloadPath);
      const response = await axios.get(downloadUrl, { responseType: "stream" });

      response.data.pipe(file);

      // Wait for the download to finish
      file.on("finish", () => {
        file.close();
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        // Send the media file to the user
        api.sendMessage(
          {
            attachment: fs.createReadStream(downloadPath),
            body: `🎵 **Title:** ${topResult.title}\n\nHere is your ${type === "audio" ? "audio" : "video"} 🎧:`,
          },
          event.threadID,
          () => {
            fs.unlinkSync(downloadPath); // Clean up after sending the file
            api.unsendMessage(processingMessage.messageID); // Remove the processing message
          },
          event.messageID
        );
      });

    } catch (error) {
      console.error(`Failed to download and send song: ${error.message}`);
      api.sendMessage(
        `❌ Failed to download song: ${error.message} 😢`,
        event.threadID,
        event.messageID
      );
    }
  },
};
