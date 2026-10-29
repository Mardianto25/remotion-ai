import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { exec } from "child_process";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/out", express.static("out"));

// Konfigurasi penyimpanan file audio yang di-upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/");
  },
  filename: (req, file, cb) => {
    cb(null, "audio.mp3"); // Selalu simpan dengan nama audio.mp3
  }
});
const upload = multer({ storage: storage });

// Endpoint untuk Upload Audio & Trigger Proses Otomatis
app.post("/api/generate", upload.single("audio"), (req, res) => {
  console.log("🎙️ Audio berhasil di-upload oleh pengguna!");

  // Jalankan skrip audio-to-text & pencarian gambar Pixabay
  exec("node src/audio-to-text.js", (err, stdout, stderr) => {
    if (err) {
      console.error("Gagal memproses AI:", stderr);
      return res.status(500).json({ success: false, message: "Gagal memproses AI & Gambar." });
    }

    console.log("🎬 Memulai rendering video dengan Remotion...");
    // Jalankan perintah render video Remotion
    exec("npx remotion render MultiSceneVideo out/video.mp4", (renderErr, renderStdout, renderStderr) => {
      if (renderErr) {
        console.error("Gagal render video:", renderStderr);
        return res.status(500).json({ success: false, message: "Gagal melakukan rendering video." });
      }

      console.log("✅ Video berhasil dirender!");
      res.json({ success: true, videoUrl: "/out/video.mp4" });
    });
  });
});

app.listen(3000, () => {
  console.log("🚀 Server Frontend & Backend aktif di http://localhost:3000");
});
