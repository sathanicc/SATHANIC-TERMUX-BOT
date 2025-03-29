// bot.js - WhatsApp Bot for Termux

const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys"); const axios = require("axios"); const fs = require("fs"); const qrcode = require("qrcode-terminal");

async function startBot() { const { state, saveCreds } = await useMultiFileAuthState("./session"); const sock = makeWASocket({ auth: state, printQRInTerminal: true, });

sock.ev.on("creds.update", saveCreds);
sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") console.log("[+] Bot Connected Successfully!");
    if (connection === "close") console.log("[-] Disconnected! Reconnecting...");
});

sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (text) {
        console.log(`Message from ${sender}: ${text}`);
        
        if (text.toLowerCase() === "hi") {
            await sock.sendMessage(sender, { text: "Hello! I am your WhatsApp bot 🤖" });
        }
        else if (text.toLowerCase().startsWith("ai")) {
            const query = text.replace("ai", "").trim();
            const response = await axios.get(`https://api.openai.com/v1/engines/gpt-3.5-turbo/completions`, {
                headers: { "Authorization": "Bearer YOUR_OPENAI_API_KEY" },
                data: { prompt: query, max_tokens: 50 }
            });
            await sock.sendMessage(sender, { text: response.data.choices[0].text.trim() });
        }
    }
});

}

startBot();

