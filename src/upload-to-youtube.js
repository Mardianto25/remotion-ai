import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import fetch from "node-fetch";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateMetadata() {
  try {
    let transcript = "Renungan harian penyejuk hati dan pengingat diri.";
    if (fs.existsSync("public/transcript.txt")) {
      transcript = fs.readFileSync("public/transcript.txt", "utf-8");
    } else if (fs.existsSync("transcript.txt")) {
      transcript = fs.readFileSync("transcript.txt", "utf-8");
    }

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
  // Sesuaikan path video jika foldernya public/output.mp4 atau output.mp4
  const videoPath = fs.existsSync("public/output.mp4") ? "public/output.mp4" : "public/output-video.mp4";
  if (!fs.existsSync(videoPath)) throw new Error("File video tidak ditemukan di direktori public!");

  console.log("🤖 Membuat metadata dengan AI berdasarkan transkrip...");
  const metadata = await generateMetadata();
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const videoMetadata = {
    snippet: {
      title: metadata.title,
      description: metadata.description,
      tags: ["renungan", "islamic", "shorts", "nasihat", "inspirasi"],
      categoryId: "22" // People & Blogs
    },
    status: {
      privacyStatus: "private",
      publishAt: tomorrow.toISOString(),
      selfDeclaredMadeForKids: false
    }
  };

  console.log("🔑 Mendapatkan Access Token YouTube...");
  const accessToken = await getAccessToken();

  console.log("🚀 Mengupload video ke YouTube...");
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
