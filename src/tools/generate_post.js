import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function generatePost({ headline, scripture }) {
  console.log('✍️  Generating ministry posts...');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a ministry social media writer. Based on the news headline and scripture below, write two posts.

Headline: ${headline}

Scripture: ${scripture.reference} — "${scripture.text}"

Write exactly this JSON structure with no extra text:
{
  "short_post": "<under 280 characters, hopeful, faith-filled, ends with 2 relevant hashtags>",
  "long_post": "<150-300 words, warm ministry tone, connects the headline to the scripture, ends with an invitation to prayer>"
}

Rules:
- Never be political or partisan
- Always be redemptive and hopeful
- The short_post must be under 280 characters including hashtags
- The long_post must be 150-300 words`,
      },
    ],
  });

  const raw = response.content[0].text.trim();

  try {
    const parsed = JSON.parse(raw);
    console.log(`✍️  short_post: ${parsed.short_post?.length} chars | long_post: ${parsed.long_post?.split(' ').length} words`);
    return { short_post: parsed.short_post, long_post: parsed.long_post };
  } catch {
    // Extract JSON from response if wrapped in markdown
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return { short_post: parsed.short_post, long_post: parsed.long_post };
    }
    throw new Error('generate_post: could not parse JSON from model response');
  }
}
