const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");

function deleteAfterTimeout(filePath, timeout = 5000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (!err) {
          console.log(`✅ Deleted file: ${filePath}`);
        } else {
          console.error(`❌ Error deleting file: ${filePath}`);
        }
      });
    }
  }, timeout);
}

module.exports = {
  config: {
    name: "music",
    version: "1.0.4",
    hasPermssion: 0,
    credits: "Mirrykal",
    description: "Download YouTube song from keyword search",
    commandCategory: "Media",
    usages: "[songName]",
    cooldowns: 5,
  },

  run: async function ({ api, event, args }) {
    if (args.length === 0) {
      return api.sendMessage("⚠️ Song ka name likh ker de bai, ab tere dimaag se to nahi nikaal sakta ke kia chaye tujy 😡", event.threadID);
    }

    const songName = args.join(" ");
    const processingMessage = await api.sendMessage(
      `apny babu ke liey song dhund rha hun 😙 thoora sa wait ker bejhta hun🥱😇 "${songName}"...`,
      event.threadID,
      null,
      event.messageID
    );

    try {
      // 🔎 **YouTube पर Search**
      const searchResults = await ytSearch(songName);
      if (!searchResults || !searchResults.videos.length) {
        throw new Error("Appun ko nahi mila tera Search 🔍😿.");
      }

      // 🎵 **टॉप Result का URL**
      const topResult = searchResults.videos[0];
      const videoUrl = `https://www.youtube.com/watch?v=${topResult.videoId}`;

      // 🖥 **API Call to Your YouTube Downloader**
      const apiUrl = `https://arun-music.onrender.com//download?url=${encodeURIComponent(videoUrl)}`;
      const downloadResponse = await axios.get(apiUrl);

      if (!downloadResponse.data.file_url) {
        throw new Error("Download failed. API did not return a file URL.");
      }

      const downloadUrl = downloadResponse.data.file_url.replace("http:", "https:"); // 🛠 Fix http → https

      // 📂 **Set Download Path**
      const downloadDir = path.join(__dirname, "cache");
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      const safeTitle = topResult.title.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${safeTitle}.mp3`;
      const downloadPath = path.join(downloadDir, filename);

      // ⬇️ **Download File**
      const file = fs.createWriteStream(downloadPath);
      await new Promise((resolve, reject) => {
        https.get(downloadUrl, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on("finish", () => {
              file.close(resolve);
            });
          } else {
            reject(new Error(`Failed to download file. Status code: ${response.statusCode}`));
          }
        }).on("error", (error) => {
          fs.unlinkSync(downloadPath);
          reject(new Error(`Error downloading file: ${error.message}`));
        });
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      // 🎧 **Send the MP3 File**
      await api.sendMessage(
        {
          attachment: fs.createReadStream(downloadPath),
          body: `🎶 Title: ${topResult.title}\nHere is your song:`,
        },
        event.threadID,
        event.messageID
      );

      // 🗑 **Auto Delete File After 5 Seconds**
      deleteAfterTimeout(downloadPath, 5000);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      api.sendMessage(`❌ Failed: ${error.message}`, event.threadID, event.messageID);
    }
  },
};
