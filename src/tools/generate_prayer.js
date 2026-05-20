import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function generatePrayer({ headline, post }) {
  console.log('🙏 Generating intercessory prayer...');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `You are a ministry prayer writer. Write a short intercessory prayer based on the following context.

News headline: ${headline}

Ministry post: ${post}

Write exactly this JSON structure with no extra text:
{
  "prayer": "<3-5 sentences, intercessory, compassionate, personal, faith-filled. Opens addressing God. Intercedes for those affected by the news. Closes with trust in God's sovereignty.>"
}

Rules:
- 3-5 sentences only
- Compassionate and personal, not generic
- Never political
- Grounded in faith and hope`,
      },
    ],
  });

  const raw = response.content[0].text.trim();

  try {
    const parsed = JSON.parse(raw);
    console.log('🙏 Prayer generated');
    return { prayer: parsed.prayer };
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return { prayer: parsed.prayer };
    }
    throw new Error('generate_prayer: could not parse JSON from model response');
  }
}
