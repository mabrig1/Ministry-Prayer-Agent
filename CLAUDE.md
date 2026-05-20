# Ministry Prayer Agent — Claude Code Guide

## Project Overview

An AI-powered ministry assistant that creates scripture-grounded social media content and prayers by connecting current events to biblical truth. Uses Claude claude-opus-4-7 as the orchestrating agent and Claude claude-haiku-4-5 for fast content generation.

## Architecture

```
src/
  index.js        — Entry point, parses CLI topic argument
  agent.js        — Main agentic loop using claude-opus-4-7 with tool use
  tools/
    get_scripture.js      — Fetches Bible passages via bible-api.com
    search_viral_news.js  — Searches news via newsapi.org (mock fallback included)
    generate_post.js      — Generates platform-specific posts via claude-haiku-4-5
    generate_prayer.js    — Generates intercessory prayers via claude-haiku-4-5
    post_to_socials.js    — Simulates posting, saves to output/
output/
  .gitkeep        — Tracks output dir; generated posts saved here as .txt files
```

## Running the Agent

```bash
# Copy and fill in your API keys
cp .env.example .env

# Run with default topic
npm start

# Run with custom topic
node src/index.js "peace amid conflict"
node src/index.js "healing and restoration"
node src/index.js "faith over fear"
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `NEWS_API_KEY` | No | newsapi.org key (mock data used if absent) |
| `TWITTER_*` | No | Twitter credentials (currently simulated) |
| `INSTAGRAM_ACCESS_TOKEN` | No | Instagram token (currently simulated) |
| `FACEBOOK_PAGE_TOKEN` | No | Facebook token (currently simulated) |

## Models Used

- **claude-opus-4-7** with `thinking: {type: "adaptive"}` — main orchestrator, plans the workflow and calls tools
- **claude-haiku-4-5** — fast, cost-effective generation for posts and prayers

## Tool Descriptions

| Tool | Description |
|---|---|
| `get_scripture` | Fetches Bible text from bible-api.com (free, no auth) |
| `search_viral_news` | Searches newsapi.org; returns mock articles if no key |
| `generate_post` | Creates platform-specific posts (twitter/instagram/facebook) |
| `generate_prayer` | Writes heartfelt, scripture-anchored intercessory prayers |
| `post_to_socials` | Simulates posting; saves to `output/post-{timestamp}.txt` |

## Development Notes

- Uses ES Modules (`"type": "module"` in package.json) — all imports must use `.js` extensions
- `node-fetch` provides `fetch()` for Node.js HTTP calls
- The agentic loop caps at 20 iterations to prevent runaway execution
- Output files are gitignored (only `.gitkeep` is tracked)
