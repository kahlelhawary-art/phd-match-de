/**
 * Paper Digest — analyse a PI's paper/abstract and bridge it to the candidate.
 *
 * Input: paper text (abstract or full), optional PI/lab context, the
 *        candidate's profile (from CV-Match) or raw CV.
 *
 * Output JSON:
 * {
 *   "summary": "2-3 sentence plain-language summary of what the paper is about",
 *   "key_findings": ["finding 1", "finding 2", ...],   // 2-4 items
 *   "methods": ["method 1", "method 2", ...],          // named techniques
 *   "connections": [                                    // candidate ↔ paper bridges
 *     { "point": "short label", "detail": "how the candidate's background connects" }
 *   ],
 *   "outreach_hook": "one ready-to-use sentence the candidate can open an email with"
 * }
 *
 * Hard rules: never invent candidate experience; connections must be grounded
 * in what the candidate actually provided. If there is no genuine connection,
 * say so honestly rather than fabricate one.
 */

import { callClaude } from './claude.js';

const SYSTEM = {
  de: `Du bist ein wissenschaftlicher Mentor, der internationalen Promotionskandidaten hilft, die Forschung einer Arbeitsgruppe zu verstehen und einen ehrlichen Bezug zu ihrer eigenen Erfahrung herzustellen.

Antworte AUSSCHLIESSLICH mit gültigem JSON — kein Vorwort, keine Markdown-Zäune. Schema:
{
  "summary": "2-3 Sätze, einfache Sprache: worum geht es in der Arbeit",
  "key_findings": ["Erkenntnis 1", "Erkenntnis 2"],
  "methods": ["Methode 1", "Methode 2"],
  "connections": [
    { "point": "kurzes Stichwort", "detail": "wie der Hintergrund des Kandidaten konkret anknüpft" }
  ],
  "outreach_hook": "ein einsatzbereiter Eröffnungssatz für eine E-Mail"
}

Harte Regeln:
- Erfinde NIEMALS Erfahrungen des Kandidaten. Verbindungen müssen auf den tatsächlichen Angaben beruhen.
- Wenn es keine ehrliche Verbindung gibt, schreibe das offen (z. B. connections: [{ "point": "Allgemeines Interesse", "detail": "..." }]).
- Nenne Methoden beim Namen.
- Der "outreach_hook" muss spezifisch und wissenschaftlich sein, kein leeres Lob.`,

  en: `You are a scientific mentor helping international PhD candidates understand a research group's work and draw an honest connection to their own experience.

Respond with ONLY valid JSON — no preamble, no markdown fences. Schema:
{
  "summary": "2-3 sentences, plain language: what the paper is about",
  "key_findings": ["finding 1", "finding 2"],
  "methods": ["method 1", "method 2"],
  "connections": [
    { "point": "short label", "detail": "how the candidate's background concretely connects" }
  ],
  "outreach_hook": "one ready-to-use opening sentence for an email"
}

Hard rules:
- NEVER invent candidate experience. Connections must be grounded in what was actually provided.
- If there is no honest connection, say so openly (e.g. connections: [{ "point": "General interest", "detail": "..." }]).
- Name methods explicitly.
- The "outreach_hook" must be specific and scientific, not empty flattery.`,
};

export async function digestPaper({
  paperText,
  piName = '',
  labFocus = '',
  profile = null,
  cvText = '',
  language = 'en',
}) {
  if (!paperText || paperText.trim().length < 40) {
    throw new Error('Paper text is required (paste an abstract or excerpt)');
  }

  const candidate = profile
    ? { type: 'parsed_profile', data: profile }
    : cvText
      ? { type: 'raw_cv', data: cvText }
      : { type: 'none', data: 'No candidate profile provided — focus on summary and methods only; connections may be general.' };

  const userPrompt = `PAPER / ABSTRACT:
${paperText}

${piName ? `PRINCIPAL INVESTIGATOR: ${piName}\n` : ''}${labFocus ? `LAB FOCUS: ${labFocus}\n` : ''}
CANDIDATE:
${JSON.stringify(candidate, null, 2)}

Analyse the paper and produce the JSON. Return ONLY the JSON object.`;

  const { text } = await callClaude({
    system: SYSTEM[language] ?? SYSTEM.en,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 1800,
    temperature: 0.4,
  });

  return parseJson(text);
}

function parseJson(text) {
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (_) { /* fall through */ }
    }
    const error = new Error('Failed to parse response as JSON');
    error.raw = text;
    throw error;
  }
}
