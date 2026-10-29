import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI();

async function transcribeAudio() {
  console.log("🎙️ Memproses file audio untuk dijadikan teks...");

  // Baca file audio dari folder public/audio.mp3 (atau path file Anda)
  const audioFilePath = "./public/audio.mp3";
  
  if (!fs.existsSync(audioFilePath)) {
    console.error("❌ File audio tidak ditemukan di ./public/audio.mp3");
    return;
  }

  // Konversi file audio ke format buffer / base64 untuk dikirim ke Gemini
  const audioBuffer = fs.readFileSync(audioFilePath);
  const audioBase64 = audioBuffer.toString("base64");

  try {
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
          text: "Dengarkan audio ini, lalu ubah menjadi transkrip teks. Berikan hasilnya dalam format JSON array yang memuat daftar potongan kalimat beserta estimasi waktu mulai (start) dan selesainya (end) dalam detik, dengan format: [{\"start\": 0, \"end\": 5, \"text\": \"...\"}]"
        }
      ]
    });

    let rawText = response.text.trim();
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    // Simpan hasil transkrip ke file JSON subtitle
    fs.writeFileSync("./src/subtitles.json", rawText);
    console.log("✅ Sukses! File './src/subtitles.json' berhasil dibuat dari audio.");
  } catch (error) {
    console.error("❌ Gagal melakukan transkripsi audio:", error);
  }
}

transcribeAudio();
