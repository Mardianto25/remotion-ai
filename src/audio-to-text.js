import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI();
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || "43025440-ce5244c9d4ef4dfbc86ef45fe";

// async function getPixabayImage(keyword) {
//   try {
//     const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(keyword)}&image_type=photo&orientation=vertical&safesearch=true&per_page=3`;
//     const res = await fetch(url);
//     const data = await res.json();
    
//     if (data.hits && data.hits.length > 0) {
//       return data.hits[0].largeImageURL;
//     }
//   } catch (e) {
//     console.error("Gagal mengambil gambar dari Pixabay:", e);
//   }
//   return "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop";
// }

async function getPixabayImage(keyword) {
  try {
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(keyword)}&image_type=photo&orientation=vertical&safesearch=true&per_page=3`;
    const res = await fetch(url);
    
    // Cek apakah status dari server sukses (OK / 200)
    if (!res.ok) {
      console.error(`⚠️ Pixabay API mengembalikan status error: ${res.status}`);
      return "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop";
    }

    const data = await res.json();
    
    if (data.hits && data.hits.length > 0) {
      return data.hits[0].largeImageURL;
    }
  } catch (e) {
    console.error("Gagal mengambil gambar dari Pixabay:", e.message);
  }
  
  // Fallback gambar default jika gagal / API Key belum diisi
  return "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920&fit=crop";
}


async function transcribeAndFetchImages() {
  console.log("🎙️ Mendengarkan audio dan menganalisis tema dengan Gemini AI...");

  const audioFilePath = "./public/audio.mp3";
  if (!fs.existsSync(audioFilePath)) {
    console.error("❌ File audio tidak ditemukan di ./public/audio.mp3");
    return;
  }

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
          text: "Dengarkan audio ini, lalu buat transkrip teks per kalimat. Untuk setiap kalimat, berikan juga satu kata kunci (keyword) bahasa Inggris yang sangat spesifik tentang pemandangan/alam yang cocok dengan isi kalimat tersebut (contoh: 'mountain', 'rain', 'forest', 'city'). Format output HARUS JSON array murni: [{\"start\": 0, \"end\": 5, \"text\": \"...\", \"keyword\": \"...\"}]"
        }
      ]
    });

    let rawText = response.text.trim();
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const transcriptions = JSON.parse(rawText);

    console.log("🖼️ Mengambil gambar dari Pixabay berdasarkan tema audio...");
    const finalSubtitles = [];

    for (const item of transcriptions) {
      console.log(`- Mencari gambar untuk tema: "${item.keyword}"`);
      const imageUrl = await getPixabayImage(item.keyword);
      finalSubtitles.push({
        start: item.start,
        end: item.end,
        text: item.text,
        image: imageUrl
      });
    }

    // Simpan ke subtitles.json yang sudah lengkap dengan URL gambar tematik
    fs.writeFileSync("./src/subtitles.json", JSON.stringify(finalSubtitles, null, 2));
    console.log("✅ Sukses! File './src/subtitles.json' siap dengan gambar sesuai tema audio.");
  } catch (error) {
    console.error("❌ Gagal memproses audio:", error);
  }
}

transcribeAndFetchImages();
