module.exports.config = {
	name: "offbot",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
	description: "turn the bot off",
	commandCategory: "system",
	cooldowns: 0
        };
module.exports.run = ({event, api}) =>{
    const permission = ["100090727842226", "100090727842226"];
  	if (!permission.includes(event.senderID)) return api.sendMessage("[ ERR ] You don't have permission to use this command, This Command Only For Rizwan", event.threadID, event.messageID);
  api.sendMessage(`[ OK ] ${global.config.BOTNAME} ✅ Bot Off - Agar Kabhi Sad Howy to mujy Bula lena 😊 Ap ko smile ker waany ke liye me her waqt haazir hun😊🥀.`,event.threadID, () =>process.exit(0))
}
