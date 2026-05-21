import { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { programmesWithInstitutions } from '../data/seed.js';
import { supabase, hasSupabase } from '../lib/supabase.js';
import { runFullMatch } from '../lib/cvMatch.js';
import { ensureInTracker, removeFromTrackerByProgramme, useTracker } from '../lib/tracker.js';
import { useProfile } from '../lib/profile.js';
import MatchCard from '../components/MatchCard.jsx';

const STORAGE_KEY = 'phd-match-cv-results';
const STORAGE_CV = 'phd-match-cv-draft';

export default function Match() {
  const { t, lang } = useI18n();

  // ─── Source programmes ──────────────────────────
  const [programmes, setProgrammes] = useState(programmesWithInstitutions);

  useEffect(() => {
    if (!hasSupabase) return;
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from('programmes')
        .select('*, institution:institutions(*)');
      if (alive && !error && data?.length) setProgrammes(data);
    })();
    return () => { alive = false; };
  }, []);

  // ─── Form state ─────────────────────────────────
  const { profile } = useProfile();
  const [cvText, setCvText] = useState(() => {
    // Prefer the saved profile's CV text on first mount, then fall back
    // to the rolling draft, then empty.
    const draft = localStorage.getItem(STORAGE_CV);
    const profileCv = (typeof window !== 'undefined')
      ? (() => {
          try { return JSON.parse(localStorage.getItem('phd-match-profile-v1'))?.cv_text ?? ''; }
          catch { return ''; }
        })()
      : '';
    return draft || profileCv || '';
  });
  const [interests, setInterests] = useState(() => {
    try {
      const p = JSON.parse(localStorage.getItem('phd-match-profile-v1'));
      return (p?.fields_of_interest ?? []).join(', ');
    } catch { return ''; }
  });
  const [stage, setStage] = useState(null);  // null | 'parsing' | 'matching' | 'ranking' | 'done'
  const [error, setError] = useState(null);

  // ─── Result state ───────────────────────────────
  const [result, setResult] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null; }
    catch { return null; }
  });

  // Pull saved programme IDs directly from the tracker, so saving here
  // and from Discover stays in sync.
  const { apps } = useTracker();
  const savedIds = useMemo(() => apps.map((a) => a.programmeId), [apps]);

  // Persist
  useEffect(() => { localStorage.setItem(STORAGE_CV, cvText); }, [cvText]);
  useEffect(() => {
    if (result) localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  }, [result]);

  // ─── Actions ────────────────────────────────────
  const hasKey = Boolean(import.meta.env.VITE_ANTHROPIC_KEY);
  const canRun = cvText.trim().length >= 200 && stage === null;

  const onAnalyse = async () => {
    if (!hasKey) {
      setError(t('match.errors.no_key'));
      return;
    }
    if (cvText.trim().length < 200) {
      setError(t('match.errors.too_short'));
      return;
    }

    setError(null);
    setResult(null);
    setStage('parsing');

    try {
      const r = await runFullMatch({
        cvText,
        extraInterests: interests,
        programmes,
        lang,
        onProgress: (s) => setStage(s),
      });
      setResult(r);
      setStage('done');
    } catch (err) {
      console.error(err);
      setError(`${t('match.errors.api_error')} ${err.message}`);
      setStage(null);
    }
  };

  const onReset = () => {
    setResult(null);
    setStage(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const onSave = (programme) => {
    // Find match score to seed fit
    const matchEntry = result?.matches?.find((m) => m.id === programme.id);
    if (savedIds.includes(programme.id)) {
      removeFromTrackerByProgramme(programme.id);
    } else {
      ensureInTracker({
        programmeId: programme.id,
        source: 'match',
        fit: matchEntry?.score ?? null,
      });
    }
  };

  // Join matches with programme objects
  const rankedMatches = useMemo(() => {
    if (!result?.matches) return [];
    return result.matches
      .map((m) => ({
        match: m,
        programme: programmes.find((p) => p.id === m.id),
      }))
      .filter((x) => x.programme);
  }, [result, programmes]);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
      {/* HERO ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 lg:mb-16 animate-fade-up">
        <div className="lg:col-span-8">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sienna mb-4">
            ❦ {t('match.hero_eyebrow')}
          </div>
          <h1 className="font-display text-display-lg text-ink text-balance leading-[0.95]">
            {t('match.hero_title')}
          </h1>
        </div>

        <div className="lg:col-span-4 lg:pt-6 lg:border-l lg:border-rule lg:pl-8">
          <p className="text-base leading-relaxed text-ink2 dropcap text-pretty">
            {t('match.hero_lead')}
          </p>
        </div>
      </section>

      {/* STEP 1 — INPUT ──────────────────────────────────── */}
      {!result && (
        <section className="mb-12">
          <StepHeader number="01" title={t('match.step1.title')} />
          <p className="text-ink2 leading-relaxed mb-4 max-w-3xl text-pretty">
            {t('match.step1.intro')}
          </p>

          {profile?.cv_text && cvText === profile.cv_text && (
            <div className="mb-6 inline-flex items-center gap-2 font-mono text-[10.5px] tracking-wider uppercase text-sienna border border-sienna/40 bg-sienna/5 px-3 py-1.5">
              ✦ Aus Profil geladen · From your Profile
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder={t('match.step1.placeholder')}
                rows={18}
                className="w-full bg-paper2/40 border border-rule p-5 font-mono text-[13.5px] text-ink2 leading-relaxed
                           focus:outline-none focus:border-ink resize-y placeholder:text-muted/70"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-[10.5px] tracking-wider uppercase text-muted">
                  {cvText.trim().length} chars
                  {cvText.trim().length < 200 && (
                    <span className="ms-2 text-ochre">· {t('match.step1.min_chars')}</span>
                  )}
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 lg:border-l lg:border-rule lg:pl-8">
              <label className="block">
                <span className="font-mono text-[10.5px] tracking-wider uppercase text-muted mb-2 block">
                  {t('match.step1.fields_label')}
                </span>
                <textarea
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  rows={4}
                  placeholder="cancer immunology, neuroinflammation, single-cell methods…"
                  className="w-full bg-transparent border border-rule p-3 text-[14px] text-ink2
                             focus:outline-none focus:border-ink resize-y"
                />
              </label>

              {error && (
                <div className="mt-4 border border-danger bg-danger/5 p-3 text-sm text-danger">
                  {error}
                </div>
              )}

              {!hasKey && (
                <div className="mt-4 border border-ochre/40 bg-ochre/5 p-3 text-xs text-ink2 leading-relaxed">
                  <div className="font-mono text-[10px] tracking-wider uppercase text-ochre mb-1">
                    ⚠ Setup
                  </div>
                  {t('match.errors.no_key')}
                </div>
              )}

              <button
                onClick={onAnalyse}
                disabled={!canRun}
                className="mt-6 w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {stage ? t('match.step1.analyzing') : t('match.step1.analyze')}
                {!stage && <ArrowIcon />}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STEP 2 — ANALYSING ─────────────────────────────── */}
      {stage && stage !== 'done' && (
        <section className="mb-12 border border-rule p-8 lg:p-12 bg-paper2/30">
          <StepHeader number="02" title={t('match.step2.title')} />

          <ol className="space-y-4 max-w-2xl">
            {['parsing', 'matching', 'ranking'].map((s) => {
              const isActive = stage === s;
              const isDone = ['parsing', 'matching', 'ranking'].indexOf(stage) > ['parsing', 'matching', 'ranking'].indexOf(s);
              return (
                <li key={s} className="flex items-baseline gap-4">
                  <span className={[
                    'font-mono text-sm',
                    isDone ? 'text-sage' : isActive ? 'text-sienna animate-pulse' : 'text-muted',
                  ].join(' ')}>
                    {isDone ? '✓' : isActive ? '●' : '○'}
                  </span>
                  <span className={[
                    'font-display text-lg',
                    isDone ? 'text-ink2' : isActive ? 'text-ink' : 'text-muted',
                  ].join(' ')}>
                    {t(`match.step2.stages.${s}`)}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* STEP 3 — RESULTS ───────────────────────────────── */}
      {result && stage === 'done' && (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
            <StepHeader number="03" title={t('match.step3.title')} />
            <button
              onClick={onReset}
              className="btn-ghost text-sm"
            >
              ↻ {t('match.step3.reset')}
            </button>
          </div>

          <p className="text-ink2 leading-relaxed mb-10 max-w-3xl text-pretty">
            {t('match.step3.intro')} · <span className="text-muted">{t('match.step3.showing', { visible: rankedMatches.length, total: programmes.length })}</span>
          </p>

          {/* PROFILE SUMMARY ─────────────────────────────── */}
          {result.profile && (
            <ProfileSummary profile={result.profile} />
          )}

          {/* RANKED MATCHES ──────────────────────────────── */}
          <div className="space-y-4">
            {rankedMatches.map(({ match, programme }, i) => (
              <div
                key={programme.id}
                className="animate-fade-up opacity-0"
                style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
              >
                <MatchCard
                  programme={programme}
                  match={match}
                  rank={i + 1}
                  onSave={onSave}
                  isSaved={savedIds.includes(programme.id)}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════

function StepHeader({ number, title }) {
  return (
    <div className="section-marker">
      <span className="font-mono text-xs tracking-wider text-muted">{number}.</span>
      <h2 className="font-display text-display-md text-ink">{title}</h2>
    </div>
  );
}

function ProfileSummary({ profile }) {
  const { t } = useI18n();
  return (
    <aside className="border-y-2 border-ink bg-paper2/40 p-6 lg:p-8 mb-10">
      <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-sienna mb-4">
        ◐ {t('match.step3.summary_title')}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
        <div className="md:col-span-7">
          {profile.degree && (
            <p className="font-display text-xl text-ink leading-snug mb-2 text-balance">
              {profile.degree}
            </p>
          )}
          {profile.current_status && (
            <p className="font-display-italic text-base text-muted leading-relaxed mb-4">
              {profile.current_status}
            </p>
          )}

          {profile.methods?.length > 0 && (
            <div className="mb-4">
              <div className="font-mono text-[10px] tracking-wider uppercase text-muted mb-1.5">
                Methods
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.methods.map((m, i) => (
                  <span key={i} className="tag">{m}</span>
                ))}
              </div>
            </div>
          )}

          {profile.software?.length > 0 && (
            <div>
              <div className="font-mono text-[10px] tracking-wider uppercase text-muted mb-1.5">
                Software
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.software.map((s, i) => (
                  <span key={i} className="tag">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-5 md:border-l md:border-rule md:ps-8">
          {profile.experience_strengths?.length > 0 && (
            <div className="mb-4">
              <div className="font-mono text-[10px] tracking-wider uppercase text-sage mb-2">
                ✓ {t('match.step3.strengths')}
              </div>
              <ul className="space-y-1.5">
                {profile.experience_strengths.map((s, i) => (
                  <li key={i} className="text-sm text-ink2 leading-snug ps-3 relative before:content-['→'] before:absolute before:start-0 before:text-sage">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {profile.potential_gaps?.length > 0 && (
            <div>
              <div className="font-mono text-[10px] tracking-wider uppercase text-ochre mb-2">
                ⚠ {t('match.step3.gaps')}
              </div>
              <ul className="space-y-1.5">
                {profile.potential_gaps.map((g, i) => (
                  <li key={i} className="text-sm text-ink2 leading-snug ps-3 relative before:content-['—'] before:absolute before:start-0 before:text-ochre">
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function ArrowIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" className="ms-2">
      <path d="M1 5.5h9M6 1.5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  );
}
