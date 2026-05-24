import { useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { boards } from '../data/jobBoards.js';

const FIELDS = ['cancer', 'immunology', 'neuroscience', 'molecular_biology', 'genetics', 'structural_biology'];

const ACCENT = {
  navy: { bar: 'bg-navy', text: 'text-navy', border: 'hover:border-navy' },
  sienna: { bar: 'bg-sienna', text: 'text-sienna', border: 'hover:border-sienna' },
  sage: { bar: 'bg-sage', text: 'text-sage', border: 'hover:border-sage' },
  ochre: { bar: 'bg-ochre', text: 'text-ochre', border: 'hover:border-ochre' },
};

export default function Openings() {
  const { t, lang } = useI18n();
  const [field, setField] = useState('immunology');

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
      {/* HERO ─────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 lg:mb-16 animate-fade-up">
        <div className="lg:col-span-8">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sienna mb-4">
            ❦ {t('openings.hero_eyebrow')}
          </div>
          <h1 className="font-display text-display-lg text-ink text-balance leading-[0.95]">
            {t('openings.hero_title')}
          </h1>
        </div>
        <div className="lg:col-span-4 lg:pt-6 lg:border-l lg:border-rule lg:pl-8">
          <p className="text-base leading-relaxed text-ink2 dropcap text-pretty">
            {t('openings.hero_lead')}
          </p>
        </div>
      </section>

      {/* FIELD SELECTOR ───────────────────────────────── */}
      <div className="mb-10 pb-8 border-b border-rule">
        <div className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-muted mb-3">
          ◈ {t('openings.field_label')}
        </div>
        <div className="flex flex-wrap gap-2">
          {FIELDS.map((f) => (
            <button
              key={f}
              onClick={() => setField(f)}
              className={[
                'px-3.5 py-1.5 text-sm border rounded-sm transition-colors',
                field === f
                  ? 'bg-ink text-paper border-ink'
                  : 'border-rule text-ink2 hover:border-ink',
              ].join(' ')}
            >
              {t(`openings.fields.${f}`)}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION MARKER ───────────────────────────────── */}
      <div className="section-marker">
        <span className="font-mono text-xs tracking-wider text-muted">·</span>
        <h2 className="font-display text-display-md text-ink">{t('openings.section_title')}</h2>
      </div>

      {/* BOARD CARDS ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
        {boards.map((board, i) => {
          const a = ACCENT[board.accent] ?? ACCENT.navy;
          const fieldLabel = t(`openings.fields.${field}`);
          return (
            <article
              key={board.id}
              className={`border border-rule bg-paper transition-colors ${a.border} animate-fade-up opacity-0 flex flex-col`}
              style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
            >
              <div className={`h-1 ${a.bar}`} />
              <div className="p-5 lg:p-6 flex flex-col flex-1">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <h3 className="font-display text-xl text-ink leading-tight">{board.name}</h3>
                  <span className="font-mono text-[9.5px] tracking-wider uppercase text-muted shrink-0">
                    ↗ extern
                  </span>
                </div>
                <p className="text-[13.5px] text-muted leading-relaxed text-pretty mb-5 flex-1">
                  {board.tagline[lang] ?? board.tagline.en}
                </p>

                <div className="flex flex-wrap gap-2.5">
                  <a
                    href={board.buildUrl(field)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm"
                  >
                    {t('openings.search_field', { field: fieldLabel })}
                    <ArrowIcon />
                  </a>
                  <a
                    href={board.browseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn-link text-sm self-center ${a.text}`}
                  >
                    {t('openings.browse_all')}
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* TIPS ─────────────────────────────────────────── */}
      <aside className="border-l-4 border-sienna bg-paper2/40 p-5 lg:p-7 mb-10 max-w-4xl">
        <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-sienna mb-4">
          ※ {t('openings.tips_title')}
        </div>
        <ul className="space-y-2.5">
          {(t('openings.tips') ?? []).map((tip, i) => (
            <li
              key={i}
              className="text-sm text-ink2 leading-relaxed ps-5 relative before:content-['→'] before:absolute before:start-0 before:text-sienna text-pretty"
            >
              {tip}
            </li>
          ))}
        </ul>
      </aside>

      {/* DISCLAIMER ───────────────────────────────────── */}
      <p className="font-display-italic text-[13px] text-muted leading-relaxed max-w-3xl mb-20 text-pretty">
        {t('openings.disclaimer')}
      </p>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" className="ms-2 inline-block">
      <path d="M1 5.5h9M6 1.5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  );
}
