/**
 * Minimal Claude API client for browser use.
 * Requires the dangerous-direct-browser-access header (Khalel's pattern).
 *
 * For production: route through a Supabase Edge Function so the key
 * is not exposed in the browser bundle.
 */

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';

export async function callClaude({
  apiKey = import.meta.env.VITE_ANTHROPIC_KEY,
  model = 'claude-opus-4-5',
  system = '',
  messages,
  maxTokens = 2048,
  temperature = 0.4,
}) {
  if (!apiKey) throw new Error('VITE_ANTHROPIC_KEY missing in .env');

  const res = await fetch(CLAUDE_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude ${res.status}: ${text}`);
  }

  const data = await res.json();
  const text = data.content
    ?.filter((b) => b.type === 'text')
    ?.map((b) => b.text)
    ?.join('\n')
    ?.trim() ?? '';

  return { text, raw: data };
}
