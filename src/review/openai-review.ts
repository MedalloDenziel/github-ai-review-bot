import OpenAI from 'openai';
import { config } from '../config';

const client = new OpenAI({ apiKey: config.openai.apiKey });

export interface ReviewResult {
  approved: boolean;
  feedback: string;
}

const SYSTEM_PROMPT = `You are a friendly onboarding reviewer for a software engineering
program. Review the submitted issue for clarity and completeness (does it explain what
was done, why, and how to verify it?). Respond with encouraging, specific feedback.
Reply with strict JSON only: {"approved": boolean, "feedback": string}.`;

export async function reviewIssue(title: string, body: string): Promise<ReviewResult> {
  const completion = await client.chat.completions.create({
    model: config.openai.model,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Title: ${title}\n\nBody:\n${body}` },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw) as Partial<ReviewResult>;

  return {
    approved: Boolean(parsed.approved),
    feedback: parsed.feedback ?? 'No feedback generated.',
  };
}
