import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Inisialisasi Gemini API (pastikan API key sudah diset di environment variable / .env)
const ai = new GoogleGenAI();

async function generateVideoData() {
  const prompt = `Buatkan naskah video pendek (3 adegan) bertema renungan atau motivasi hidup. 
  Setiap adegan harus memiliki:
  1. "title" (judul singkat adegan)
  2. "text" (kalimat renungan yang mendalam, maksimal 15 kata)
  3. "keyword" (satu kata kunci bahasa Inggris untuk latar belakang foto estetis pemandangan/alam, misal: "mountains", "forest", "sunset")
  
  Format output HARUS berupa JSON array murni tanpa teks lain:
  [
    {"title": "...", "text": "...", "keyword": "..."},
    {"title": "...", "text": "...", "keyword": "..."},
    {"title": "...", "text": "...", "keyword": "..."}
  ]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    let rawText = response.text.trim();
    // Bersihkan jika ada format markdown block code
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    const scenes = JSON.parse(rawText);
    
    // Simpan data ke file JSON lokal agar bisa dibaca oleh Remotion
    fs.writeFileSync("./src/video-data.json", JSON.stringify(scenes, null, 2));
    console.log("Berhasil! Naskah dan tema visual AI telah dibuat.");
  } catch (error) {
    console.error("Gagal men-generate data dari AI:", error);
  }
}

generateVideoData();
