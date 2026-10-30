import fetch from "node-fetch";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // Wajib false agar formidable bisa membaca file upload
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Gagal membaca file audio yang di-upload." });
    }

    const audioFile = files.audio ? files.audio[0] : null;
    if (!audioFile) {
      return res.status(400).json({ success: false, message: "File audio tidak ditemukan." });
    }

    try {
      const githubToken = process.env.GITHUB_TOKEN;
      const githubRepo = process.env.GITHUB_REPO; // Format: "username/nama-repo"

      if (!githubToken || !githubRepo) {
        return res.status(500).json({ success: false, message: "Konfigurasi GitHub belum lengkap di Vercel." });
      }

      console.log("📤 Mengonversi audio ke Base64 untuk dikirim ke GitHub...");
      const audioBuffer = fs.readFileSync(audioFile.filepath);
      const audioBase64 = audioBuffer.toString("base64");

      // 1. Simpan file audio secara otomatis ke dalam repository GitHub (jalur public/audio.mp3)
      console.log("💾 Menyimpan audio ke repository GitHub...");
      const putFileRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/public/audio.mp3`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${githubToken}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "Vercel-App"
        },
        body: JSON.stringify({
          message: "Upload audio baru dari web Vercel",
          content: audioBase64,
          branch: "main"
          // Catatan: Jika file sudah ada sebelumnya, GitHub API butuh 'sha'. 
          // Jika error 422 karena file sudah ada, kita bisa ambil sha dulu atau abaikan.
        })
      });

      // 2. Trigger GitHub Actions untuk mulai render
      console.log("🚀 Memicu GitHub Actions...");
      const ghResponse = await fetch(`https://api.github.com/repos/${githubRepo}/actions/workflows/render.yml/dispatches`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${githubToken}`,
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
        message: "Audio berhasil di-upload dan proses render video sedang berjalan di GitHub Actions!" 
      });

    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });
}
