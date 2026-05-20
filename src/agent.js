import Anthropic from '@anthropic-ai/sdk';
import { getScripture } from './tools/get_scripture.js';
import { searchViralNews } from './tools/search_viral_news.js';
import { generatePost } from './tools/generate_post.js';
import { generatePrayer } from './tools/generate_prayer.js';
import { postToSocials } from './tools/post_to_socials.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Anthropic();

const tools = [
  {
    name: 'get_scripture',
    description: 'Retrieve Bible scripture passages by reference or topic. Use specific references like "John 3:16" or "Psalm 23" for best results.',
    input_schema: {
      type: 'object',
      properties: {
        reference: {
          type: 'string',
          description: 'Bible reference like "John 3:16", "Psalm 91", or "Romans 8:28"',
        },
      },
      required: ['reference'],
    },
  },
  {
    name: 'search_viral_news',
    description: 'Search for recent viral news articles on a given topic to understand current events and cultural context.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query or topic to find relevant news',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results to return (default: 5)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'generate_post',
    description: 'Generate an engaging social media post that connects scripture with current events in a Spirit-led, ministry-focused way.',
    input_schema: {
      type: 'object',
      properties: {
        scripture: {
          type: 'string',
          description: 'The scripture passage text to anchor the post',
        },
        news_context: {
          type: 'string',
          description: 'Summary of current events to connect with the scripture',
        },
        tone: {
          type: 'string',
          enum: ['encouraging', 'reflective', 'prophetic', 'intercessory'],
          description: 'The spiritual tone of the post',
        },
        platform: {
          type: 'string',
          enum: ['twitter', 'instagram', 'facebook'],
          description: 'Target social media platform',
        },
      },
      required: ['scripture', 'news_context', 'tone', 'platform'],
    },
  },
  {
    name: 'generate_prayer',
    description: 'Generate a heartfelt, scripture-anchored prayer based on current events and ministry topic.',
    input_schema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'The main prayer topic or focus',
        },
        scripture_reference: {
          type: 'string',
          description: 'Scripture reference to anchor and inspire the prayer',
        },
        news_context: {
          type: 'string',
          description: 'Current events context to make the prayer timely and relevant',
        },
      },
      required: ['topic', 'scripture_reference', 'news_context'],
    },
  },
  {
    name: 'post_to_socials',
    description: 'Post ministry content to social media platforms (currently simulated). Saves output to the output/ directory.',
    input_schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The content to post to social media',
        },
        platforms: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['twitter', 'instagram', 'facebook'],
          },
          description: 'List of platforms to post to',
        },
        save_to_file: {
          type: 'boolean',
          description: 'Whether to save the post to the output directory (default: true)',
        },
      },
      required: ['content', 'platforms'],
    },
  },
];

const toolExecutors = {
  get_scripture: getScripture,
  search_viral_news: searchViralNews,
  generate_post: generatePost,
  generate_prayer: generatePrayer,
  post_to_socials: postToSocials,
};

export async function runMinistryAgent(topic) {
  console.log(`\n🙏 Ministry Prayer Agent starting for topic: "${topic}"\n`);
  console.log('─'.repeat(60));

  const messages = [
    {
      role: 'user',
      content: `You are a Spirit-led ministry assistant. Your mission is to create impactful, scripture-grounded ministry content for the following topic: "${topic}"

Please complete these steps in order:
1. Search for relevant current news and events related to this topic
2. Find appropriate scripture passages that speak to this topic
3. Generate an encouraging social media post for Instagram connecting the scripture to current events
4. Generate a reflective post for Twitter (keep it under 280 chars)
5. Write a heartfelt intercessory prayer about this topic
6. Post all content to the respective platforms

Be Spirit-led, authentic, and biblically grounded throughout. Let the scripture guide the message, not the other way around.`,
    },
  ];

  let response;
  let iterations = 0;
  const maxIterations = 20;

  while (iterations < maxIterations) {
    iterations++;
    console.log(`\n[Iteration ${iterations}] Calling Claude claude-opus-4-7...`);

    response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: `You are a Spirit-led ministry assistant who creates scripture-grounded, culturally relevant ministry content.
You have deep knowledge of the Bible and understanding of how scripture applies to modern life.
You approach every topic with prayer, discernment, and a heart for the people you serve.
When connecting current events to scripture, you do so with wisdom, compassion, and hope — never sensationalism.
Always complete the full workflow: research news, find scripture, generate posts for multiple platforms, write a prayer, and post/save everything.`,
      tools,
      messages,
    });

    const stopReason = response.stop_reason;
    console.log(`  Stop reason: ${stopReason}`);

    if (stopReason === 'end_turn') {
      console.log('\n✅ Agent completed its mission.\n');
      break;
    }

    if (stopReason !== 'tool_use') {
      console.log(`\n⚠️  Unexpected stop reason: ${stopReason}`);
      break;
    }

    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
    messages.push({ role: 'assistant', content: response.content });

    const toolResults = [];
    for (const toolUse of toolUseBlocks) {
      console.log(`  🔧 Calling tool: ${toolUse.name}`);
      try {
        const executor = toolExecutors[toolUse.name];
        if (!executor) throw new Error(`Unknown tool: ${toolUse.name}`);
        const result = await executor(toolUse.input);
        const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
        console.log(`     ✓ ${toolUse.name} completed (${resultStr.length} chars)`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: resultStr,
        });
      } catch (error) {
        console.error(`     ✗ ${toolUse.name} failed: ${error.message}`);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: `Error executing ${toolUse.name}: ${error.message}`,
          is_error: true,
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });
  }

  if (iterations >= maxIterations) {
    console.log('\n⚠️  Max iterations reached.');
  }

  const finalText = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n');

  return finalText;
}
