import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const ai = new GoogleGenAI();
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || "43025440-ce5244c9d4ef4dfbc86ef45fe";

async function getPixabayImage(keyword) {
  try {
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(keyword)}&image_type=photo&orientation=vertical&safesearch=true&per_page=3`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.hits && data.hits.length > 0) {
      return data.hits[0].largeImageURL;
    }
  } catch (e) {
    console.error("Gagal mengambil gambar dari Pixabay:", e);
  }
  return "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop";
}

async function generateVideoData() {
  console.log("🚀 [1/4] Meminta naskah dari Gemini AI...");

  const prompt = `Buatkan naskah video pendek (3 adegan) bertema renungan atau motivasi hidup. 
  Setiap adegan harus memiliki:
  1. "title" (judul singkat adegan)
  2. "text" (kalimat renungan yang mendalam, maksimal 15 kata)
  3. "keyword" (satu kata kunci bahasa Inggris tunggal yang spesifik untuk latar foto pemandangan/alam, misal: "nature", "mountain", "forest", "sunset")
  
  Format output HARUS berupa JSON array murni tanpa teks lain:
  [
    {"title": "...", "text": "...", "keyword": "..."},
    {"title": "...", "text": "...", "keyword": "..."},
    {"title": "...", "text": "...", "keyword": "..."}
  ]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Menggunakan model yang stabil
      contents: prompt,
    });

    let rawText = response.text.trim();
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiScenes = JSON.parse(rawText);

    console.log("🖼️ [2/4] Mencari gambar latar otomatis dari Pixabay berdasarkan keyword AI...");

    const finalScenes = [];
    for (const scene of aiScenes) {
      console.log(`- Mencari gambar untuk keyword: "${scene.keyword}"`);
      const imageUrl = await getPixabayImage(scene.keyword);
      finalScenes.push({
        title: scene.title,
        text: scene.text,
        image: imageUrl
      });
    }
    
    // Simpan ke video-data.json
    fs.writeFileSync("./src/video-data.json", JSON.stringify(finalScenes, null, 2));
    console.log("✅ [3/4] Sukses! File './src/video-data.json' siap digunakan.");

    // 📄 BUAT FILE TRANSKRIP OTOMATIS UNTUK YOUTUBE UPLOAD
    if (!fs.existsSync("public")) {
      fs.mkdirSync("public", { recursive: true });
    }
    const fullTranscript = finalScenes.map(scene => scene.text).join(" ");
    fs.writeFileSync("public/transcript.txt", fullTranscript, "utf-8");
    console.log("📄 [4/4] Sukses! File 'public/transcript.txt' berhasil dibuat.");

  } catch (error) {
    console.error("❌ Terjadi kesalahan:", error);
  }
}

generateVideoData();
