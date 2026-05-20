import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function generatePrayer({ topic, scripture_reference, news_context }) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Write a heartfelt, scripture-based prayer about: ${topic}

Scripture anchor: ${scripture_reference}

Current events context: ${news_context}

The prayer should:
- Open with praise and acknowledgment of God
- Incorporate the scripture naturally
- Address the current events with faith and hope
- Include specific intercessions for those affected
- Close with declaration of trust in God's sovereignty
- Feel genuine, warm, and Spirit-led (not formulaic)

Format it as a prayer that could be read aloud in a ministry setting.`,
      },
    ],
  });

  return response.content[0].text;
}
