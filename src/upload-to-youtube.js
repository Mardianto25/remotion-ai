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

// Fungsi untuk mendapatkan Access Token baru menggunakan Refresh Token
async function getAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
      grant_type: "refresh_token"
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error("Gagal memperbarui Access Token YouTube: " + JSON.stringify(data));
  return data.access_token;
}

async function uploadVideo() {
  const videoPath = "public/output-video.mp4";
  if (!fs.existsSync(videoPath)) throw new Error("File video tidak ditemukan!");

  console.log("🤖 Membuat metadata dengan AI...");
  const metadata = await generateMetadata();
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const videoMetadata = {
    snippet: {
      title: metadata.title,
      description: metadata.description,
      tags: ["shorts", "ai", "remotion"],
      categoryId: "22"
    },
    status: {
      privacyStatus: "private",
      publishAt: tomorrow.toISOString(),
      selfDeclaredMadeForKids: false
    }
  };

  console.log("🔑 Mendapatkan Access Token YouTube...");
  const accessToken = await getAccessToken();

  console.log("upload Mengupload video ke YouTube...");
  const videoStream = fs.createReadStream(videoPath);
  const fileSize = fs.statSync(videoPath).size;

  // 🚀 HIT ENDPOINT YOUTUBE API DISINI
  const uploadResponse = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "multipart/related; boundary=\"foo_bar_baz\""
      },
      body: Buffer.concat([
        Buffer.from(
          `--foo_bar_baz\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
          JSON.stringify(videoMetadata) +
          `\r\n--foo_bar_baz\r\nContent-Type: video/mp4\r\n\r\n`
        ),
        fs.readFileSync(videoPath),
        Buffer.from(`\r\n--foo_bar_baz--`)
      ])
    }
  );

  const result = await uploadResponse.json();
  if (!uploadResponse.ok) {
    throw new Error("Gagal mengupload ke YouTube: " + JSON.stringify(result));
  }

  console.log("✅ Berhasil! Video YouTube terjadwal dengan ID:", result.id);
}

uploadVideo().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
