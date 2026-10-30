
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

// Inisialisasi Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Konfigurasi OAuth2 Client menggunakan kredensial dari Environment Variables
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
});

const youtube = google.youtube({
  version: "v3",
  auth: oauth2Client,
});

/**
 * Fungsi untuk menghasilkan Judul & Deskripsi otomatis berdasarkan transkrip renungan Islami
 */
async function generateMetadata() {
  try {
    let transcript = "Renungan harian penyejuk hati dan pengingat diri.";
    
    // Cek lokasi file transkrip
    if (fs.existsSync("public/transcript.txt")) {
      transcript = fs.readFileSync("public/transcript.txt", "utf-8");
    } else if (fs.existsSync("transcript.txt")) {
      transcript = fs.readFileSync("transcript.txt", "utf-8");
    }

    console.log("📄 Memproses transkrip untuk metadata...");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Berdasarkan teks transkrip renungan Islami berikut, buatkan Judul YouTube Shorts yang menyentuh hati dan relevan, serta Deskripsi singkat yang berisi hikmah atau renungan beserta hashtag yang sesuai:\n\n${transcript}\n\nPENTING: Jangan pernah mencantumkan kata "AI", "Remotion", atau sejenisnya di dalam judul maupun deskripsi. Gunakan bahasa yang natural seperti buatan manusia.\n\nFormat output wajib JSON murni tanpa markdown lain: {"title": "Judul di sini", "description": "Deskripsi di sini"}`
    });

    const rawText = response.text.trim();
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    return {
      title: parsed.title || "Renungan Harian Islami #Shorts",
      description: parsed.description || "Semoga bermanfaat dan menjadi pengingat kebaikan.\n\n#renungan #islamic #shorts"
    };
  } catch (error) {
    console.error("⚠️ Gagal generate metadata dengan AI, menggunakan default:", error);
    return {
      title: "Renungan Harian Islami #Shorts",
      description: "Semoga bermanfaat dan menjadi pengingat kebaikan.\n\n#renungan #islamic #shorts"
    };
  }
}

async function uploadVideo() {
  try {
    const videoPath = path.join(process.cwd(), "public", "output.mp4");
    
    if (!fs.existsSync(videoPath)) {
      throw new Error("File video output.mp4 tidak ditemukan di direktori public!");
    }

    console.log("🤖 Menyiapkan metadata dengan AI...");
    const metadata = await generateMetadata();

    console.log("🔑 Mendapatkan Access Token YouTube...");
    const { token } = await oauth2Client.getAccessToken();
    if (!token) {
      throw new Error("Gagal memperbarui Access Token YouTube.");
    }

    // Jadwalkan tayang besok atau atur sesuai kebutuhan
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const videoMetadata = {
      snippet: {
        title: metadata.title,
        description: metadata.description,
        tags: ["renungan", "islamic", "shorts", "nasihat", "inspirasi"],
        categoryId: "22" // Kategori People & Blogs
      },
      status: {
        privacyStatus: "private", // Atur private untuk video terjadwal
        publishAt: tomorrow.toISOString(),
        selfDeclaredMadeForKids: false
      }
    };

    console.log(`🚀 Mengunggah video: "${metadata.title}"...`);

    const res = await youtube.videos.insert({
      part: "snippet,status",
      requestBody: videoMetadata,
      media: {
        body: fs.createReadStream(videoPath),
      },
    });

    console.log("✅ Berhasil mengunggah video! ID Video:", res.data.id);
  } catch (error) {
    console.error("❌ Error saat mengunggah video ke YouTube:", error);
    process.exit(1);
  }
}

uploadVideo();
