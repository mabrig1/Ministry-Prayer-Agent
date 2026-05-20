# Ministry Prayer Agent

An AI-powered ministry assistant that creates scripture-grounded social media content and prayers by connecting current events to biblical truth.

## Features

- Searches current news and connects it to scripture
- Generates platform-optimized posts for Twitter, Instagram, and Facebook
- Writes heartfelt, biblically-anchored intercessory prayers
- Saves all generated content to the `output/` directory
- Works without a News API key (uses realistic mock data as fallback)

## Quick Start

```bash
# 1. Clone the repo and install dependencies
npm install

# 2. Set up your environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 3. Run the agent
npm start

# Or with a custom topic
node src/index.js "peace amid conflict"
```

## Example Topics

```bash
node src/index.js "hope and healing in difficult times"
node src/index.js "faith over fear"
node src/index.js "unity and reconciliation"
node src/index.js "God's provision in times of need"
node src/index.js "courage and strength"
```

## Requirements

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)
- (Optional) A [News API key](https://newsapi.org/) for live news

## How It Works

The agent uses Claude claude-opus-4-7 with adaptive thinking to orchestrate a multi-step workflow:

1. **Research** — Searches for recent news related to your topic
2. **Scripture** — Finds relevant Bible passages via [bible-api.com](https://bible-api.com)
3. **Content** — Generates tailored posts for each platform using Claude claude-haiku-4-5
4. **Prayer** — Writes an intercessory prayer anchored in scripture
5. **Publish** — Simulates posting and saves everything to `output/`

## Project Structure

```
src/
  agent.js                  # Agentic loop with tool orchestration
  index.js                  # CLI entry point
  tools/
    get_scripture.js        # Bible verse fetcher (bible-api.com)
    search_viral_news.js    # News search (newsapi.org + mock fallback)
    generate_post.js        # Social post generator (claude-haiku-4-5)
    generate_prayer.js      # Prayer generator (claude-haiku-4-5)
    post_to_socials.js      # Post simulator + file saver
output/
  .gitkeep                  # Keeps directory tracked; posts saved here
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```env
ANTHROPIC_API_KEY=your_key_here   # Required
NEWS_API_KEY=your_key_here        # Optional — mock data used if absent
```

## License

ISC
