import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO;

    const ghResponse = await fetch(`https://api.github.com/repos/${githubRepo}/actions/workflows/upload-yt.yml/dispatches`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${githubToken}`, "Accept": "application/vnd.github.v3+json", "Content-Type": "application/json" },
      body: JSON.stringify({ ref: "main" })
    });

    if (!ghResponse.ok) throw new Error("Gagal memicu workflow YouTube.");

    return res.status(200).json({ success: true, message: "Upload YouTube diproses!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
