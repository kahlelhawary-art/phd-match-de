/**
 * AI API client (OpenAI).
 * In production (Vercel) this calls /api/claude (Edge Function proxy) so
 * the OpenAI key is never exposed in the browser bundle.
 * In local development it falls back to calling OpenAI directly using
 * VITE_OPENAI_KEY.
 */

const PROXY_URL = '/api/claude';
const DIRECT_URL = 'https://api.openai.com/v1/chat/completions';

export async function callClaude({
  apiKey = import.meta.env.VITE_OPENAI_KEY,
  model = 'gpt-4o-mini',
  system = '',
  messages,
  maxTokens = 2048,
  temperature = 0.4,
}) {
  // Prefer the server-side proxy when available
  const useProxy = !apiKey || import.meta.env.PROD;

  // Build OpenAI messages array
  const oaiMessages = [];
  if (system) {
    oaiMessages.push({ role: 'system', content: system });
  }
  oaiMessages.push(...messages);

  let res;
  if (useProxy) {
    res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, system, model, maxTokens, temperature }),
    });
  } else {
    // Local dev fallback — direct browser access
    res = await fetch(DIRECT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: oaiMessages,
      }),
    });
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text}`);
  }

  const data = await res.json();

  // Extract text from OpenAI response format
  const text = data.choices?.[0]?.message?.content?.trim() ?? '';

  return { text, raw: data };
}

