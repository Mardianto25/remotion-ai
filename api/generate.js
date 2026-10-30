import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO; // Format: "username-anda/nama-repo"

    if (!githubToken || !githubRepo) {
      return res.status(500).json({ 
        success: false, 
        message: 'Konfigurasi GITHUB_TOKEN atau GITHUB_REPO belum lengkap.' 
      });
    }

    console.log("🧹 Menghapus file video lama agar tidak terjadi cache...");
    
    // 1. Ambil SHA file lama jika ada, lalu hapus agar web tidak membaca video lama
    const getFileRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/public/output-video.mp4`, {
      headers: { "Authorization": `Bearer ${githubToken}`, "Accept": "application/vnd.github.v3+json" }
    });
    
    if (getFileRes.ok) {
      const fileData = await getFileRes.json();
      await fetch(`https://api.github.com/repos/${githubRepo}/contents/public/output-video.mp4`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${githubToken}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "Hapus video lama sebelum render baru",
          sha: fileData.sha,
          branch: "main"
        })
      });
    }

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
      const errText = await ghResponse.text();
      throw new Error(`Gagal dari GitHub API: ${errText}`);
    }

    return res.status(200).json({ 
      success: true, 
      message: "Render dimulai! Video lama dibersihkan." 
    });

  } catch (error) {
    console.error("Error API:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
