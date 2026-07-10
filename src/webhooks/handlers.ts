import { githubApp } from '../github/app';
import { hashContent, reviewDedup } from '../review/hash';
import { reviewIssue } from '../review/openai-review';
import { config } from '../config';

interface IssueLikePayload {
  action: string;
  issue: { number: number; title: string; body: string | null };
  repository: { name: string; owner: { login: string } };
}

async function handleIssueEvent(octokit: any, payload: IssueLikePayload) {
  const { issue, repository } = payload;
  const owner = repository.owner.login;
  const repo = repository.name;
  const body = issue.body ?? '';

  const key = reviewDedup.key(owner, repo, issue.number);
  const hash = hashContent(issue.title, body);
  if (reviewDedup.wasReviewed(key, hash)) {
    return; // content unchanged since last review — skip to avoid duplicate comments
  }

  const { approved, feedback } = await reviewIssue(issue.title, body);
  reviewDedup.markReviewed(key, hash);

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issue.number,
    body: feedback,
  });

  if (approved && config.autoCloseOnApproval) {
    await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issue.number,
      state: 'closed',
    });
  }
}

export function registerWebhookHandlers() {
  githubApp.webhooks.on(['issues.opened', 'issues.edited'], ({ octokit, payload }) =>
    handleIssueEvent(octokit, payload as unknown as IssueLikePayload),
  );

  githubApp.webhooks.on(['pull_request.opened', 'pull_request.edited'], ({ octokit, payload }) =>
    handleIssueEvent(octokit, {
      action: payload.action,
      issue: {
        number: payload.pull_request.number,
        title: payload.pull_request.title,
        body: payload.pull_request.body,
      },
      repository: payload.repository as IssueLikePayload['repository'],
    }),
  );

  githubApp.webhooks.onError((error) => {
    for (const cause of error.errors) {
      console.error(`Webhook handler error: ${cause.message}`);
    }
  });
}
