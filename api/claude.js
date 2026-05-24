/**
 * Vercel Edge Function — OpenAI API proxy.
 * Reads OPENAI_API_KEY from Vercel environment variables so the key
 * is never exposed in the browser bundle.
 *
 * POST /api/claude  (keeping same endpoint path for compatibility)
 * Body: { messages, system?, model?, maxTokens?, temperature? }
 */

export const config = { runtime: 'edge' };

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const {
    messages,
    system = '',
    model = 'gpt-4o-mini',
    maxTokens = 2048,
    temperature = 0.4,
  } = body;

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'messages array required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Build OpenAI messages array (prepend system message if provided)
  const oaiMessages = [];
  if (system) {
    oaiMessages.push({ role: 'system', content: system });
  }
  oaiMessages.push(...messages);

  const upstream = await fetch(OPENAI_URL, {
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

  const data = await upstream.json();

  return new Response(JSON.stringify(data), {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
