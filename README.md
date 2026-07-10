# github-ai-review-bot

An automated GitHub bot that reviews issues/PRs using OpenAI, posts feedback, and
closes approved items — with SHA-1 content hashing to prevent duplicate reviews.

## Overview

Manually reviewing every incoming issue or PR doesn't scale. This bot listens for
GitHub issue/PR events via the GitHub App (Octokit) API, sends the content to OpenAI
for review, and posts constructive feedback as a comment. A content-hashing layer
(SHA-1 over the issue/PR body) prevents the bot from re-reviewing content it has
already processed, so edits only trigger a fresh review when they actually change
something. This is a generic rebuild of an automation pattern used in a real
production system, with no proprietary prompts, data, or business logic included.

## Features

- GitHub App authentication via Octokit
- Webhook-driven review on issue/PR creation and edits
- OpenAI-powered feedback generation
- SHA-1 content hashing to skip duplicate reviews on unchanged content
- Optional auto-close on approval

## Tech Stack

- Node.js / TypeScript
- Octokit (GitHub App SDK)
- OpenAI API
- [Hosting: e.g. Cloudflare Workers / Node server]

## Architecture

```
GitHub webhook (issue/PR opened or edited)
        │
        ▼
Verify webhook signature ──► compute SHA-1 hash of content
        │
        ▼
Hash seen before? ──yes──► skip (no duplicate review)
        │no
        ▼
Send content to OpenAI for review ──► post comment via Octokit
        │
        ▼
Approved? ──yes──► close issue/PR
```

## Screenshots / Demo

![screenshot](./docs/screenshot.png) - (to be added)

## Getting Started

### Prerequisites

- Node.js 20+
- A GitHub App (App ID + private key) installed on a test repo
- `OPENAI_API_KEY`

### Installation

```bash
git clone https://github.com/MedalloDenziel/github-ai-review-bot.git
cd github-ai-review-bot
npm install
```

### Running locally

```bash
cp .env.example .env
npm run dev
```

## Project Structure

```
src/
├── github/
│   ├── app.ts           # Octokit app auth
│   └── webhook.ts        # event handling + signature verification
├── review/
│   ├── hash.ts            # SHA-1 dedup check
│   └── openai-review.ts    # prompt + response handling
└── index.ts
```

## Notes

Given more time, I'd add a caching layer for repeated LLM calls on very similar content
and configurable review rubrics per repo.

## License

MIT
