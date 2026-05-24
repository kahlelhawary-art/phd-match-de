import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../lib/i18n.jsx';
import { pisWithContext } from '../data/pis.js';
import { ensureInTracker, removeFromTrackerByProgramme, useTracker } from '../lib/tracker.js';
import LabCard from '../components/LabCard.jsx';

const FIELDS = ['cancer', 'immunology', 'neuroscience', 'molecular_biology', 'genetics', 'structural_biology'];

export default function Labs() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const pis = pisWithContext;

  // Mark Labs as seen for the onboarding guide
  useEffect(() => {
    try { localStorage.setItem('phd-match-labs-seen', '1'); } catch { /* ignore */ }
  }, []);

  // ─── Filters ────────────────────────────────────
  const [search, setSearch] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedInstitutions, setSelectedInstitutions] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  // ─── Saved from tracker ─────────────────────────
  const { apps } = useTracker();
  const savedPiIds = useMemo(
    () => apps.filter((a) => a.piId).map((a) => a.piId),
    [apps]
  );

  // ─── Derived option lists ───────────────────────
  const institutions = useMemo(() => {
    const map = new Map();
    pis.forEach((p) => {
      if (p.institution) map.set(p.institution.id, p.institution);
    });
    return Array.from(map.values()).sort((a, b) =>
      (a.short_name ?? '').localeCompare(b.short_name ?? '')
    );
  }, [pis]);

  const cities = useMemo(() => {
    const s = new Set(pis.map((p) => p.institution?.city).filter(Boolean));
    return Array.from(s).sort();
  }, [pis]);

  // ─── Filtering ──────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pis.filter((p) => {
      if (acceptingOnly && !p.accepting_students) return false;
      if (selectedInstitutions.length && !selectedInstitutions.includes(p.institution_id)) return false;
      if (selectedCities.length && !selectedCities.includes(p.institution?.city)) return false;
      if (selectedFields.length && !selectedFields.some((f) => p.fields.includes(f))) return false;
      if (q) {
        const hay = [
          p.name, p.title,
          p.institution?.name, p.institution?.short_name, p.institution?.city,
          p.research_focus, p.research_focus_de, p.research_focus_ar,
          (p.fields ?? []).join(' '),
        ].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [pis, search, selectedFields, selectedInstitutions, selectedCities, acceptingOnly]);

  // ─── Actions ────────────────────────────────────
  const onSave = (pi) => {
    if (savedPiIds.includes(pi.id)) {
      removeFromTrackerByProgramme(pi.programme_id, pi.id);
    } else {
      ensureInTracker({
        programmeId: pi.programme_id,
        piId: pi.id,
        source: 'labs',
      });
    }
  };

  const onDraftOutreach = (pi) => {
    // Store PI context for Outreach to pick up
    try {
      sessionStorage.setItem('phd-match-outreach-prefill', JSON.stringify({
        programmeId: pi.programme_id,
        piName: pi.name,
        labFocus: pi.research_focus,
      }));
    } catch { /* ignore */ }
    navigate('/outreach');
  };

  const onReadPaper = (pi) => {
    // Store PI context for the Paper Digest tool
    try {
      sessionStorage.setItem('phd-match-digest-prefill', JSON.stringify({
        piName: pi.name,
        labFocus: pi.research_focus,
      }));
    } catch { /* ignore */ }
    navigate('/digest');
  };

  const onReset = () => {
    setSearch(''); setSelectedFields([]); setSelectedInstitutions([]);
    setSelectedCities([]); setAcceptingOnly(false);
  };

  const toggle = (arr, setter, val) =>
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  return (
    <>
      {/* Video Hero */}
      <section className="relative w-full h-[50vh] max-h-[450px] overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/ghibli-house-animated.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-paper" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-white tracking-tight leading-tight drop-shadow-lg">
            {t('labs.hero_title')}
          </h1>
          <p className="mt-3 text-base md:text-lg text-white/85 max-w-xl leading-relaxed drop-shadow">
            {t('labs.hero_subtitle')}
          </p>
        </div>
      </section>

    <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
      {/* HERO ────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 lg:mb-20 animate-fade-up">
        <div className="lg:col-span-8">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sienna mb-4">
            ❦ {t('labs.hero_eyebrow')}
          </div>
          <h1 className="font-display text-display-lg text-ink text-balance leading-[0.95]">
            {t('labs.hero_title')}
          </h1>
        </div>

        <div className="lg:col-span-4 lg:pt-6 lg:border-l lg:border-rule lg:pl-8">
          <p className="text-base leading-relaxed text-ink2 dropcap text-pretty">
            {t('labs.hero_lead')}
          </p>
        </div>
      </section>

      {/* SECTION MARKER ─────────────────────────────────── */}
      <div className="section-marker">
        <span className="font-mono text-xs tracking-wider text-muted">·</span>
        <h2 className="font-display text-display-md text-ink">{t('labs.title')}</h2>
        <span className="font-display-italic text-muted text-base hidden md:inline">
          — {t('labs.subtitle')}
        </span>
      </div>

      {/* GRID: filters + cards ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-3 lg:sticky lg:top-[140px] lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto pr-2">
          {/* Search */}
          <div className="mb-8">
            <label className="font-mono text-[10px] tracking-wider uppercase text-muted block mb-2">
              ⌕ Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('labs.filters.search_placeholder')}
              className="input-editorial text-base"
            />
          </div>

          {/* Counts */}
          <div className="font-display text-3xl mb-1 text-ink leading-none">
            {filtered.length}
            <span className="text-rule font-display-italic mx-2 text-2xl">/</span>
            <span className="text-muted text-2xl">{pis.length}</span>
          </div>
          <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted mb-8">
            {t('labs.filters.results', { count: filtered.length })}
          </div>

          {/* Institutions */}
          <FilterGroup label={t('labs.filters.institution')}>
            <div className="flex flex-col gap-1.5">
              {institutions.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => toggle(selectedInstitutions, setSelectedInstitutions, inst.id)}
                  className={selectedInstitutions.includes(inst.id)
                    ? 'tag tag-active text-start justify-start'
                    : 'tag hover:border-ink text-start justify-start'}
                >
                  {inst.short_name}
                </button>
              ))}
            </div>
          </FilterGroup>

          {/* Field */}
          <FilterGroup label={t('labs.filters.field')}>
            <div className="flex flex-wrap gap-1.5">
              {FIELDS.map((f) => (
                <button
                  key={f}
                  onClick={() => toggle(selectedFields, setSelectedFields, f)}
                  className={selectedFields.includes(f) ? 'tag tag-active' : 'tag hover:border-ink'}
                >
                  {t(`discover.fields.${f}`)}
                </button>
              ))}
            </div>
          </FilterGroup>

          {/* City */}
          <FilterGroup label={t('labs.filters.city')}>
            <div className="flex flex-wrap gap-1.5">
              {cities.map((c) => (
                <button
                  key={c}
                  onClick={() => toggle(selectedCities, setSelectedCities, c)}
                  className={selectedCities.includes(c) ? 'tag tag-active' : 'tag hover:border-ink'}
                >
                  {c}
                </button>
              ))}
            </div>
          </FilterGroup>

          {/* Accepting only */}
          <FilterGroup label="">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={acceptingOnly}
                onChange={(e) => setAcceptingOnly(e.target.checked)}
                className="appearance-none w-4 h-4 border border-ink checked:bg-ink checked:border-ink relative cursor-pointer
                           checked:after:content-['✓'] checked:after:absolute checked:after:inset-0 checked:after:text-paper
                           checked:after:text-[11px] checked:after:flex checked:after:items-center checked:after:justify-center"
              />
              <span className="text-sm text-ink2 group-hover:text-ink">
                {t('labs.filters.accepting_only')}
              </span>
            </label>
          </FilterGroup>

          <button
            onClick={onReset}
            className="font-mono text-[11px] tracking-wider uppercase text-muted hover:text-sienna underline underline-offset-4"
          >
            ↻ Reset
          </button>
        </aside>

        {/* Cards grid */}
        <div className="lg:col-span-9">
          {filtered.length === 0 ? (
            <div className="border border-dashed border-rule p-12 text-center">
              <div className="font-display-italic text-2xl text-muted">
                {t('labs.empty')}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filtered.map((pi, i) => (
                <div
                  key={pi.id}
                  className="animate-fade-up opacity-0"
                  style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                >
                  <LabCard
                    pi={pi}
                    onSave={onSave}
                    isSaved={savedPiIds.includes(pi.id)}
                    onDraftOutreach={onDraftOutreach}
                    onReadPaper={onReadPaper}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="mb-6 pb-6 border-b border-rule last:border-b-0">
      {label && (
        <div className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-muted mb-3">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

