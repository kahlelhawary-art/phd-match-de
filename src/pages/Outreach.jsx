import { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { programmesWithInstitutions } from '../data/seed.js';
import { supabase, hasSupabase } from '../lib/supabase.js';
import { useTracker } from '../lib/tracker.js';
import { useProfile } from '../lib/profile.js';
import { composeOutreach } from '../lib/outreach.js';

const CV_RESULTS_KEY = 'phd-match-cv-results';
const CV_DRAFT_KEY = 'phd-match-cv-draft';
const LOG_KEY = 'phd-match-outreach-log';

const STRATEGIES = ['inquiry', 'paper', 'methods'];

export default function Outreach() {
  const { t, lang } = useI18n();
  const { apps } = useTracker();

  // ─── Programmes ────────────────────────────────
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

  // ─── Form ──────────────────────────────────────
  // Read any prefill from Labs page (sessionStorage)
  const prefill = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('phd-match-outreach-prefill');
      if (!raw) return null;
      sessionStorage.removeItem('phd-match-outreach-prefill');
      return JSON.parse(raw);
    } catch { return null; }
  }, []);

  const [selectedProgrammeId, setSelectedProgrammeId] = useState(prefill?.programmeId ?? null);
  const [piName, setPiName] = useState(prefill?.piName ?? '');
  const [piEmail, setPiEmail] = useState('');
  const [labFocus, setLabFocus] = useState(prefill?.labFocus ?? '');
  const [strategy, setStrategy] = useState('inquiry');
  const [paperRef, setPaperRef] = useState('');
  const [letterLang, setLetterLang] = useState(lang === 'ar' ? 'de' : lang);
  const [variantCount, setVariantCount] = useState(3);
  const [profileSource, setProfileSource] = useState('match');
  const { profile } = useProfile();
  const [pastedCv, setPastedCv] = useState(
    () => localStorage.getItem(CV_DRAFT_KEY) || profile?.cv_text || ''
  );

  const matchProfile = useMemo(() => {
    try {
      const r = JSON.parse(localStorage.getItem(CV_RESULTS_KEY));
      return r?.profile ?? null;
    } catch { return null; }
  }, []);

  useEffect(() => {
    if (!matchProfile && profileSource === 'match') setProfileSource('paste');
  }, [matchProfile]);  // eslint-disable-line

  // ─── Result ────────────────────────────────────
  const [generating, setGenerating] = useState(false);
  const [variants, setVariants] = useState(null);
  const [editedVariants, setEditedVariants] = useState(null);
  const [error, setError] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  useEffect(() => {
    if (copiedIdx === null) return;
    const tm = setTimeout(() => setCopiedIdx(null), 1800);
    return () => clearTimeout(tm);
  }, [copiedIdx]);

  // ─── Outreach log ──────────────────────────────
  const [log, setLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LOG_KEY)) ?? []; }
    catch { return []; }
  });
  useEffect(() => { localStorage.setItem(LOG_KEY, JSON.stringify(log)); }, [log]);

  // ─── Actions ───────────────────────────────────
  const hasKey = Boolean(import.meta.env.VITE_ANTHROPIC_KEY);
  const selectedProgramme = selectedProgrammeId ? programmeMap[selectedProgrammeId] : null;

  const trackerProgrammes = useMemo(
    () => apps.map((a) => programmeMap[a.programmeId]).filter(Boolean),
    [apps, programmeMap]
  );

  const onGenerate = async () => {
    setError(null);

    if (!hasKey) { setError(t('outreach.errors.no_key')); return; }
    if (!selectedProgramme) { setError(t('outreach.errors.no_programme')); return; }

    const usingProfile = profileSource === 'match' && matchProfile;
    if (!usingProfile && pastedCv.trim().length < 100) {
      setError(t('outreach.errors.no_profile'));
      return;
    }
    if (strategy === 'paper' && !paperRef.trim()) {
      setError(t('outreach.errors.no_paper'));
      return;
    }

    setGenerating(true);
    try {
      const result = await composeOutreach({
        programme: selectedProgramme,
        profile: usingProfile ? matchProfile : null,
        cvText: usingProfile ? null : pastedCv,
        piName,
        labFocus,
        strategy,
        paperReference: paperRef,
        language: letterLang,
        variantCount,
      });
      const arr = result.variants ?? [];
      setVariants(arr);
      setEditedVariants(arr.map((v) => ({ ...v })));
    } catch (err) {
      console.error(err);
      setError(`${t('outreach.errors.api_error')} ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const onCopy = async (idx) => {
    const v = editedVariants[idx];
    const text = `${v.subject}\n\n${v.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
    } catch {
      setError('Clipboard failed.');
    }
  };

  const onOpenMail = (idx) => {
    const v = editedVariants[idx];
    const to = piEmail.trim();
    const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(v.subject)}&body=${encodeURIComponent(v.body)}`;
    window.location.href = url;
  };

  const onSaveToLog = (idx) => {
    if (!selectedProgramme) return;
    const v = editedVariants[idx];
    const entry = {
      id: 'out_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3),
      programmeId: selectedProgramme.id,
      programmeName: selectedProgramme.name,
      institution: selectedProgramme.institution?.short_name,
      piName: piName || null,
      piEmail: piEmail || null,
      strategy,
      language: letterLang,
      subject: v.subject,
      body: v.body,
      replied: false,
      createdAt: new Date().toISOString(),
    };
    setLog((prev) => [entry, ...prev].slice(0, 50));
  };

  const onLoadLogEntry = (entry) => {
    setSelectedProgrammeId(entry.programmeId);
    setPiName(entry.piName ?? '');
    setPiEmail(entry.piEmail ?? '');
    setStrategy(entry.strategy);
    setLetterLang(entry.language);
    const variant = { subject: entry.subject, body: entry.body };
    setVariants([variant]);
    setEditedVariants([variant]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onRemoveLogEntry = (id) => setLog((p) => p.filter((e) => e.id !== id));
  const onToggleReplied = (id) =>
    setLog((p) => p.map((e) => e.id === id ? { ...e, replied: !e.replied } : e));

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
      {/* HERO ───────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 lg:mb-16 animate-fade-up">
        <div className="lg:col-span-8">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sienna mb-4">
            ❦ {t('outreach.hero_eyebrow')}
          </div>
          <h1 className="font-display text-display-lg text-ink text-balance leading-[0.95]">
            {t('outreach.hero_title')}
          </h1>
        </div>

        <div className="lg:col-span-4 lg:pt-6 lg:border-l lg:border-rule lg:pl-8">
          <p className="text-base leading-relaxed text-ink2 dropcap text-pretty">
            {t('outreach.hero_lead')}
          </p>
        </div>
      </section>

      {/* TIPS SIDEBAR ──────────────────────────────────── */}
      <aside className="border-l-4 border-sienna bg-paper2/40 p-5 lg:p-6 mb-12 max-w-4xl">
        <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-sienna mb-3">
          ※ {t('outreach.tips.title')}
        </div>
        <ul className="space-y-2 max-w-3xl">
          {(t('outreach.tips.items') ?? []).map((tip, i) => (
            <li key={i} className="text-sm text-ink2 leading-relaxed ps-4 relative before:content-['→'] before:absolute before:start-0 before:text-sienna text-pretty">
              {tip}
            </li>
          ))}
        </ul>
      </aside>

      {/* STEP 1 — RECIPIENT ──────────────────────────────── */}
      <section className="mb-12">
        <StepHeader number="01" title={t('outreach.step1.title')} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <SettingGroup label={t('outreach.step1.programme')}>
              <ProgrammePicker
                trackerProgrammes={trackerProgrammes}
                allProgrammes={programmes}
                selectedId={selectedProgrammeId}
                onSelect={setSelectedProgrammeId}
              />
            </SettingGroup>
          </div>

          <div className="lg:col-span-5">
            <SettingGroup label={t('outreach.step1.pi_name')}>
              <input
                type="text"
                value={piName}
                onChange={(e) => setPiName(e.target.value)}
                placeholder={t('outreach.step1.pi_name_placeholder')}
                className="input-editorial text-base"
              />
            </SettingGroup>

            <SettingGroup label={t('outreach.step1.pi_email')}>
              <input
                type="email"
                value={piEmail}
                onChange={(e) => setPiEmail(e.target.value)}
                placeholder="prof@uni-bonn.de"
                className="input-editorial text-base"
              />
            </SettingGroup>

            <SettingGroup label={t('outreach.step1.lab_focus')}>
              <textarea
                value={labFocus}
                onChange={(e) => setLabFocus(e.target.value)}
                rows={2}
                placeholder={t('outreach.step1.lab_focus_placeholder')}
                className="w-full bg-transparent border border-rule p-3 text-sm focus:outline-none focus:border-ink resize-y"
              />
            </SettingGroup>
          </div>
        </div>
      </section>

      {/* STEP 2 — STRATEGY ──────────────────────────────── */}
      {selectedProgramme && (
        <section className="mb-12 animate-fade-up">
          <StepHeader number="02" title={t('outreach.step2.title')} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <SettingGroup label={t('outreach.step2.strategy')}>
                <div className="flex flex-col gap-2">
                  {STRATEGIES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStrategy(s)}
                      className={[
                        'text-start px-4 py-3 border transition-colors',
                        strategy === s
                          ? 'border-ink bg-ink text-paper'
                          : 'border-rule hover:border-ink text-ink2',
                      ].join(' ')}
                    >
                      <span className={`font-display text-base block leading-tight mb-1 ${strategy === s ? 'text-paper' : 'text-ink'}`}>
                        {t(`outreach.step2.strategies.${s}.name`)}
                      </span>
                      <span className={`text-xs leading-snug ${strategy === s ? 'text-paper/70' : 'text-muted'}`}>
                        {t(`outreach.step2.strategies.${s}.desc`)}
                      </span>
                    </button>
                  ))}
                </div>
              </SettingGroup>

              {strategy === 'paper' && (
                <SettingGroup label={t('outreach.step2.paper_reference')}>
                  <textarea
                    value={paperRef}
                    onChange={(e) => setPaperRef(e.target.value)}
                    rows={3}
                    placeholder={t('outreach.step2.paper_reference_placeholder')}
                    className="w-full bg-paper2/30 border border-rule p-3 text-sm focus:outline-none focus:border-ink resize-y"
                  />
                </SettingGroup>
              )}
            </div>

            <div>
              <SettingGroup label={t('outreach.step2.language')}>
                <div className="flex gap-2">
                  {['de', 'en'].map((lc) => (
                    <button
                      key={lc}
                      onClick={() => setLetterLang(lc)}
                      className={letterLang === lc ? 'tag tag-active' : 'tag hover:border-ink'}
                    >
                      {t(`outreach.step2.languages.${lc}`)}
                    </button>
                  ))}
                </div>
              </SettingGroup>

              <SettingGroup label={t('outreach.step2.variants')}>
                <div className="flex gap-2 items-baseline">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setVariantCount(n)}
                      className={variantCount === n ? 'tag tag-active' : 'tag hover:border-ink'}
                    >
                      {n}
                    </button>
                  ))}
                  <span className="font-display-italic text-xs text-muted ms-2">
                    {t('outreach.step2.variants_hint')}
                  </span>
                </div>
              </SettingGroup>

              <SettingGroup label={t('outreach.step2.profile_source')}>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setProfileSource('match')}
                    disabled={!matchProfile}
                    className={[
                      profileSource === 'match' ? 'tag tag-active' : 'tag hover:border-ink',
                      !matchProfile ? 'opacity-40 cursor-not-allowed' : '',
                    ].join(' ')}
                  >
                    ✦ {t('outreach.step2.profile_from_match')}
                  </button>
                  <button
                    onClick={() => setProfileSource('paste')}
                    className={profileSource === 'paste' ? 'tag tag-active' : 'tag hover:border-ink'}
                  >
                    ✎ {t('outreach.step2.profile_paste')}
                  </button>
                </div>
                {profileSource === 'match' && !matchProfile && (
                  <p className="text-xs text-ochre leading-relaxed">
                    {t('outreach.step2.no_profile_yet')}
                  </p>
                )}
                {profileSource === 'paste' && (
                  <textarea
                    value={pastedCv}
                    onChange={(e) => { setPastedCv(e.target.value); localStorage.setItem(CV_DRAFT_KEY, e.target.value); }}
                    rows={5}
                    placeholder={t('outreach.step2.paste_label')}
                    className="w-full bg-paper2/30 border border-rule p-3 font-mono text-[13px] text-ink2 focus:outline-none focus:border-ink resize-y"
                  />
                )}
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
              <div className="font-mono text-[10px] tracking-wider uppercase text-ochre mb-1">⚠ Setup</div>
              {t('outreach.errors.no_key')}
            </div>
          )}

          <button
            onClick={onGenerate}
            disabled={generating}
            className="mt-8 btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {generating ? t('outreach.step2.generating') : t('outreach.step2.generate')}
            {!generating && <ArrowIcon />}
          </button>
        </section>
      )}

      {/* STEP 3 — VARIANTS ──────────────────────────────── */}
      {editedVariants && editedVariants.length > 0 && (
        <section className="mb-12 animate-fade-up">
          <StepHeader number="03" title={t('outreach.step3.title')} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {editedVariants.map((v, idx) => (
              <VariantCard
                key={idx}
                variant={v}
                index={idx}
                isCopied={copiedIdx === idx}
                onChange={(updated) => {
                  const next = [...editedVariants];
                  next[idx] = updated;
                  setEditedVariants(next);
                }}
                onCopy={() => onCopy(idx)}
                onSave={() => onSaveToLog(idx)}
                onOpenMail={piEmail ? () => onOpenMail(idx) : null}
              />
            ))}
          </div>

          <button onClick={onGenerate} disabled={generating} className="mt-8 btn-ghost">
            ↻ {t('outreach.step3.regenerate')}
          </button>
        </section>
      )}

      {/* OUTREACH LOG ────────────────────────────────────── */}
      <section className="mb-20 mt-16 pt-12 border-t border-rule">
        <div className="section-marker">
          <span className="font-mono text-xs tracking-wider text-muted">·</span>
          <h2 className="font-display text-display-md text-ink">
            {t('outreach.step3.log_title')}
          </h2>
        </div>

        {log.length === 0 ? (
          <div className="border border-dashed border-rule p-8 text-center font-display-italic text-muted">
            {t('outreach.step3.log_empty')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {log.map((entry) => (
              <LogCard
                key={entry.id}
                entry={entry}
                onLoad={() => onLoadLogEntry(entry)}
                onRemove={() => onRemoveLogEntry(entry.id)}
                onToggleReplied={() => onToggleReplied(entry.id)}
              />
            ))}
          </div>
        )}
      </section>
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

function VariantCard({ variant, index, isCopied, onChange, onCopy, onSave, onOpenMail }) {
  const { t } = useI18n();
  const [saved, setSaved] = useState(false);
  const tones = ['border-navy', 'border-sienna', 'border-sage'];

  useEffect(() => {
    if (!saved) return;
    const tm = setTimeout(() => setSaved(false), 1800);
    return () => clearTimeout(tm);
  }, [saved]);

  return (
    <article className={`border-t-2 ${tones[index] ?? 'border-ink'} bg-paper border-x border-b border-rule`}>
      <header className="px-5 py-3 border-b border-rule flex items-baseline justify-between">
        <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-muted">
          {t('outreach.step3.variant')} · {String.fromCharCode(65 + index)}
        </span>
      </header>

      {/* Subject */}
      <div className="px-5 py-3 border-b border-rule">
        <div className="font-mono text-[10px] tracking-wider uppercase text-muted mb-1.5">
          {t('outreach.step3.subject')}
        </div>
        <input
          value={variant.subject}
          onChange={(e) => onChange({ ...variant, subject: e.target.value })}
          className="w-full bg-transparent border-b border-rule pb-1 font-display text-lg text-ink focus:outline-none focus:border-ink"
        />
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <textarea
          value={variant.body}
          onChange={(e) => onChange({ ...variant, body: e.target.value })}
          rows={14}
          className="w-full bg-transparent font-mono text-[13px] leading-[1.7] text-ink2 focus:outline-none resize-y whitespace-pre-wrap"
        />
      </div>

      {/* Actions */}
      <footer className="px-5 py-3 border-t border-rule flex flex-wrap items-center gap-2">
        <button onClick={onCopy} className="btn-primary text-sm">
          {isCopied ? t('outreach.step3.copied') : t('outreach.step3.copy')}
        </button>
        <button onClick={() => { onSave(); setSaved(true); }} className="btn-ghost text-sm">
          {saved ? t('outreach.step3.saved') : t('outreach.step3.save')}
        </button>
        {onOpenMail && (
          <button onClick={onOpenMail} className="btn-link text-xs ms-auto">
            ↗ {t('outreach.step3.open_mail')}
          </button>
        )}
      </footer>
    </article>
  );
}

function LogCard({ entry, onLoad, onRemove, onToggleReplied }) {
  const { t } = useI18n();
  const stratTone = {
    inquiry: 'text-navy',
    paper: 'text-sienna',
    methods: 'text-sage',
  }[entry.strategy] ?? 'text-muted';

  return (
    <article className={`border border-rule p-4 bg-paper hover:border-ink transition-colors ${entry.replied ? 'bg-sage/5' : ''}`}>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted truncate">
          {entry.institution}
        </span>
        <span className={`font-mono text-[10px] tracking-wider uppercase ${stratTone}`}>
          {entry.strategy} · {entry.language?.toUpperCase()}
        </span>
      </div>

      <h3 className="font-display text-[15px] text-ink leading-tight mb-1 line-clamp-2">
        {entry.programmeName}
      </h3>

      {entry.piName && (
        <div className="text-xs text-ink2 mb-2">
          {t('outreach.step3.log_to')}: {entry.piName}
        </div>
      )}

      <p className="font-display-italic text-[12.5px] text-muted leading-snug mb-3 line-clamp-3">
        {entry.subject}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-rule">
        <span className="font-mono text-[10px] text-muted">
          {formatDate(entry.createdAt)}
        </span>
        <div className="flex gap-2 items-baseline">
          <button
            onClick={onToggleReplied}
            className={`text-[11px] ${entry.replied ? 'text-sage' : 'text-muted hover:text-sage'}`}
          >
            {entry.replied ? `✓ ${t('outreach.step3.log_marked_replied')}` : t('outreach.step3.log_mark_replied')}
          </button>
          <button onClick={onLoad} className="text-xs text-navy hover:text-sienna underline underline-offset-2">
            {t('outreach.step3.log_load')}
          </button>
          <button onClick={onRemove} className="text-xs text-muted hover:text-danger">✕</button>
        </div>
      </div>
    </article>
  );
}

function ProgrammePicker({ trackerProgrammes, allProgrammes, selectedId, onSelect }) {
  const { t } = useI18n();
  const [mode, setMode] = useState('tracker');
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
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode('tracker')}
            className={mode === 'tracker' ? 'tag tag-active' : 'tag hover:border-ink'}
          >
            {t('outreach.step1.from_tracker')} · {trackerProgrammes.length}
          </button>
          <button
            onClick={() => setMode('all')}
            className={mode === 'all' ? 'tag tag-active' : 'tag hover:border-ink'}
          >
            {t('outreach.step1.all_programmes')} · {allProgrammes.length}
          </button>
        </div>
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('outreach.step1.pick_programme')}
        className="input-editorial text-base mb-3"
      />

      <div className="border border-rule max-h-[260px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-5 text-center font-display-italic text-muted text-sm">—</div>
        ) : (
          <ul>
            {filtered.map((p) => {
              const isSelected = selectedId === p.id;
              return (
                <li key={p.id} className="border-b border-rule last:border-b-0">
                  <button
                    onClick={() => onSelect(p.id)}
                    className={[
                      'w-full text-start px-4 py-2.5 transition-colors',
                      isSelected ? 'bg-ink text-paper' : 'hover:bg-paper2/50',
                    ].join(' ')}
                  >
                    <div className={`font-mono text-[10px] tracking-[0.15em] uppercase ${isSelected ? 'text-paper/70' : 'text-muted'} mb-0.5`}>
                      {p.institution?.short_name} · {p.institution?.city}
                    </div>
                    <div className="font-display text-[14.5px] leading-tight">
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

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

function ArrowIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" className="ms-2">
      <path d="M1 5.5h9M6 1.5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  );
}
