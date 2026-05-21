import { useI18n } from '../lib/i18n.jsx';

const FIELDS = ['cancer', 'immunology', 'neuroscience', 'molecular_biology', 'genetics', 'structural_biology'];
const LANGS = ['english', 'german', 'bilingual'];

export default function FilterBar({
  cities,
  selectedFields, setSelectedFields,
  selectedCities, setSelectedCities,
  selectedLang, setSelectedLang,
  onlyOpen, setOnlyOpen,
  search, setSearch,
  total, filtered,
  onReset,
}) {
  const { t } = useI18n();

  const toggle = (arr, setter, val) =>
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  return (
    <aside className="lg:sticky lg:top-[140px] lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto pr-2">
      {/* Search */}
      <div className="mb-8">
        <label className="font-mono text-[10px] tracking-wider uppercase text-muted block mb-2">
          ⌕ {t('discover.filters.search_placeholder').split('…')[0]}
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('discover.filters.search_placeholder')}
          className="input-editorial text-base"
        />
      </div>

      {/* Counts */}
      <div className="font-display text-3xl mb-1 text-ink leading-none">
        {filtered}
        <span className="text-rule font-display-italic mx-2 text-2xl">/</span>
        <span className="text-muted text-2xl">{total}</span>
      </div>
      <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted mb-8">
        {t('discover.filters.results', { count: filtered })}
      </div>

      {/* Field filter */}
      <FilterGroup label={t('discover.filters.field')}>
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

      {/* City filter */}
      <FilterGroup label={t('discover.filters.city')}>
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

      {/* Language filter */}
      <FilterGroup label={t('discover.filters.language')}>
        <div className="flex flex-wrap gap-1.5">
          {LANGS.map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLang(selectedLang === l ? null : l)}
              className={selectedLang === l ? 'tag tag-active' : 'tag hover:border-ink'}
            >
              {t(`discover.language.${l}`)}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Open only toggle */}
      <FilterGroup label="">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
            className="appearance-none w-4 h-4 border border-ink checked:bg-ink checked:border-ink relative cursor-pointer
                       checked:after:content-['✓'] checked:after:absolute checked:after:inset-0 checked:after:text-paper
                       checked:after:text-[11px] checked:after:flex checked:after:items-center checked:after:justify-center"
          />
          <span className="text-sm text-ink2 group-hover:text-ink">
            {t('discover.filters.open')}
          </span>
        </label>
      </FilterGroup>

      <button
        onClick={onReset}
        className="font-mono text-[11px] tracking-wider uppercase text-muted hover:text-sienna underline underline-offset-4"
      >
        ↻ {t('discover.filters.reset')}
      </button>
    </aside>
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
