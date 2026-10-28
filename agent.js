import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Masukkan API Key Claude Anda
});

async function runAgent(promptText) {
  console.log("🤖 Claude Agent sedang berpikir dan merancang kode video...");

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [{ role: "user", content: `Bertindaklah sebagai Remotion Developer Expert. Berikan kode lengkap komponen React TypeScript untuk video berdasarkan instruksi ini: "${promptText}". Berikan HANYA format kodenya saja di dalam blok kode tanpa penjelasan teks lain.` }]
  });

  const codeContent = response.content[0].text;
  // Ekstrak dan simpan otomatis ke file project
  const targetPath = path.join(process.cwd(), 'src', 'MyVideo.tsx');
  fs.writeFileSync(targetPath, codeContent);
  console.log("✅ Berhasil! Claude Agent telah menulis kode video ke src/MyVideo.tsx");
}

// Ambil argumen dari terminal
const userPrompt = process.argv[2];
if (userPrompt) {
  runAgent(userPrompt);
} else {
  console.log("❌ Masukkan instruksi, contoh: node agent.js 'buat animasi teks intro'");
}
