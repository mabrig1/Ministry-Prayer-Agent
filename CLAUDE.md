# Ministry Prayer Agent

## Project Goal
AI agent that monitors viral news, interprets it through a biblical lens,
generates a ministry post + prayer, and publishes to all platforms via Buffer.

## Stack
- Runtime: Node.js (ESM), type: module in package.json
- SDK: @anthropic-ai/sdk (tool_use agentic loop)
- Model: claude-sonnet-4-20250514
- News: NewsAPI.org — top headlines, last 2 hours
- Bible: bible-api.com (free, no key)
- Social: Buffer API (all platforms in one call)

## Environment Variables
ANTHROPIC_API_KEY=
NEWS_API_KEY=
BUFFER_ACCESS_TOKEN=

## Tool Pipeline Order
1. search_viral_news  → returns top headline
2. get_scripture      → returns relevant verse for the topic
3. generate_post      → returns short_post + long_post
4. generate_prayer    → returns intercessory prayer
5. post_to_socials    → publishes via Buffer, archives to output/posts.json

## Agent System Prompt
"You are a ministry AI agent. Your mission is to find current viral news,
interpret it through biblical wisdom, and create an uplifting faith-based
post and prayer for the ministry's followers. Always be hopeful, compassionate,
and non-partisan."

## Post Rules
- short_post: under 280 chars + 2 relevant hashtags (for Twitter/X)
- long_post: 150-300 words, warm ministry tone (for Facebook/Instagram)
- Prayer: 3-5 sentences, intercessory, compassionate
- Never political, always redemptive in framing

## Buffer Integration
- Endpoint: https://api.bufferapp.com/1/updates/create.json
- Pass BUFFER_ACCESS_TOKEN in Authorization header
- Post short_post to Twitter profile
- Post long_post to Facebook and Instagram profiles
- BUFFER_PROFILE_IDS stored as comma-separated env var

## Error Handling
- News fails → use topic "hope and resilience in today's world"
- Bible API fails → fallback to { reference: "John 3:16", text: "For God so loved the world..." }
- Buffer fails → save to output/posts.json and log warning
- Log every step with emoji: 📰 🕊️ ✍️ 🙏 📲

## Archive Format (output/posts.json)
{
  "timestamp": "ISO string",
  "headline": "string",
  "scripture": { "reference": "string", "text": "string" },
  "short_post": "string",
  "long_post": "string",
  "prayer": "string",
  "buffer_response": {}
}
