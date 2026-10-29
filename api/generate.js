import { GoogleGenAI } from "@google/genai";
import fetch from "node-fetch";
import formidable from "formidable";
import fs from "fs";

// Konfigurasi API Client Gemini terbaru
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // Format: "username-anda/nama-repo"

// Matikan body parser bawaan Vercel agar formidable bisa membaca file binary multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Fungsi helper untuk mengambil gambar dari Pixabay berdasarkan keyword
async function getPixabayImage(keyword) {
  try {
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(keyword)}&image_type=photo&orientation=vertical&safesearch=true&per_page=3`;
    const res = await fetch(url);
    if (!res.ok) return "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop";

    const data = await res.json();
    if (data.hits && data.hits.length > 0) {
      return data.hits[0].largeImageURL;
    }
  } catch (e) {
    console.error("Gagal mengambil gambar dari Pixabay:", e);
  }
  return "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop";
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Parsing file yang di-upload menggunakan formidable
  const form = new formidable.IncomingForm();
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Gagal mengunggah file audio." });
    }

    const audioFile = files.audio ? files.audio[0] : null;
    if (!audioFile) {
      return res.status(400).json({ success: false, message: "File audio tidak ditemukan." });
    }

    try {
      console.log("🎙️ Membaca file audio & mengirim ke Gemini AI...");
      const audioBuffer = fs.readFileSync(audioFile.filepath);
      const audioBase64 = audioBuffer.toString("base64");

      // 1. Proses Transkripsi & Keyword dengan Gemini 1.5 Flash
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            inlineData: {
              mimeType: "audio/mp3",
              data: audioBase64
            }
          },
          {
            text: "Dengarkan audio ini, lalu buat transkrip teks per kalimat. Untuk setiap kalimat, berikan juga satu kata kunci (keyword) bahasa Inggris yang sangat spesifik tentang pemandangan/alam yang cocok dengan isi kalimat tersebut (contoh: 'mountain', 'rain', 'forest', 'city'). Format output HARUS JSON array murni: [{\"start\": 0, \"end\": 5, \"text\": \"...\", \"keyword\": \"...\"}]"
          }
        ]
      });

      let rawText = response.text.trim();
      rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const transcriptions = JSON.parse(rawText);

      console.log("🖼️ Mengambil gambar dari Pixabay berdasarkan tema...");
      const finalSubtitles = [];

      for (const item of transcriptions) {
        const imageUrl = await getPixabayImage(item.keyword);
        finalSubtitles.push({
          start: item.start,
          end: item.end,
          text: item.text,
          image: imageUrl
        });
      }

      // 2. Trigger GitHub Actions untuk mulai render video di Cloud
      console.log("🚀 Memicu GitHub Actions untuk rendering video...");
      const ghResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/render.yml/dispatches`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GITHUB_TOKEN}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ref: "main" })
      });

      if (!ghResponse.ok) {
        throw new Error("Gagal memicu GitHub Actions.");
      }

      return res.status(200).json({ 
        success: true, 
        message: "Audio berhasil diproses! Transkripsi & gambar tematik selesai. Proses render video sedang berjalan di GitHub Actions.",
        subtitles: finalSubtitles
      });

    } catch (error) {
      console.error("Error processing request:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });
}
