import { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { programmesWithInstitutions } from '../data/seed.js';
import { supabase, hasSupabase } from '../lib/supabase.js';
import { useTracker } from '../lib/tracker.js';
import { useProfile } from '../lib/profile.js';
import { generateLetter } from '../lib/letter.js';

const CV_RESULTS_KEY = 'phd-match-cv-results';
const CV_DRAFT_KEY = 'phd-match-cv-draft';
const REVISIONS_KEY = 'phd-match-letter-revisions';

const TONES = ['formal', 'warm', 'research'];

export default function Letter() {
  const { t, lang } = useI18n();
  const { apps } = useTracker();

  // ─── Programmes catalogue ───────────────────────
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

  const programmeMap = useMemo(
    () => Object.fromEntries(programmes.map((p) => [p.id, p])),
    [programmes]
  );

  // ─── Form state ─────────────────────────────────
  const { profile } = useProfile();
  const [selectedProgrammeId, setSelectedProgrammeId] = useState(null);
  const [tone, setTone] = useState('formal');
  const [letterLang, setLetterLang] = useState(lang === 'ar' ? 'de' : lang);
  const [extraNotes, setExtraNotes] = useState('');
  const [profileSource, setProfileSource] = useState('match');  // 'match' | 'paste'
  const [pastedCv, setPastedCv] = useState(
    () => localStorage.getItem(CV_DRAFT_KEY) || profile?.cv_text || ''
  );

  // ─── Profile from CV-Match ──────────────────────
  const matchProfile = useMemo(() => {
    try {
      const r = JSON.parse(localStorage.getItem(CV_RESULTS_KEY));
      return r?.profile ?? null;
    } catch { return null; }
  }, []);

  // Auto-fallback to paste mode if no match profile
  useEffect(() => {
    if (!matchProfile && profileSource === 'match') setProfileSource('paste');
  }, [matchProfile]);  // eslint-disable-line

  // ─── Generation state ───────────────────────────
  const [generating, setGenerating] = useState(false);
  const [letter, setLetter] = useState(null);          // { subject, body }
  const [editableLetter, setEditableLetter] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // ─── Revisions ──────────────────────────────────
  const [revisions, setRevisions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(REVISIONS_KEY)) ?? []; }
    catch { return []; }
  });
  useEffect(() => {
    localStorage.setItem(REVISIONS_KEY, JSON.stringify(revisions));
  }, [revisions]);

  // Reset copied state after delay
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  // ─── Actions ────────────────────────────────────
  const hasKey = Boolean(import.meta.env.VITE_ANTHROPIC_KEY);
  const selectedProgramme = selectedProgrammeId ? programmeMap[selectedProgrammeId] : null;

  const onGenerate = async () => {
    setError(null);

    if (!hasKey) { setError(t('letter.errors.no_key')); return; }
    if (!selectedProgramme) { setError(t('letter.errors.no_programme')); return; }

    const usingProfile = profileSource === 'match' && matchProfile;
    if (!usingProfile && pastedCv.trim().length < 100) {
      setError(t('letter.errors.no_profile'));
      return;
    }

    setGenerating(true);
    try {
      const result = await generateLetter({
        programme: selectedProgramme,
        profile: usingProfile ? matchProfile : null,
        cvText: usingProfile ? null : pastedCv,
        tone,
        language: letterLang,
        extraNotes,
      });
      setLetter(result);
      setEditableLetter({ ...result });
    } catch (err) {
      console.error(err);
      setError(`${t('letter.errors.api_error')} ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const onCopy = async () => {
    const text = `${editableLetter.subject}\n\n${editableLetter.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setError('Clipboard write failed.');
    }
  };

  const onSaveRevision = () => {
    if (!editableLetter || !selectedProgramme) return;
    const rev = {
      id: 'rev_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3),
      programmeId: selectedProgramme.id,
      programmeName: selectedProgramme.name,
      institution: selectedProgramme.institution?.short_name,
      subject: editableLetter.subject,
      body: editableLetter.body,
      tone,
      language: letterLang,
      createdAt: new Date().toISOString(),
    };
    setRevisions((prev) => [rev, ...prev].slice(0, 30));  // cap at 30
  };

  const onLoadRevision = (rev) => {
    setSelectedProgrammeId(rev.programmeId);
    setLetter({ subject: rev.subject, body: rev.body });
    setEditableLetter({ subject: rev.subject, body: rev.body });
    setTone(rev.tone);
    setLetterLang(rev.language);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onRemoveRevision = (id) => {
    setRevisions((prev) => prev.filter((r) => r.id !== id));
  };

  // Programmes from tracker
  const trackerProgrammes = useMemo(
    () => apps.map((a) => programmeMap[a.programmeId]).filter(Boolean),
    [apps, programmeMap]
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
      {/* HERO ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 lg:mb-16 animate-fade-up">
        <div className="lg:col-span-8">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sienna mb-4">
            ❦ {t('letter.hero_eyebrow')}
          </div>
          <h1 className="font-display text-display-lg text-ink text-balance leading-[0.95]">
            {t('letter.hero_title')}
          </h1>
        </div>

        <div className="lg:col-span-4 lg:pt-6 lg:border-l lg:border-rule lg:pl-8">
          <p className="text-base leading-relaxed text-ink2 dropcap text-pretty">
            {t('letter.hero_lead')}
          </p>
        </div>
      </section>

      {/* STEP 1 — PICK PROGRAMME ─────────────────────────── */}
      <section className="mb-12">
        <StepHeader number="01" title={t('letter.step1.title')} />

        <ProgrammePicker
          trackerProgrammes={trackerProgrammes}
          allProgrammes={programmes}
          selectedId={selectedProgrammeId}
          onSelect={setSelectedProgrammeId}
        />
      </section>

      {/* STEP 2 — SETTINGS ──────────────────────────────── */}
      {selectedProgramme && (
        <section className="mb-12 animate-fade-up">
          <StepHeader number="02" title={t('letter.step2.title')} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column — tone + language */}
            <div>
              <SettingGroup label={t('letter.step2.tone')}>
                <div className="flex flex-col gap-2">
                  {TONES.map((tn) => (
                    <button
                      key={tn}
                      onClick={() => setTone(tn)}
                      className={[
                        'text-start px-4 py-3 border transition-colors',
                        tone === tn
                          ? 'border-ink bg-ink text-paper'
                          : 'border-rule hover:border-ink text-ink2',
                      ].join(' ')}
                    >
                      <span className={`font-mono text-[10px] tracking-[0.18em] uppercase ${tone === tn ? 'text-paper/70' : 'text-muted'} block mb-0.5`}>
                        {tn}
                      </span>
                      <span className="font-display text-base leading-tight">
                        {t(`letter.step2.tones.${tn}`)}
                      </span>
                    </button>
                  ))}
                </div>
              </SettingGroup>

              <SettingGroup label={t('letter.step2.language')}>
                <div className="flex gap-2">
                  {['de', 'en'].map((lc) => (
                    <button
                      key={lc}
                      onClick={() => setLetterLang(lc)}
                      className={letterLang === lc ? 'tag tag-active' : 'tag hover:border-ink'}
                    >
                      {t(`letter.step2.languages.${lc}`)}
                    </button>
                  ))}
                </div>
              </SettingGroup>
            </div>

            {/* Right column — profile source + extra notes */}
            <div>
              <SettingGroup label={t('letter.step2.profile_source')}>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setProfileSource('match')}
                    disabled={!matchProfile}
                    className={[
                      profileSource === 'match' ? 'tag tag-active' : 'tag hover:border-ink',
                      !matchProfile ? 'opacity-40 cursor-not-allowed' : '',
                    ].join(' ')}
                  >
                    ✦ {t('letter.step2.profile_from_match')}
                  </button>
                  <button
                    onClick={() => setProfileSource('paste')}
                    className={profileSource === 'paste' ? 'tag tag-active' : 'tag hover:border-ink'}
                  >
                    ✎ {t('letter.step2.profile_paste')}
                  </button>
                </div>

                {profileSource === 'match' && !matchProfile && (
                  <p className="text-xs text-ochre leading-relaxed">
                    {t('letter.step2.no_profile_yet')}
                  </p>
                )}

                {profileSource === 'paste' && (
                  <textarea
                    value={pastedCv}
                    onChange={(e) => { setPastedCv(e.target.value); localStorage.setItem(CV_DRAFT_KEY, e.target.value); }}
                    rows={6}
                    placeholder={t('letter.step2.paste_label')}
                    className="w-full bg-paper2/30 border border-rule p-3 font-mono text-[13px] text-ink2 focus:outline-none focus:border-ink resize-y"
                  />
                )}
              </SettingGroup>

              <SettingGroup label={t('letter.step2.extra_notes')}>
                <textarea
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  rows={3}
                  placeholder={t('letter.step2.extra_notes_placeholder')}
                  className="w-full bg-transparent border border-rule p-3 text-sm text-ink2 focus:outline-none focus:border-ink resize-y placeholder:text-muted/60"
                />
              </SettingGroup>
            </div>
          </div>

          {/* Errors */}
          {error && (
            <div className="mt-6 border border-danger bg-danger/5 p-3 text-sm text-danger max-w-3xl">
              {error}
            </div>
          )}

          {!hasKey && (
            <div className="mt-6 border border-ochre/40 bg-ochre/5 p-3 text-xs text-ink2 leading-relaxed max-w-md">
              <div className="font-mono text-[10px] tracking-wider uppercase text-ochre mb-1">
                ⚠ Setup
              </div>
              {t('letter.errors.no_key')}
            </div>
          )}

          <button
            onClick={onGenerate}
            disabled={generating}
            className="mt-8 btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {generating ? t('letter.step2.generating') : t('letter.step2.generate')}
            {!generating && <ArrowIcon />}
          </button>
        </section>
      )}

      {/* STEP 3 — LETTER ────────────────────────────────── */}
      {editableLetter && (
        <section className="mb-12 animate-fade-up">
          <StepHeader number="03" title={t('letter.step3.title')} />

          {/* Programme meta */}
          {selectedProgramme && (
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-6">
              {t('letter.step3.for_programme')} · {selectedProgramme.institution?.short_name} · {selectedProgramme.name}
            </div>
          )}

          {/* Subject line */}
          <div className="mb-6">
            <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted mb-2">
              {t('letter.step3.subject')}
            </div>
            <input
              value={editableLetter.subject}
              onChange={(e) => setEditableLetter({ ...editableLetter, subject: e.target.value })}
              className="w-full bg-transparent border-b-2 border-ink py-2 font-display text-2xl text-ink focus:outline-none"
            />
          </div>

          {/* Body — editable */}
          <div className="mb-6">
            <div className="flex items-baseline justify-between mb-2">
              <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted">
                Body
              </div>
              <div className="font-display-italic text-xs text-muted">
                {t('letter.step3.edit_inline')}
              </div>
            </div>
            <textarea
              value={editableLetter.body}
              onChange={(e) => setEditableLetter({ ...editableLetter, body: e.target.value })}
              rows={24}
              dir={letterLang === 'de' || letterLang === 'en' ? 'ltr' : undefined}
              className="w-full bg-paper border-2 border-ink p-6 lg:p-8 font-mono text-[13.5px] leading-[1.7] text-ink2 focus:outline-none resize-y whitespace-pre-wrap"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 items-center">
            <button onClick={onCopy} className="btn-primary">
              {copied ? t('letter.step3.copied') : t('letter.step3.copy')}
            </button>
            <button onClick={onGenerate} disabled={generating} className="btn-ghost disabled:opacity-40">
              ↻ {t('letter.step3.regenerate')}
            </button>
            <button onClick={onSaveRevision} className="btn-link text-sm">
              ✦ {t('letter.step3.save_revision')}
            </button>
          </div>
        </section>
      )}

      {/* SAVED REVISIONS ─────────────────────────────────── */}
      {revisions.length > 0 && (
        <section className="mb-20 mt-16 pt-12 border-t border-rule">
          <div className="section-marker">
            <span className="font-mono text-xs tracking-wider text-muted">·</span>
            <h2 className="font-display text-display-md text-ink">
              {t('letter.step3.saved_revisions')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {revisions.map((rev) => (
              <RevisionCard
                key={rev.id}
                revision={rev}
                onLoad={() => onLoadRevision(rev)}
                onRemove={() => onRemoveRevision(rev.id)}
              />
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

function SettingGroup({ label, children }) {
  return (
    <div className="mb-6">
      <div className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-muted mb-3">
        {label}
      </div>
      {children}
    </div>
  );
}

function ProgrammePicker({ trackerProgrammes, allProgrammes, selectedId, onSelect }) {
  const { t } = useI18n();
  const [mode, setMode] = useState('tracker');  // 'tracker' | 'all'
  const [query, setQuery] = useState('');

  const list = mode === 'tracker' ? trackerProgrammes : allProgrammes;
  const filtered = useMemo(() => {
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter((p) => {
      const hay = [p.name, p.short_name, p.institution?.name, p.institution?.short_name, p.institution?.city]
        .filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [list, query]);

  const showAllOnly = trackerProgrammes.length === 0;

  return (
    <div>
      {!showAllOnly && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('tracker')}
            className={mode === 'tracker' ? 'tag tag-active' : 'tag hover:border-ink'}
          >
            {t('letter.step1.from_tracker')} · {trackerProgrammes.length}
          </button>
          <button
            onClick={() => setMode('all')}
            className={mode === 'all' ? 'tag tag-active' : 'tag hover:border-ink'}
          >
            {t('letter.step1.all_programmes')} · {allProgrammes.length}
          </button>
        </div>
      )}

      {showAllOnly && (
        <p className="font-display-italic text-sm text-muted mb-4 max-w-2xl">
          {t('letter.step1.no_tracker')}
        </p>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('letter.step1.pick_programme')}
        className="input-editorial text-base mb-4"
      />

      {/* List */}
      <div className="border border-rule max-h-[300px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center font-display-italic text-muted text-sm">
            —
          </div>
        ) : (
          <ul>
            {filtered.map((p) => {
              const isSelected = selectedId === p.id;
              return (
                <li key={p.id} className="border-b border-rule last:border-b-0">
                  <button
                    onClick={() => onSelect(p.id)}
                    className={[
                      'w-full text-start px-4 py-3 transition-colors',
                      isSelected ? 'bg-ink text-paper' : 'hover:bg-paper2/50',
                    ].join(' ')}
                  >
                    <div className={`font-mono text-[10.5px] tracking-[0.15em] uppercase ${isSelected ? 'text-paper/70' : 'text-muted'} mb-0.5`}>
                      {p.institution?.short_name} · {p.institution?.city}
                    </div>
                    <div className="font-display text-[15.5px] leading-tight">
                      {p.name}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function RevisionCard({ revision, onLoad, onRemove }) {
  const { t } = useI18n();
  return (
    <article className="border border-rule p-4 bg-paper hover:border-ink transition-colors">
      <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted mb-1">
        {revision.institution} · {revision.tone} · {revision.language?.toUpperCase()}
      </div>
      <h3 className="font-display text-base text-ink leading-tight mb-3 line-clamp-2">
        {revision.programmeName}
      </h3>
      <p className="font-display-italic text-[12.5px] text-muted leading-snug mb-3 line-clamp-3">
        {revision.subject}
      </p>
      <div className="flex items-center justify-between pt-3 border-t border-rule">
        <span className="font-mono text-[10px] text-muted">
          {formatDate(revision.createdAt)}
        </span>
        <div className="flex gap-2">
          <button onClick={onLoad} className="text-xs text-navy hover:text-sienna underline underline-offset-2">
            {t('letter.step3.load_revision')}
          </button>
          <button onClick={onRemove} className="text-xs text-muted hover:text-danger">
            ✕
          </button>
        </div>
      </div>
    </article>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function ArrowIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" className="ms-2">
      <path d="M1 5.5h9M6 1.5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  );
}
