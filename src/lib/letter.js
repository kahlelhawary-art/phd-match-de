/**
 * Anschreiben (cover letter) generator.
 *
 * Given a profile (from CV-Match) and a target programme, drafts a tailored
 * German Anschreiben or English cover letter. The model receives:
 *   - the parsed candidate profile (or raw CV as fallback)
 *   - the target programme details
 *   - tone selection
 *   - optional extra notes (favourite paper, shared background, etc.)
 *
 * Returns: { subject, body }
 *   subject — the e-mail / cover letter subject line
 *   body    — the letter body, plain text with line breaks (no Markdown)
 */

import { callClaude } from './claude.js';

const TONE_GUIDANCE = {
  formal: `Tone: strictly formal, academic German conventions. Use "Sehr geehrte Damen und Herren" or specific name when known. Sentence rhythm should be measured. No exclamation marks. This is the safest default for a structured Graduate School application.`,
  warm: `Tone: warm and personal while still professional. Express genuine enthusiasm without sounding eager. Mention specific aspects of the lab that excited you. "Sehr geehrte Frau Prof. Dr. ..." is appropriate. This works well for individual PhD applications via direct outreach.`,
  research: `Tone: research-led and substance-first. Open with the scientific question that connects you to the lab, then bridge to your background. Demonstrate technical literacy by naming concrete methods and concepts. This works best for highly competitive programmes (DKFZ, EMBL, MPI).`,
};

const SYSTEM_DE = `You are an experienced German academic writing coach who has helped hundreds of international candidates write Anschreiben (cover letters) for German PhD programmes in the life sciences. You write impeccable, native-quality academic German.

You must respond with ONLY valid JSON — no preamble, no markdown fences, no commentary. The schema is:
{
  "subject": "the subject line for the email or cover letter, in German",
  "body": "the full letter body — plain text with \\n line breaks. No Markdown. Include the closing 'Mit freundlichen Grüßen' and signature placeholder."
}

The letter must follow standard German Anschreiben conventions:
- Place "[Vorname Nachname]\\n[Adresse]\\n[Stadt]\\n[E-Mail · Telefon]" at the top, on separate lines (use placeholders if not given).
- Then the date: "Halle, [DATUM]" or wherever the candidate lives.
- Then the recipient address (institution name, programme, city) on separate lines.
- Then a "Betreff:" line that matches the subject.
- Then the salutation: "Sehr geehrte/r Frau/Herr Prof. Dr. [NAME]" — use a placeholder if no name is known.
- Then 3-4 paragraphs:
  1. Hook: why this specific programme/lab, with a SPECIFIC reference to its research theme. (3-4 sentences)
  2. Bridge: your master's topic and methods, connected concretely to the lab's work. (4-6 sentences)
  3. Strengths & contribution: methods you bring, software skills, languages. (3-4 sentences)
  4. Closing: availability, willingness to interview, contact line. (2 sentences)
- Then "Mit freundlichen Grüßen" + "\\n\\n[Vorname Nachname]" signature placeholder.
- Total length: 280–380 words for the body paragraphs. The letter as a whole should fit on one A4 page.

Hard rules:
- NEVER invent publications, awards, or experiences the candidate did not mention.
- NEVER claim language skills the candidate does not have.
- If the candidate mentioned methods, USE them by name in the bridge paragraph.
- If the candidate listed languages with levels, mention them honestly (e.g. "Deutsch B2, Englisch C1").
- Use Sie-Form throughout.
- No emojis, no exclamation marks unless tone is explicitly warm.`;

const SYSTEM_EN = `You are an experienced academic writing coach for international PhD applications to German programmes in the life sciences. Write in clear, formal, native-quality academic English suitable for a German programme.

You must respond with ONLY valid JSON — no preamble, no markdown fences, no commentary. The schema is:
{
  "subject": "the subject line",
  "body": "the full letter body — plain text with \\n line breaks. No Markdown."
}

Structure:
- Header with candidate name, address, contact (placeholders OK)
- Date and recipient address
- Subject line
- Salutation "Dear Prof. Dr. [NAME]," or "Dear members of the [PROGRAMME] selection committee,"
- 3-4 paragraphs:
  1. Hook: why this specific programme, with a concrete reference to its research focus.
  2. Bridge: master's topic and methods, connected to the lab's work.
  3. Contribution: methods, software skills, languages.
  4. Closing: availability and interview line.
- Sign-off "Yours sincerely," + signature placeholder.
- Total body length: 280–380 words.

Hard rules:
- Never invent publications or experiences not mentioned.
- Never overstate language levels.
- Use the candidate's specific method names in the bridge paragraph.`;

/**
 * Build a compact programme description for the model.
 */
function summariseProgramme(programme, lang) {
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
    language: programme.language,
    description: desc,
    website: programme.website,
  };
}

/**
 * Main generator.
 *
 * @param {Object}  args
 * @param {Object}  args.programme        — full programme with .institution
 * @param {Object|null} args.profile      — parsed CV profile from runFullMatch
 * @param {string}  [args.cvText]         — raw CV fallback if no profile
 * @param {'formal'|'warm'|'research'} args.tone
 * @param {'de'|'en'} args.language
 * @param {string}  [args.extraNotes]
 */
export async function generateLetter({
  programme,
  profile,
  cvText,
  tone = 'formal',
  language = 'de',
  extraNotes = '',
}) {
  if (!programme) throw new Error('Programme is required');
  if (!profile && !cvText) throw new Error('Either profile or cvText is required');

  const candidatePayload = profile
    ? { type: 'parsed_profile', data: profile }
    : { type: 'raw_cv', data: cvText };

  const userPrompt = `CANDIDATE:
${JSON.stringify(candidatePayload, null, 2)}

TARGET PROGRAMME:
${JSON.stringify(summariseProgramme(programme, language), null, 2)}

TONE INSTRUCTIONS:
${TONE_GUIDANCE[tone] ?? TONE_GUIDANCE.formal}

${extraNotes ? `EXTRA CANDIDATE NOTES (incorporate naturally if relevant):\n${extraNotes}\n\n` : ''}Generate the Anschreiben now. Return ONLY the JSON object.`;

  const { text } = await callClaude({
    system: language === 'de' ? SYSTEM_DE : SYSTEM_EN,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 2200,
    temperature: 0.5,
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
