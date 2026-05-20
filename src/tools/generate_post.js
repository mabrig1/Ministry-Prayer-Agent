import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function generatePost({ scripture, news_context, tone, platform }) {
  const limits = { twitter: 280, instagram: 2200, facebook: 63206 };
  const maxLength = limits[platform] || 500;

  const platformGuidelines = {
    twitter: 'Keep it under 280 characters. Use 1-2 relevant hashtags. Be punchy and direct.',
    instagram: 'Can be longer and more personal. Use 5-10 hashtags at the end. Tell a story.',
    facebook: 'Conversational and warm. Encourage engagement with a question. Medium length.',
  };

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Create an engaging ${tone} social media post for ${platform}.

Scripture: ${scripture}

Current Events Context: ${news_context}

Platform guidelines: ${platformGuidelines[platform] || 'Keep it engaging and appropriate.'}
Max length: ${maxLength} characters

The post should connect the scripture to the current events in a meaningful, Spirit-led way. Make it authentic and shareable.`,
      },
    ],
  });

  return response.content[0].text;
}
