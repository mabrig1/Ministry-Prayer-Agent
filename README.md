# Ministry Prayer Agent

An AI agent that finds viral news, interprets it through Scripture,
and posts faith-based content + prayer to all social platforms via Buffer.

## Setup
1. cp .env.example .env — fill in all keys
2. npm install
3. node --env-file=.env src/index.js

## Get your API keys
- Anthropic: https://console.anthropic.com
- NewsAPI: https://newsapi.org/register
- Buffer: https://buffer.com/developers/api

## Schedule (optional)
Add a GitHub Action or cron job to run every 2 hours automatically.
