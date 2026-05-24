import { useState, useRef, useEffect, useMemo } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { callClaude } from '../lib/claude.js';
import { useInterviewHistory } from '../lib/interviewHistory.js';

const TOTAL_QUESTIONS = 6;

const FIELD_KEYS = [
  'cancer',
  'immunology',
  'neuroscience',
  'structural_biology',
  'genetics',
  'molecular_biology',
  'bioinformatics',
  'biochemistry',
  'cell_biology',
  'pharmacology',
];

const QUESTION_STAGES = [
  'motivation',
  'academic_background',
  'research_experience',
  'methodology',
  'research_proposal',
  'challenges',
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build AI system prompt for interviewer
// ─────────────────────────────────────────────────────────────────────────────
function buildInterviewerSystem(field, lang) {
  const langInstr =
    lang === 'de'
      ? 'Conduct the interview in German (Hochdeutsch). Be formal and use "Sie".'
      : lang === 'ar'
      ? 'Conduct the interview in Arabic. Use formal academic Arabic.'
      : 'Conduct the interview in English.';

  return `You are a senior professor at a top German life-sciences graduate school (e.g. DKFZ, EMBL, Charité) conducting a real PhD admission interview in the field of ${field}.

${langInstr}

Rules:
- Ask exactly ONE question at a time. Never ask multiple questions in one message.
- Follow this progression across 6 questions:
  Q1 – Motivation (why this field, why Germany, why PhD)
  Q2 – Academic background & thesis topic
  Q3 – Research experience & specific methods used
  Q4 – Methodology & how they would design an experiment
  Q5 – Research proposal / what question they would pursue in the lab
  Q6 – Handling challenges, failure, criticism in research
- Keep each question concise and clear (1–3 sentences).
- Do NOT give hints, feedback, or commentary between questions. Simply ask the next question.
- When you have received all 6 answers, output ONLY the JSON evaluation block described next.
- Never break character as the interviewer until evaluation time.`;
}

function buildEvaluationPrompt(field, conversation, lang) {
  const langInstr =
    lang === 'de'
      ? 'Write the entire evaluation in German.'
      : lang === 'ar'
      ? 'Write the entire evaluation in Arabic.'
      : 'Write the entire evaluation in English.';

  return `You are now evaluating a PhD interview candidate for a position in ${field} at a German life-sciences graduate school.

${langInstr}

Below is the complete interview transcript:
${conversation
  .filter((m) => m.role !== 'system')
  .map((m) => `${m.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
  .join('\n\n')}

Provide a detailed evaluation as valid JSON ONLY (no markdown fences, no commentary outside the JSON). Use this exact structure:
{
  "score": <integer 0-100>,
  "strengths": [<string>, <string>, <string>],
  "improve": [<string>, <string>, <string>],
  "tips": [<string>, <string>, <string>, <string>]
}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A — Interview Simulator
// ─────────────────────────────────────────────────────────────────────────────
function SimulatorSection() {
  const { t, lang } = useI18n();
  const s = (k) => t(`interview.simulator.${k}`);

  const [field, setField] = useState('');
  const [customField, setCustomField] = useState('');
  const [phase, setPhase] = useState('setup'); // setup | chat | evaluation
  const [messages, setMessages] = useState([]); // {role, content}
  const [questionIndex, setQuestionIndex] = useState(0); // 0-based current AI question
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const { save: saveInterview } = useInterviewHistory();
  const [savedId, setSavedId] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const effectiveField = field === '__custom__' ? customField : field
    ? s(`fields.${field}`)
    : '';

  async function startInterview() {
    if (!effectiveField.trim()) return;
    setError('');
    setPhase('chat');
    setLoading(true);

    const systemPrompt = buildInterviewerSystem(effectiveField, lang);
    const initMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '__START__' },
    ];

    try {
      const { text } = await callClaude({
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Please begin the interview with your first question.' }],
        temperature: 0.7,
        maxTokens: 512,
      });
      const aiMsg = { role: 'assistant', content: text };
      setMessages([aiMsg]);
      setQuestionIndex(1);
    } catch (e) {
      setError(s('error'));
      setPhase('setup');
    } finally {
      setLoading(false);
    }
  }

  async function sendAnswer() {
    if (!draft.trim() || loading) return;
    setError('');
    const userMsg = { role: 'user', content: draft.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setDraft('');
    setLoading(true);

    const nextQIndex = questionIndex + 1;
    const isLastAnswer = questionIndex >= TOTAL_QUESTIONS;

    try {
      if (isLastAnswer) {
        // Request evaluation
        const evalPrompt = buildEvaluationPrompt(effectiveField, newMessages, lang);
        const { text } = await callClaude({
          system: '',
          messages: [{ role: 'user', content: evalPrompt }],
          temperature: 0.3,
          maxTokens: 1200,
        });

        let parsed = null;
        try {
          const cleaned = text.replace(/```json|```/g, '').trim();
          parsed = JSON.parse(cleaned);
        } catch {
          setError(s('error'));
        }
        if (parsed) {
          setEvaluation(parsed);
          setPhase('evaluation');
          // Auto-save to history
          const id = saveInterview({
            field: effectiveField,
            lang,
            score: parsed.score ?? 0,
            strengths: parsed.strengths ?? [],
            improve: parsed.improve ?? [],
            tips: parsed.tips ?? [],
            transcript: newMessages.filter((m) => m.role !== 'system'),
          });
          setSavedId(id);
        }
      } else {
        // Ask next question
        const systemPrompt = buildInterviewerSystem(effectiveField, lang);
        const historyForAI = newMessages.map((m) => ({ role: m.role, content: m.content }));
        const { text } = await callClaude({
          system: systemPrompt,
          messages: historyForAI,
          temperature: 0.7,
          maxTokens: 512,
        });
        setMessages([...newMessages, { role: 'assistant', content: text }]);
        setQuestionIndex(nextQIndex);
      }
    } catch (e) {
      setError(s('error'));
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPhase('setup');
    setMessages([]);
    setQuestionIndex(0);
    setDraft('');
    setEvaluation(null);
    setError('');
  }

  // ── Setup screen ──────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="max-w-2xl">
        <div className="mb-8">
          <label className="block font-mono text-[11px] tracking-[0.15em] uppercase text-muted mb-3">
            {s('field_label')}
          </label>
          <select
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="input-editorial w-full mb-3"
          >
            <option value="">{s('field_placeholder')}</option>
            {FIELD_KEYS.map((fk) => (
              <option key={fk} value={fk}>{s(`fields.${fk}`)}</option>
            ))}
            <option value="__custom__">— {t('interview.simulator.field_hint').split('.')[0]}…</option>
          </select>

          {field === '__custom__' && (
            <input
              type="text"
              value={customField}
              onChange={(e) => setCustomField(e.target.value)}
              placeholder={s('field_placeholder')}
              className="input-editorial w-full mt-2"
            />
          )}
        </div>

        {error && (
          <p className="text-sienna text-sm mb-4">{error}</p>
        )}

        <button
          className="btn-primary"
          disabled={!effectiveField.trim() || loading}
          onClick={startInterview}
        >
          {loading ? s('thinking') : s('start')}
        </button>
      </div>
    );
  }

  // ── Evaluation screen ──────────────────────────────────
  if (phase === 'evaluation' && evaluation) {
    const scoreColor =
      evaluation.score >= 75
        ? 'text-emerald-700'
        : evaluation.score >= 50
        ? 'text-amber-700'
        : 'text-sienna';

    return (
      <div className="max-w-2xl space-y-8">
        {/* Score */}
        <div className="pi-card text-center py-10">
          <div className="font-mono text-[11px] tracking-[0.15em] uppercase text-muted mb-3">
            {s('score_label')}
          </div>
          <div className={`font-display text-6xl font-bold ${scoreColor}`}>
            {evaluation.score}
            <span className="text-3xl font-normal text-muted">%</span>
          </div>
          {savedId && (
            <div className="font-mono text-[10.5px] tracking-wider uppercase text-sage mt-3">
              {s('saved')}
            </div>
          )}
        </div>

        {/* Strengths */}
        <div>
          <h3 className="section-marker">
            <span className="font-mono text-[10px] text-muted">01.</span>
            <span className="font-display text-lg">{s('strengths_label')}</span>
          </h3>
          <ul className="space-y-2">
            {(evaluation.strengths || []).map((item, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-emerald-600 mt-0.5 shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improve */}
        <div>
          <h3 className="section-marker">
            <span className="font-mono text-[10px] text-muted">02.</span>
            <span className="font-display text-lg">{s('improve_label')}</span>
          </h3>
          <ul className="space-y-2">
            {(evaluation.improve || []).map((item, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-sienna mt-0.5 shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tips */}
        <div>
          <h3 className="section-marker">
            <span className="font-mono text-[10px] text-muted">03.</span>
            <span className="font-display text-lg">{s('tips_label')}</span>
          </h3>
          <ul className="space-y-2">
            {(evaluation.tips || []).map((item, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-navy mt-0.5 shrink-0">◆</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4 pt-4 border-t border-rule">
          <button className="btn-primary" onClick={reset}>{s('restart')}</button>
          <button className="btn-ghost" onClick={() => {
            setPhase('chat');
            setMessages([]);
            setQuestionIndex(0);
            setEvaluation(null);
            setLoading(true);
            // Re-start same field with new questions
            const systemPrompt = buildInterviewerSystem(effectiveField, lang);
            callClaude({
              system: systemPrompt,
              messages: [{ role: 'user', content: 'Please begin the interview with your first question. Use different questions from last time.' }],
              temperature: 0.9,
              maxTokens: 512,
            }).then(({ text }) => {
              setMessages([{ role: 'assistant', content: text }]);
              setQuestionIndex(1);
              setLoading(false);
            }).catch(() => {
              setError(s('error'));
              setLoading(false);
            });
          }}>
            {s('new_questions')}
          </button>
        </div>
      </div>
    );
  }

  // ── Chat screen ───────────────────────────────────────
  return (
    <div className="max-w-2xl flex flex-col gap-6">
      {/* Progress */}
      <div className="flex items-center gap-4">
        <span className="specimen">{t('interview.simulator.question_of', { n: Math.min(questionIndex, TOTAL_QUESTIONS), total: TOTAL_QUESTIONS })}</span>
        <div className="flex-1 h-px bg-rule relative">
          <div
            className="absolute inset-y-0 start-0 bg-ink transition-all duration-500"
            style={{ width: `${(Math.min(questionIndex, TOTAL_QUESTIONS) / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={[
              'px-5 py-4 text-sm leading-relaxed',
              m.role === 'assistant'
                ? 'bg-paper border border-rule border-s-2 border-s-navy'
                : 'bg-ink/5 border border-rule/60',
            ].join(' ')}
          >
            {m.role === 'assistant' && (
              <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-navy mb-2">
                Prof. Dr. —
              </div>
            )}
            <p>{m.content}</p>
          </div>
        ))}

        {loading && (
          <div className="px-5 py-4 border border-rule border-s-2 border-s-navy bg-paper">
            <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-navy mb-2">
              Prof. Dr. —
            </div>
            <span className="text-muted text-sm animate-pulse">{s('thinking')}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Answer input — only show while chat is ongoing */}
      {questionIndex <= TOTAL_QUESTIONS && !loading && (
        <div className="flex gap-3 items-end border-t border-rule pt-4">
          <textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={s('your_answer')}
            className="input-editorial flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendAnswer();
            }}
          />
          <button
            className="btn-primary shrink-0"
            onClick={sendAnswer}
            disabled={!draft.trim()}
          >
            {s('send')}
          </button>
        </div>
      )}

      {error && <p className="text-sienna text-sm">{error}</p>}

      <button className="btn-link text-sm self-start" onClick={reset}>
        ← {s('restart')}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B — Tips Guide
// ─────────────────────────────────────────────────────────────────────────────
function TipsSection() {
  const { t } = useI18n();
  const g = (k) => t(`interview.tips.${k}`);

  const TIP_SECTIONS = ['before', 'during', 'after'];
  const ICONS = { before: '◐', during: '◉', after: '◑' };

  return (
    <div className="space-y-16">
      {/* Intro */}
      <p className="text-base text-ink2 max-w-2xl dropcap text-pretty">{g('intro')}</p>

      {/* Before / During / After */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {TIP_SECTIONS.map((sec, idx) => {
          const section = t(`interview.tips.sections.${sec}`);
          return (
            <div key={sec} className="pi-card">
              <div className="flex items-baseline gap-3 mb-5">
                <span className="font-mono text-[10px] text-muted">{String(idx + 1).padStart(2, '0')}.</span>
                <span className="font-display-italic text-xl text-navy">{ICONS[sec]}</span>
                <h3 className="font-display text-base">{section.title}</h3>
              </div>
              <ul className="space-y-3">
                {(section.items || []).map((item, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-ink2">
                    <span className="text-sienna mt-1 shrink-0 font-mono text-[11px]">{String(i + 1).padStart(2, '0')}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Culture box */}
      <div className="border border-navy/20 bg-navy/[0.03] px-8 py-7">
        <div className="flex items-baseline gap-3 mb-5">
          <span className="specimen bg-navy text-paper border-navy">DE</span>
          <h3 className="font-display text-base">{g('culture_note_title')}</h3>
        </div>
        <ul className="space-y-3">
          {(t('interview.tips.culture_notes') || []).map((note, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-navy font-mono text-[10px] mt-1 shrink-0">◆</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C — Interview History
// ─────────────────────────────────────────────────────────────────────────────
function HistorySection() {
  const { t, lang } = useI18n();
  const s = (k, vars) => t(`interview.simulator.${k}`, vars);
  const { records, remove, clearAll } = useInterviewHistory();
  const [openId, setOpenId] = useState(null);

  const fieldLabel = (f) => t(`interview.simulator.fields.${f}`) || f;
  const fmtDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString(
        lang === 'de' ? 'de-DE' : lang === 'ar' ? 'ar' : 'en-GB',
        { day: '2-digit', month: 'short', year: 'numeric' }
      );
    } catch { return iso; }
  };

  // Build a small score-trend sparkline (oldest → newest, left → right)
  const trend = useMemo(() => {
    const pts = [...records].reverse().map((r) => r.score); // oldest first
    return pts;
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="max-w-2xl border border-dashed border-rule p-10 text-center">
        <div className="font-display text-3xl text-muted mb-2">◷</div>
        <p className="text-ink2 leading-relaxed">{s('history_empty')}</p>
      </div>
    );
  }

  const open = records.find((r) => r.id === openId);

  return (
    <div className="max-w-3xl space-y-10">
      {/* TREND CHART */}
      {trend.length >= 2 && (
        <div className="pi-card">
          <div className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-muted mb-4">
            ◈ {s('trend_title')}
          </div>
          <Sparkline values={trend} />
        </div>
      )}

      {/* LIST */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-muted">
            {s('your_progress')} · {records.length}
          </span>
          <button
            onClick={() => {
              if (window.confirm(s('history_clear_confirm'))) clearAll();
            }}
            className="font-mono text-[10.5px] tracking-wider uppercase text-muted hover:text-danger"
          >
            {s('history_clear')}
          </button>
        </div>

        <div className="space-y-3">
          {records.map((r) => {
            const tone =
              r.score >= 75 ? 'text-emerald-700'
              : r.score >= 50 ? 'text-amber-700'
              : 'text-sienna';
            return (
              <article key={r.id} className="border border-rule bg-paper hover:border-ink transition-colors">
                <div className="flex items-center gap-4 p-4">
                  <div className={`font-display text-3xl font-bold ${tone} shrink-0 w-16 text-center`}>
                    {r.score}<span className="text-base font-normal text-muted">%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-base text-ink leading-tight">
                      {fieldLabel(r.field)}
                    </div>
                    <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted mt-0.5">
                      {fmtDate(r.createdAt)} · {r.lang?.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setOpenId(openId === r.id ? null : r.id)}
                      className="text-sm text-navy hover:text-sienna underline underline-offset-2"
                    >
                      {s('history_view')}
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="text-muted hover:text-danger text-sm"
                      title={s('history_remove')}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Expanded evaluation */}
                {openId === r.id && (
                  <div className="border-t border-rule p-5 space-y-5 bg-paper2/30">
                    {[
                      { label: s('strengths_label'), items: r.strengths, mark: '✓', color: 'text-emerald-600' },
                      { label: s('improve_label'), items: r.improve, mark: '→', color: 'text-sienna' },
                      { label: s('tips_label'), items: r.tips, mark: '◆', color: 'text-navy' },
                    ].map((block, bi) => (
                      <div key={bi}>
                        <div className="font-mono text-[10px] tracking-wider uppercase text-muted mb-2">
                          {block.label}
                        </div>
                        <ul className="space-y-1.5">
                          {(block.items || []).map((item, i) => (
                            <li key={i} className="flex gap-2.5 text-sm text-ink2">
                              <span className={`${block.color} mt-0.5 shrink-0`}>{block.mark}</span>
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Minimal dependency-free score sparkline (0-100 scale).
function Sparkline({ values }) {
  const W = 600, H = 120, pad = 16;
  const n = values.length;
  const max = 100, min = 0;
  const x = (i) => pad + (i * (W - 2 * pad)) / Math.max(1, n - 1);
  const y = (v) => H - pad - ((v - min) / (max - min)) * (H - 2 * pad);

  const linePath = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${x(n - 1).toFixed(1)} ${H - pad} L${x(0).toFixed(1)} ${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none" style={{ maxHeight: 140 }}>
      {/* gridlines at 50 and 75 */}
      {[50, 75].map((g) => (
        <line key={g} x1={pad} y1={y(g)} x2={W - pad} y2={y(g)} stroke="#C9BFA8" strokeWidth="0.6" strokeDasharray="3 4" />
      ))}
      <path d={areaPath} fill="#1B2A4E" opacity="0.06" />
      <path d={linePath} fill="none" stroke="#1B2A4E" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="3.5"
          fill={v >= 75 ? '#047857' : v >= 50 ? '#b45309' : '#9C4A2C'} />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function InterviewPrep() {
  const { t, isRtl } = useI18n();
  const [activeTab, setActiveTab] = useState('simulator');

  const TABS = [
    { key: 'simulator', icon: '✺' },
    { key: 'tips', icon: '✎' },
    { key: 'history', icon: '◷' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
      {/* HERO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 lg:mb-20">
        <div className="lg:col-span-8">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sienna mb-4">
            ❦ {t('interview.hero_eyebrow')}
          </div>
          <h1 className="font-display text-display-lg text-ink text-balance leading-[0.95]">
            {t('interview.hero_title')}
          </h1>
        </div>

        <div className="lg:col-span-4 lg:pt-6 lg:border-s lg:border-rule lg:ps-8">
          <p className="text-base leading-relaxed text-ink2 dropcap text-pretty">
            {t('interview.hero_lead')}
          </p>
        </div>
      </section>

      {/* TAB BAR */}
      <nav className="border-y border-rule mb-12 sticky top-[105px] bg-paper/95 backdrop-blur-sm z-30 -mx-6 lg:-mx-12 px-6 lg:px-12">
        <div className="flex overflow-x-auto">
          {TABS.map((tab, i) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex items-baseline gap-2 px-4 lg:px-5 py-4 text-sm whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'text-ink border-ink'
                  : 'text-ink2 border-transparent hover:text-ink',
              ].join(' ')}
            >
              <span className="font-mono text-[10px] text-muted">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display-italic me-1">{tab.icon}</span>
              <span>{t(`interview.tabs.${tab.key}`)}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* SECTION HEADER */}
      <div className="mb-10">
        <div className="section-marker">
          <span className="font-mono text-[10px] text-muted">
            {activeTab === 'simulator' ? 'I.' : activeTab === 'tips' ? 'II.' : 'III.'}
          </span>
          <h2 className="font-display text-2xl">
            {activeTab === 'simulator'
              ? t('interview.simulator.title')
              : activeTab === 'tips'
              ? t('interview.tips.title')
              : t('interview.simulator.history_title')}
          </h2>
        </div>
      </div>

      {/* CONTENT */}
      <div className="pb-24" key={activeTab}>
        {activeTab === 'simulator' && <SimulatorSection />}
        {activeTab === 'tips' && <TipsSection />}
        {activeTab === 'history' && <HistorySection />}
      </div>
    </div>
  );
}
