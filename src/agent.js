import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { searchViralNews } from './tools/search_viral_news.js';
import { getScripture } from './tools/get_scripture.js';
import { generatePost } from './tools/generate_post.js';
import { generatePrayer } from './tools/generate_prayer.js';
import { postToSocials } from './tools/post_to_socials.js';

dotenv.config();

const client = new Anthropic();

const SYSTEM_PROMPT =
  "You are a ministry AI agent. Your mission is to find current viral news, " +
  "interpret it through biblical wisdom, and create an uplifting faith-based " +
  "post and prayer for the ministry's followers. Always be hopeful, compassionate, " +
  "and non-partisan.";

const tools = [
  {
    name: 'search_viral_news',
    description:
      'Fetch the top viral news headline from the last 2 hours. Returns { title, description, url, publishedAt }.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_scripture',
    description:
      'Fetch a relevant Bible verse for a given topic or keyword. Returns { reference, text }.',
    input_schema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'A keyword or theme extracted from the headline to guide verse selection',
        },
      },
      required: ['topic'],
    },
  },
  {
    name: 'generate_post',
    description:
      'Generate a short social post (under 280 chars) and a long ministry post (150-300 words) ' +
      'connecting the headline to the scripture. Returns { short_post, long_post }.',
    input_schema: {
      type: 'object',
      properties: {
        headline: {
          type: 'string',
          description: 'The news headline title',
        },
        scripture: {
          type: 'object',
          description: 'Scripture object with reference and text fields',
          properties: {
            reference: { type: 'string' },
            text: { type: 'string' },
          },
          required: ['reference', 'text'],
        },
      },
      required: ['headline', 'scripture'],
    },
  },
  {
    name: 'generate_prayer',
    description:
      'Write a 3-5 sentence intercessory prayer that is compassionate, personal, and faith-filled. ' +
      'Returns { prayer }.',
    input_schema: {
      type: 'object',
      properties: {
        headline: {
          type: 'string',
          description: 'The news headline providing context for the prayer',
        },
        post: {
          type: 'string',
          description: 'The long ministry post to draw tone and themes from',
        },
      },
      required: ['headline', 'post'],
    },
  },
  {
    name: 'post_to_socials',
    description:
      'Publish the content via Buffer API and archive everything to output/posts.json. ' +
      'Returns { success, buffer_response, timestamp }.',
    input_schema: {
      type: 'object',
      properties: {
        short_post: {
          type: 'string',
          description: 'Under-280-character post for Twitter/X',
        },
        long_post: {
          type: 'string',
          description: '150-300 word post for Facebook and Instagram',
        },
        headline: {
          type: 'string',
          description: 'Original news headline',
        },
        scripture: {
          type: 'object',
          description: 'Scripture object with reference and text',
          properties: {
            reference: { type: 'string' },
            text: { type: 'string' },
          },
          required: ['reference', 'text'],
        },
        prayer: {
          type: 'string',
          description: 'Intercessory prayer text',
        },
      },
      required: ['short_post', 'long_post', 'headline', 'scripture', 'prayer'],
    },
  },
];

const TOOL_EMOJIS = {
  search_viral_news: '📰',
  get_scripture: '🕊️ ',
  generate_post: '✍️ ',
  generate_prayer: '🙏',
  post_to_socials: '📲',
};

const toolHandlers = {
  search_viral_news: searchViralNews,
  get_scripture: getScripture,
  generate_post: generatePost,
  generate_prayer: generatePrayer,
  post_to_socials: postToSocials,
};

export default async function runAgent() {
  const messages = [
    { role: 'user', content: 'Run the full ministry pipeline now.' },
  ];

  console.log('\n🙏 Ministry Prayer Agent starting...\n' + '─'.repeat(50));

  while (true) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    // Append assistant turn to history
    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'end_turn') break;

    if (response.stop_reason !== 'tool_use') {
      console.log(`⚠️  Unexpected stop_reason: ${response.stop_reason}`);
      break;
    }

    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
    const toolResults = [];

    for (const block of toolUseBlocks) {
      const emoji = TOOL_EMOJIS[block.name] ?? '🔧';
      console.log(`\n${emoji} Calling ${block.name}...`);

      try {
        const handler = toolHandlers[block.name];
        if (!handler) throw new Error(`No handler registered for tool: ${block.name}`);

        const result = await handler(block.input);
        const resultStr = typeof result === 'string' ? result : JSON.stringify(result);

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: resultStr,
        });
      } catch (error) {
        console.error(`   ✗ ${block.name} failed: ${error.message}`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: `Error: ${error.message}`,
          is_error: true,
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });
  }
}
