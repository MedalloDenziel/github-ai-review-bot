import { App } from 'octokit';
import { config } from '../config';

export const githubApp = new App({
  appId: config.github.appId,
  privateKey: config.github.privateKey,
  webhooks: { secret: config.github.webhookSecret },
});
