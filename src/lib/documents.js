/**
 * Application-kit document generators.
 *
 * Complements letter.js. Two document types, each tailored to a target
 * programme using the candidate's CV-Match profile (or raw CV):
 *
 *   - research_statement → { title, body }   (Forschungsexposé / motivation)
 *   - academic_cv        → { sections: [...] } (structured academic CV)
 *
 * Same hard rules as letter.js: never invent publications, awards, methods,
 * or language levels the candidate did not provide.
 */

import { callClaude } from './claude.js';

// ─────────────────────────────────────────────────────────────────────────
// RESEARCH STATEMENT
// ─────────────────────────────────────────────────────────────────────────
const RESEARCH_SYSTEM = {
  de: `Du bist ein erfahrener wissenschaftlicher Coach, der internationale Kandidaten bei Forschungsexposés (Research Statements / Motivationsschreiben) für deutsche Promotionsprogramme in den Lebenswissenschaften unterstützt. Du schreibst exzellentes, muttersprachliches wissenschaftliches Deutsch.

Antworte AUSSCHLIESSLICH mit gültigem JSON — kein Vorwort, keine Markdown-Zäune. Schema:
{
  "title": "Titel des Forschungsexposés",
  "body": "Volltext mit \\\\n Zeilenumbrüchen. Kein Markdown."
}

Aufbau des Exposés (450–650 Wörter):
1. Forschungsinteresse: die übergeordnete wissenschaftliche Frage, die dich antreibt. (1 Absatz)
2. Bisherige Erfahrung: dein Masterthema, Methoden und zentrale Erkenntnisse — konkret und mit Methodennamen. (1–2 Absätze)
3. Passung zum Programm/Labor: wie deine Interessen an die Forschung der Gruppe anknüpfen, mit konkretem Bezug. (1 Absatz)
4. Zukunftsperspektive: welche Fragen du in der Promotion verfolgen möchtest. (1 Absatz)

Harte Regeln:
- Erfinde NIEMALS Publikationen, Auszeichnungen oder Erfahrungen.
- Nenne Methoden beim Namen, wenn der Kandidat sie erwähnt hat.
- Übertreibe keine Sprachkenntnisse.
- Sachlich, präzise, ohne Ausrufezeichen.`,

  en: `You are an experienced scientific coach helping international candidates write Research Statements for German PhD programmes in the life sciences. Write clear, formal, native-quality academic English.

Respond with ONLY valid JSON — no preamble, no markdown fences. Schema:
{
  "title": "title of the research statement",
  "body": "full text with \\\\n line breaks. No Markdown."
}

Structure (450–650 words):
1. Research interest: the overarching scientific question that drives you. (1 paragraph)
2. Prior experience: your master's topic, methods, and key findings — concrete, naming methods. (1–2 paragraphs)
3. Fit with the programme/lab: how your interests connect to the group's research, with concrete reference. (1 paragraph)
4. Future direction: the questions you want to pursue in your PhD. (1 paragraph)

Hard rules:
- NEVER invent publications, awards, or experiences.
- Name methods the candidate actually mentioned.
- Do not overstate language levels.
- Factual, precise, no exclamation marks.`,
};

// ─────────────────────────────────────────────────────────────────────────
// ACADEMIC CV
// ─────────────────────────────────────────────────────────────────────────
const CV_SYSTEM = {
  de: `Du bist ein Experte für akademische Lebensläufe (Academic CV) im deutschen Wissenschaftssystem. Du strukturierst die Angaben eines Kandidaten in einen sauberen, tabellarischen akademischen Lebenslauf.

Antworte AUSSCHLIESSLICH mit gültigem JSON. Schema:
{
  "sections": [
    { "heading": "Abschnittstitel", "entries": [
      { "left": "Zeitraum oder Stichwort", "right": "Beschreibung / Institution / Detail" }
    ]}
  ]
}

Typische Abschnitte (nur aufnehmen, wenn Daten vorhanden):
- Persönliche Angaben
- Ausbildung (Studium, Abschlüsse mit Jahr und Institution)
- Forschungserfahrung (Masterarbeit, Projekte, Methoden)
- Methodische Kompetenzen
- Sprachen (mit Niveau)
- Technische Fähigkeiten / Software

Harte Regeln:
- Erfinde NICHTS. Nutze nur die Angaben des Kandidaten.
- Wenn ein Abschnitt keine Daten hat, lasse ihn weg.
- Halte "left" kurz (Jahr/Stichwort), "right" beschreibend.`,

  en: `You are an expert in academic CVs for the German research system. Structure a candidate's details into a clean, tabular academic CV.

Respond with ONLY valid JSON. Schema:
{
  "sections": [
    { "heading": "section title", "entries": [
      { "left": "period or keyword", "right": "description / institution / detail" }
    ]}
  ]
}

Typical sections (include only if data exists):
- Personal details
- Education (degrees with year and institution)
- Research experience (master's thesis, projects, methods)
- Methodological skills
- Languages (with level)
- Technical skills / software

Hard rules:
- Invent NOTHING. Use only the candidate's data.
- Omit any section with no data.
- Keep "left" short (year/keyword), "right" descriptive.`,
};

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
    city: programme.institution?.city,
    fields: programme.fields,
    description: desc,
  };
}

function candidatePayload(profile, cvText) {
  return profile
    ? { type: 'parsed_profile', data: profile }
    : { type: 'raw_cv', data: cvText };
}

/**
 * Generate a research statement tailored to a target programme.
 */
export async function generateResearchStatement({
  programme, profile, cvText, language = 'de', extraNotes = '',
}) {
  if (!profile && !cvText) throw new Error('Either profile or cvText is required');

  const userPrompt = `CANDIDATE:
${JSON.stringify(candidatePayload(profile, cvText), null, 2)}

${programme ? `TARGET PROGRAMME:\n${JSON.stringify(summariseProgramme(programme, language), null, 2)}\n` : ''}
${extraNotes ? `EXTRA NOTES (incorporate naturally if relevant):\n${extraNotes}\n` : ''}
Generate the research statement now. Return ONLY the JSON object.`;

  const { text } = await callClaude({
    system: RESEARCH_SYSTEM[language] ?? RESEARCH_SYSTEM.de,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 2600,
    temperature: 0.5,
  });
  return parseJson(text);
}

/**
 * Generate a structured academic CV from the candidate's profile.
 */
export async function generateAcademicCv({
  profile, cvText, language = 'de',
}) {
  if (!profile && !cvText) throw new Error('Either profile or cvText is required');

  const userPrompt = `CANDIDATE:
${JSON.stringify(candidatePayload(profile, cvText), null, 2)}

Structure this into a clean academic CV. Return ONLY the JSON object.`;

  const { text } = await callClaude({
    system: CV_SYSTEM[language] ?? CV_SYSTEM.de,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 2600,
    temperature: 0.3,
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
    const error = new Error('Failed to parse response as JSON');
    error.raw = text;
    throw error;
  }
}
