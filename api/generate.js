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
        message: 'Konfigurasi GITHUB_TOKEN atau GITHUB_REPO belum lengkap di Vercel.' 
      });
    }

    console.log(`🚀 Memicu GitHub Actions untuk repository: ${githubRepo}...`);

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
      message: "Berhasil! Proses render video sedang berjalan otomatis di cloud GitHub Actions." 
    });

  } catch (error) {
    console.error("Error API:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
