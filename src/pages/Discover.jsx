import { useMemo, useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { programmesWithInstitutions } from '../data/seed.js';
import { supabase, hasSupabase } from '../lib/supabase.js';
import { ensureInTracker, removeFromTrackerByProgramme, useTracker } from '../lib/tracker.js';
import ProgrammeCard from '../components/ProgrammeCard.jsx';
import FilterBar from '../components/FilterBar.jsx';
import OnboardingGuide from '../components/OnboardingGuide.jsx';

export default function Discover() {
  const { t } = useI18n();

  const [programmes, setProgrammes] = useState(programmesWithInstitutions);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedLang, setSelectedLang] = useState(null);
  const [onlyOpen, setOnlyOpen] = useState(false);

  // Saved items now come from the tracker
  const { apps } = useTracker();
  const saved = useMemo(() => apps.map((a) => a.programmeId), [apps]);

  // Try to load live data from Supabase if configured
  useEffect(() => {
    if (!hasSupabase) return;
    let active = true;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('programmes')
        .select('*, institution:institutions(*)');
      if (!active) return;
      if (!error && data?.length) setProgrammes(data);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  // Derived
  const cities = useMemo(() => {
    const s = new Set(programmes.map((p) => p.institution?.city).filter(Boolean));
    return Array.from(s).sort();
  }, [programmes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return programmes.filter((p) => {
      if (onlyOpen && !p.open_for_applications) return false;
      if (selectedLang && p.language !== selectedLang) return false;
      if (selectedCities.length && !selectedCities.includes(p.institution?.city)) return false;
      if (selectedFields.length && !selectedFields.some((f) => p.fields.includes(f))) return false;
      if (q) {
        const hay = [
          p.name, p.short_name, p.institution?.name, p.institution?.short_name, p.institution?.city,
          (p.fields ?? []).join(' '),
        ].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [programmes, search, selectedFields, selectedCities, selectedLang, onlyOpen]);

  const onSave = (p) => {
    if (saved.includes(p.id)) {
      removeFromTrackerByProgramme(p.id);
    } else {
      ensureInTracker({ programmeId: p.id, source: 'discover' });
    }
  };

  const onReset = () => {
    setSearch(''); setSelectedFields([]); setSelectedCities([]);
    setSelectedLang(null); setOnlyOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
      {/* HERO ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 lg:mb-24 animate-fade-up">
        <div className="lg:col-span-8">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sienna mb-4">
            ❦ {t('home.hero_eyebrow')}
          </div>
          <h1 className="font-display text-display-xl text-ink text-balance leading-[0.95]">
            {t('home.hero_title')}
          </h1>
        </div>

        <div className="lg:col-span-4 lg:pt-8 lg:border-l lg:border-rule lg:pl-8 relative">
          <p className="text-base leading-relaxed text-ink2 dropcap text-pretty">
            {t('home.hero_lead')}
          </p>
        </div>
      </section>

      {/* ONBOARDING GUIDE ─────────────────────────────────── */}
      <OnboardingGuide />

      {/* SECTION MARKER ───────────────────────────────────── */}
      <div className="section-marker">
        <span className="font-mono text-xs tracking-wider text-muted">I.</span>
        <h2 className="font-display text-display-md text-ink">
          {t('discover.title')}
        </h2>
        <span className="font-display-italic text-muted text-base hidden md:inline">
          — {t('discover.subtitle')}
        </span>
      </div>

      {/* GRID ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        <div className="lg:col-span-3">
          <FilterBar
            cities={cities}
            selectedFields={selectedFields} setSelectedFields={setSelectedFields}
            selectedCities={selectedCities} setSelectedCities={setSelectedCities}
            selectedLang={selectedLang} setSelectedLang={setSelectedLang}
            onlyOpen={onlyOpen} setOnlyOpen={setOnlyOpen}
            search={search} setSearch={setSearch}
            total={programmes.length} filtered={filtered.length}
            onReset={onReset}
          />
        </div>

        <div className="lg:col-span-9">
          {loading ? (
            <div className="font-display-italic text-muted text-lg">
              {t('common.loading')}
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-dashed border-rule p-12 text-center">
              <div className="font-display-italic text-2xl text-muted mb-2">
                {t('discover.empty')}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filtered.map((p, i) => (
                <div
                  key={p.id}
                  className="animate-fade-up opacity-0"
                  style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                >
                  <ProgrammeCard
                    programme={p}
                    onSave={onSave}
                    isSaved={saved.includes(p.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

