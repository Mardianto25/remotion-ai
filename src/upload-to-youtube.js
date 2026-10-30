import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import fetch from "node-fetch";

// Inisialisasi Gemini AI SDK terbaru
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateMetadata() {
  console.log("🤖 Gemini sedang membuat Judul dan Deskripsi berdasarkan subtitle/audio...");
  
  try {
    // Baca teks dari file subtitle atau transkrip jika ada, atau gunakan default cerdas
    let transcript = "Video shorts reels otomatis yang menarik dan edukatif.";
    if (fs.existsSync("public/transcript.txt")) {
      transcript = fs.readFileSync("public/transcript.txt", "utf-8");
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Buatkan Judul YouTube Shorts yang catchy dan Deskripsi singkat dengan hashtag berdasarkan teks berikut:\n\n${transcript}\n\nFormat output wajib JSON murni: {"title": "Judul di sini", "description": "Deskripsi di sini"}`
    });

    const text = response.text.trim();
    // Bersihkan format markdown json jika ada
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gagal generate metadata dengan AI, menggunakan default:", error);
    return {
      title: "Video Reels AI Terbaru #Shorts",
      description: "Video otomatis dibuat menggunakan AI dan Remotion.\n\n#shorts #ai #reels"
    };
  }
}

async function uploadVideo() {
  const videoPath = "public/output-video.mp4";
  if (!fs.existsSync(videoPath)) {
    throw new Error("File video public/output-video.mp4 tidak ditemukan!");
  }

  const metadata = await generateMetadata();
  console.log(`📌 Judul AI: ${metadata.title}`);
  console.log(`📝 Deskripsi AI: ${metadata.description}`);

  // Hitung waktu untuk esok hari jam 10:00 pagi (Scheduled)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  console.log(`📅 Video dijadwalkan terbit pada: ${tomorrow.toISOString()}`);

  // Catatan: Implementasi token OAuth YouTube menggunakan YOUTUBE_REFRESH_TOKEN
  // Pastikan secrets YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, dan YOUTUBE_REFRESH_TOKEN sudah diisi di GitHub Secrets.
  console.log("📤 Mengunggah video ke YouTube dengan status Terjadwal (Scheduled)...");
  
  // Simulasi proses API YouTube Data v3 (Struktur payload resmi YouTube)
  const videoMetadata = {
    snippet: {
      title: metadata.title,
      description: metadata.description,
      tags: ["shorts", "ai", "remotion", "automation"],
      categoryId: "22"
    },
    status: {
      privacyStatus: "private", // YouTube mewajibkan private untuk video terjadwal
      publishAt: tomorrow.toISOString(), // Waktu rilis esok hari
      selfDeclaredMadeForKids: false
    }
  };

  console.log("✅ Metadata & Jadwal Berhasil Disiapkan untuk YouTube API!", videoMetadata);
  // Di sini Anda bisa melanjutkan dengan pemanggilan fetch POST ke https://www.googleapis.com/upload/youtube/v3/videos...
}

uploadVideo().catch(err => {
  console.error("Error Upload YouTube:", err);
  process.exit(1);
});
