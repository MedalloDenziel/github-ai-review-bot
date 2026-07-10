import express from 'express';
import { createNodeMiddleware } from '@octokit/webhooks';
import { config } from './config';
import { githubApp } from './github/app';
import { registerWebhookHandlers } from './webhooks/handlers';

registerWebhookHandlers();

const WEBHOOK_PATH = '/webhooks/github';

const app = express();
app.use(createNodeMiddleware(githubApp.webhooks, { path: WEBHOOK_PATH }));
app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

app.listen(config.port, () => {
  console.log(`github-ai-review-bot listening on http://localhost:${config.port}`);
  console.log(`Webhook endpoint: ${WEBHOOK_PATH}`);
});
