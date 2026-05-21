/**
 * Outreach email composer.
 *
 * Drafts short initiative emails to German PIs. Different from the Anschreiben
 * generator in three ways:
 *   - Much shorter (120-180 words instead of 280-380)
 *   - Goal is a reply, not a formal application
 *   - Three strategies (inquiry, paper, methods) shape the entire email
 *
 * Returns: { variants: [{ subject, body }, ...] }
 */

import { callClaude } from './claude.js';

const STRATEGY_GUIDANCE = {
  inquiry: `STRATEGY: INQUIRY
The candidate does not yet know a specific paper from the lab — this is the standard polite first contact. Structure:
1. One-sentence introduction (who they are: name + degree + master institution).
2. One-sentence statement of why this lab's research area interests them (use the lab focus).
3. The core ask: "Are you accepting doctoral students for the coming intake, and would you be open to a brief introductory conversation?"
4. Brief mention of attached CV.
The whole email should feel polite, brief, and direct. ~120-140 words.`,

  paper: `STRATEGY: SPECIFIC PAPER
The candidate has read a specific paper from the lab and wants to use it as the hook. This is the strongest strategy because it proves homework. Structure:
1. Open with the paper reference: "Your [year] paper in [journal] on [topic] caught my attention because [genuine reason connected to candidate's master thesis or interests]."
2. Bridge: how the candidate's master work or methods relate to that paper's themes.
3. Concrete question: "Are you currently planning doctoral projects in this direction?" or "I would be very interested to hear if you are recruiting in this area."
~150-180 words.`,

  methods: `STRATEGY: METHODS BRIDGE
The candidate has technical strengths that match the lab's methodology. Structure:
1. One-sentence introduction with master's topic.
2. Name 2-3 specific methods the candidate has mastered (from the profile), explicitly framed as transferable to the lab's work.
3. Connect to the lab focus: "These skills align with your group's work on [lab focus] — particularly [a specific overlap]."
4. The ask: a brief conversation about a possible doctoral project.
~140-170 words. Method names must come from the candidate's profile.`,
};

const SYSTEM_DE = `You are an expert at writing initiative emails ("Anfrage-Mails") to German university professors for international PhD candidates in the life sciences. You write impeccable, natural academic German that does NOT sound translated.

You must respond with ONLY valid JSON — no preamble, no Markdown fences, no commentary. Schema:
{
  "variants": [
    {
      "subject": "the subject line — SHORT, specific, never 'PhD application' or 'Inquiry'. Mention the topic.",
      "body": "the email body in plain text with \\n line breaks. Includes salutation, paragraphs, and sign-off."
    }
  ]
}

Hard rules:
- Salutation: "Sehr geehrte Frau Prof. Dr. [NAME]," or "Sehr geehrter Herr Prof. Dr. [NAME]," — use the name if given, otherwise "Sehr geehrte Damen und Herren," (only if no name at all).
- Sie-Form throughout.
- Sign off: "Mit freundlichen Grüßen\\n\\n[Vorname Nachname]" — placeholder for the candidate's name.
- NEVER invent papers, methods, or experiences the candidate did not mention.
- Use the candidate's specific method names verbatim.
- NEVER include "PhD application" or generic phrases. Subjects must reference the research topic.
- Each variant should be subtly different in framing — same content, different rhetorical opening or emphasis. Not just word swaps.
- Body length per variant: target 120-180 words. Hard ceiling: 200 words.
- No emojis, no exclamation marks.`;

const SYSTEM_EN = `You are an expert at writing initiative emails to German professors for international PhD candidates in the life sciences. Write in clear, formal, native English suitable for a German academic context.

You must respond with ONLY valid JSON — no preamble, no Markdown fences. Schema:
{
  "variants": [
    {
      "subject": "the subject line — specific, never generic. Reference the research topic.",
      "body": "email body in plain text with \\n line breaks. Salutation + paragraphs + sign-off."
    }
  ]
}

Hard rules:
- Salutation: "Dear Prof. Dr. [NAME]," — use name if given, else "Dear Prof. [LAST]," when only last is known.
- Sign off: "Yours sincerely,\\n\\n[Full name]" placeholder.
- NEVER invent papers, methods, or experiences not in the candidate profile.
- Subject lines must reference the research topic, never "PhD application".
- Variants should differ in framing, not just word choice.
- Body length per variant: target 120-180 words. Hard ceiling: 200 words.`;

/**
 * Build a compact programme summary.
 */
function summariseProgramme(programme, lang) {
  if (!programme) return null;
  const desc =
    lang === 'de' ? programme.description_de
    : lang === 'ar' ? programme.description_ar
    : (programme.description_en ?? programme.description_de);

  return {
    name: programme.name,
    short_name: programme.short_name,
    institution: programme.institution?.name,
    institution_short: programme.institution?.short_name,
    city: programme.institution?.city,
    fields: programme.fields,
    description: desc,
  };
}

/**
 * Main composer.
 *
 * @param {Object} args
 * @param {Object} args.programme         — full programme with .institution
 * @param {Object|null} args.profile      — parsed CV profile from CV-Match
 * @param {string} [args.cvText]          — raw CV fallback
 * @param {string} [args.piName]
 * @param {string} [args.labFocus]        — short text describing the lab's focus
 * @param {'inquiry'|'paper'|'methods'} args.strategy
 * @param {string} [args.paperReference]  — required when strategy === 'paper'
 * @param {'de'|'en'} args.language
 * @param {number} [args.variantCount]    — 1-3 (default 3)
 */
export async function composeOutreach({
  programme,
  profile,
  cvText,
  piName = '',
  labFocus = '',
  strategy = 'inquiry',
  paperReference = '',
  language = 'de',
  variantCount = 3,
}) {
  if (!programme) throw new Error('Programme is required');
  if (!profile && !cvText) throw new Error('Either profile or cvText is required');
  if (strategy === 'paper' && !paperReference.trim()) {
    throw new Error('Paper reference is required for the paper strategy');
  }

  const candidatePayload = profile
    ? { type: 'parsed_profile', data: profile }
    : { type: 'raw_cv', data: cvText };

  const userPrompt = `CANDIDATE:
${JSON.stringify(candidatePayload, null, 2)}

TARGET PROGRAMME:
${JSON.stringify(summariseProgramme(programme, language), null, 2)}

RECIPIENT:
- Name: ${piName || '(not provided — use a polite generic salutation)'}
- Lab focus: ${labFocus || '(use the programme fields above as proxy)'}

${strategy === 'paper' ? `PAPER REFERENCE TO USE:\n${paperReference}\n\n` : ''}${STRATEGY_GUIDANCE[strategy] ?? STRATEGY_GUIDANCE.inquiry}

Generate ${variantCount} subtly different variant${variantCount === 1 ? '' : 's'} of this email. Return ONLY the JSON object.`;

  const { text } = await callClaude({
    system: language === 'de' ? SYSTEM_DE : SYSTEM_EN,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 2400,
    temperature: 0.65,
  });

  return parseJson(text);
}

function parseJson(text) {
  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (_) { /* fall through */ }
    }
    const error = new Error('Failed to parse Claude response as JSON');
    error.raw = text;
    throw error;
  }
}
