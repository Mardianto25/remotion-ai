import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function test() {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 100,
      messages: [{ role: "user", content: "Halo Claude, balas dengan satu kalimat jika kamu aktif!" }]
    });
    console.log("Respon dari Claude:", response.content[0].text);
  } catch (error) {
    console.log("Error:", error.message);
  }
}

test();
