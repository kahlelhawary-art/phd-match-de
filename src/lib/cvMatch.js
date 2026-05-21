import { callClaude } from './claude.js';

/**
 * CV-to-programmes matching engine.
 *
 * Two-stage strategy:
 *   1. analyseCv(cvText)         → structured profile summary
 *   2. matchProgrammes(profile, programmes) → ranked array with reasoning
 *
 * We split the work so the profile summary can be reused (e.g. for the
 * Anschreiben generator) and so each call stays within reasonable token
 * budgets.
 *
 * Output schema:
 *   {
 *     summary: { name, degree, methods[], topics[], languages[], interests[] },
 *     matches: [{
 *       programmeId,
 *       score,                  // 0-100
 *       strengths: [string],
 *       gaps: [string],
 *       reasoning: string,
 *       tips: [string],         // what to emphasise in application
 *     }],
 *   }
 */

const ANALYSE_SYSTEM = `You are a careful research recruiter analysing the CV of a master's graduate in the German life sciences. Your job is to extract a structured profile.

You must respond with ONLY valid JSON — no preamble, no markdown fences, no commentary.

The JSON schema is:
{
  "name": "string or null",
  "degree": "their highest qualification, one sentence",
  "current_status": "what they're doing right now, one sentence",
  "methods": ["specific lab techniques mentioned, e.g. 'qPCR', 'flow cytometry', 'scRNA-seq', 'CRISPR-Cas9'"],
  "software": ["specific tools, e.g. 'R', 'Python', 'GraphPad', 'ImageJ', 'Seurat'"],
  "topics": ["specific research themes the CV touches, e.g. 'microglia in neuroinflammation', 'breast cancer genomics'"],
  "publications": ["paper titles or 'poster at X' entries if present, otherwise []"],
  "languages": [{"code": "de|en|ar|fr|tr|other", "level": "A1|A2|B1|B2|C1|C2|native"}],
  "interests": ["broad research areas they want to work in, e.g. 'cancer immunology', 'neurodegeneration'"],
  "experience_strengths": ["3-5 short phrases describing their concrete strengths for a PhD application"],
  "potential_gaps": ["1-3 honest gaps that may matter when applying"]
}

Rules:
- If something is missing, return an empty array or null, don't invent.
- Methods/software entries should be terse (1-3 words each).
- Be honest about gaps without being discouraging.`;

const MATCH_SYSTEM = `You are an expert PhD admissions advisor for German life-sciences programmes. You will be given (a) a structured profile of a candidate and (b) a list of PhD programmes. Rank EVERY programme by fit and explain each match.

You must respond with ONLY valid JSON — no preamble, no markdown fences, no commentary.

The JSON schema is:
{
  "matches": [
    {
      "id": "the programme id, exactly as given",
      "score": 0-100 integer,
      "strengths": ["2-4 short phrases describing what aligns. Reference specific candidate methods, topics, or interests."],
      "gaps": ["1-3 short phrases describing fit gaps. Be honest but constructive."],
      "reasoning": "ONE concise paragraph (40-80 words) explaining the score. Reference both the candidate AND the programme specifically — institution name, research themes.",
      "tips": ["2-3 concrete tips on what to emphasise in the cover letter for THIS programme"]
    }
  ]
}

Scoring guidance:
- 85-100: very strong match — methods AND topic align, language fits, candidate could plausibly succeed.
- 70-84: strong match — most factors align, minor gaps.
- 55-69: moderate match — partial alignment, requires emphasising adjacent skills.
- 40-54: weak match — limited overlap, would need significant reframing.
- 0-39: very weak — substantial mismatch.

Other rules:
- Return EVERY programme in the input list, sorted by score descending.
- Use the language the candidate seems most comfortable in for reasoning; default to English.
- Don't recommend dishonesty. If the candidate lacks a method the lab uses, name it as a gap.
- Reference real programme details (city, institution, research focus) — they are in the input.`;

/**
 * Stage 1: parse CV into a structured profile.
 */
export async function analyseCv({ cvText, extraInterests = '', lang = 'en' }) {
  const userMessage = `CV text:
---
${cvText.trim()}
---

${extraInterests ? `Additional interests stated by the candidate: ${extraInterests}\n\n` : ''}Respond in ${lang === 'de' ? 'German' : lang === 'ar' ? 'Arabic' : 'English'} for any descriptive fields (topics, strengths, gaps). Keep technical method names in their original form. Return only the JSON object.`;

  const { text } = await callClaude({
    system: ANALYSE_SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
    maxTokens: 1500,
    temperature: 0.2,
  });

  return parseJson(text);
}

/**
 * Stage 2: rank programmes against the parsed profile.
 */
export async function matchProgrammes({ profile, programmes, lang = 'en' }) {
  // Compact programmes payload — only what the model needs to rank
  const compactProgrammes = programmes.map((p) => ({
    id: p.id,
    name: p.name,
    short_name: p.short_name,
    institution: p.institution?.name ?? p.institution?.short_name ?? '',
    city: p.institution?.city ?? '',
    fields: p.fields,
    language: p.language,
    funding: p.funding_info,
    is_rolling: p.is_rolling,
    description:
      lang === 'de' ? p.description_de
      : lang === 'ar' ? p.description_ar
      : (p.description_en ?? p.description_de),
  }));

  const userMessage = `Candidate profile (JSON):
${JSON.stringify(profile, null, 2)}

Programmes to rank (JSON array):
${JSON.stringify(compactProgrammes, null, 2)}

Respond in ${lang === 'de' ? 'German' : lang === 'ar' ? 'Arabic' : 'English'} for reasoning, strengths, gaps, and tips. Keep institution and method names as-is. Return only the JSON object.`;

  const { text } = await callClaude({
    system: MATCH_SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
    maxTokens: 4000,
    temperature: 0.3,
  });

  const parsed = parseJson(text);

  // Sort defensively in case the model didn't
  if (Array.isArray(parsed.matches)) {
    parsed.matches.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  return parsed;
}

/**
 * End-to-end convenience: analyse then match in one call sequence.
 * onProgress(stage) is called between stages.
 */
export async function runFullMatch({ cvText, extraInterests, programmes, lang = 'en', onProgress }) {
  onProgress?.('parsing');
  const profile = await analyseCv({ cvText, extraInterests, lang });

  onProgress?.('matching');
  const matchResult = await matchProgrammes({ profile, programmes, lang });

  onProgress?.('ranking');
  return { profile, matches: matchResult.matches ?? [] };
}

// ─── helpers ─────────────────────────────────────────────────

function parseJson(text) {
  // Strip code fences if Claude included any despite instructions
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Last-resort: try to find the first {...} block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (_) { /* fall through */ }
    }
    const error = new Error('Failed to parse Claude response as JSON');
    error.raw = text;
    throw error;
  }
}
