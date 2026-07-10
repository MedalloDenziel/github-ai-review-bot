import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  github: {
    appId: required('GITHUB_APP_ID'),
    privateKey: required('GITHUB_APP_PRIVATE_KEY').replace(/\\n/g, '\n'),
    webhookSecret: required('GITHUB_WEBHOOK_SECRET'),
  },
  openai: {
    apiKey: required('OPENAI_API_KEY'),
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  },
  autoCloseOnApproval: process.env.AUTO_CLOSE_ON_APPROVAL !== 'false',
};
