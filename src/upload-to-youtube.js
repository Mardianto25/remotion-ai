import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import fetch from "node-fetch";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateMetadata() {
  try {
    let transcript = "Video shorts reels otomatis yang menarik.";
    if (fs.existsSync("public/transcript.txt")) {
      transcript = fs.readFileSync("public/transcript.txt", "utf-8");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Buatkan Judul YouTube Shorts yang menarik dan Deskripsi singkat dengan hashtag berdasarkan teks berikut:\n\n${transcript}\n\nFormat output wajib JSON murni: {"title": "Judul di sini", "description": "Deskripsi di sini"}`
    });

    const cleanJson = response.text.trim().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    return {
      title: "Video Reels AI Terbaru #Shorts",
      description: "Video otomatis dibuat menggunakan AI.\n\n#shorts #ai #reels"
    };
  }
}

async function uploadVideo() {
  const videoPath = "public/output-video.mp4";
  if (!fs.existsSync(videoPath)) throw new Error("File video tidak ditemukan!");

  const metadata = await generateMetadata();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  // Payload untuk YouTube Data API v3 (Terjadwal untuk esok hari pukul 10:00)
  const videoMetadata = {
    snippet: {
      title: metadata.title,
      description: metadata.description,
      tags: ["shorts", "ai", "remotion"],
      categoryId: "22"
    },
    status: {
      privacyStatus: "private", // Wajib private untuk video terjadwal
      publishAt: tomorrow.toISOString(),
      selfDeclaredMadeForKids: false
    }
  };

  console.log("✅ Siap di-upload ke YouTube dengan jadwal:", videoMetadata);
}

uploadVideo().catch(err => {
  console.error(err);
  process.exit(1);
});
