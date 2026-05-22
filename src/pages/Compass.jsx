import { useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { researchTools } from '../data/researchTools.js';
import ResearchAssistant from '../components/ResearchAssistant.jsx';

const MODULES = [
  { key: 'basics', icon: '◐' },
  { key: 'research', icon: '⌕' },
  { key: 'fields', icon: '✦' },
  { key: 'writing', icon: '✎' },
  { key: 'timeline', icon: '⌛' },
  { key: 'assistant', icon: '✺' },
];

export default function Compass() {
  const { t } = useI18n();
  const [active, setActive] = useState('basics');

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
      {/* HERO ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 lg:mb-20 animate-fade-up">
        <div className="lg:col-span-8">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sienna mb-4">
            ❦ {t('compass.hero_eyebrow')}
          </div>
          <h1 className="font-display text-display-lg text-ink text-balance leading-[0.95]">
            {t('compass.hero_title')}
          </h1>
        </div>

        <div className="lg:col-span-4 lg:pt-6 lg:border-l lg:border-rule lg:pl-8 relative">
          <p className="text-base leading-relaxed text-ink2 dropcap text-pretty">
            {t('compass.hero_lead')}
          </p>
        </div>
      </section>

      {/* MODULE TABS ─────────────────────────────────────── */}
      <nav className="border-y border-rule mb-12 sticky top-[105px] bg-paper/95 backdrop-blur-sm z-30 -mx-6 lg:-mx-12 px-6 lg:px-12">
        <div className="flex overflow-x-auto">
          {MODULES.map((m, i) => (
            <button
              key={m.key}
              onClick={() => setActive(m.key)}
              className={[
                'flex items-baseline gap-2 px-4 lg:px-5 py-4 text-sm whitespace-nowrap border-b-2 transition-colors',
                active === m.key
                  ? 'text-ink border-ink'
                  : 'text-ink2 border-transparent hover:text-ink',
              ].join(' ')}
            >
              <span className="font-mono text-[10px] text-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-display-italic me-1">{m.icon}</span>
              <span>{t(`compass.modules.${m.key}`)}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* MODULE CONTENT ─────────────────────────────────── */}
      <div className="animate-fade-in" key={active}>
        {active === 'basics' && <BasicsSection />}
        {active === 'research' && <ResearchSection />}
        {active === 'fields' && <FieldsSection />}
        {active === 'writing' && <WritingSection />}
        {active === 'timeline' && <TimelineSection />}
        {active === 'assistant' && <ResearchAssistant />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BASICS
// ═══════════════════════════════════════════════════════════

function BasicsSection() {
  const { t } = useI18n();

  return (
    <div className="space-y-16">
      <header>
        <div className="section-marker">
          <span className="font-mono text-xs tracking-wider text-muted">01.</span>
          <h2 className="font-display text-display-md text-ink">
            {t('compass.basics.title')}
          </h2>
        </div>
        <p className="text-lg leading-relaxed text-ink2 max-w-3xl text-pretty">
          {t('compass.basics.intro')}
        </p>
      </header>

      {/* Two paths comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <PathCard pathKey="structured" tone="navy" />
        <PathCard pathKey="individual" tone="sienna" />
      </div>

      {/* 5 phases */}
      <section>
        <h3 className="font-display text-2xl mb-8 text-ink">
          {t('compass.basics.phases.title')}
        </h3>
        <ol className="space-y-1">
          {(t('compass.basics.phases.items') ?? []).map((phase, i) => (
            <li
              key={i}
              className="grid grid-cols-[auto_1fr] md:grid-cols-[80px_180px_1fr] gap-x-6 gap-y-2 py-6 border-t border-rule last:border-b"
            >
              <div className="font-display text-5xl text-sienna leading-none md:row-span-2">
                {phase.n}
              </div>
              <div>
                <div className="font-display text-xl text-ink leading-tight">
                  {phase.title}
                </div>
                <div className="font-mono text-[11px] tracking-wider uppercase text-muted mt-1">
                  {phase.duration}
                </div>
              </div>
              <div className="text-ink2 leading-relaxed col-span-2 md:col-span-1 text-pretty">
                {phase.what}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Tip callout */}
      <aside className="border-l-4 border-sienna bg-paper2/50 p-6 lg:p-8 max-w-3xl">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-sienna mb-2">
          ※ {t('compass.basics.tip_title')}
        </div>
        <p className="font-display-italic text-lg text-ink leading-relaxed text-pretty">
          {t('compass.basics.tip_body')}
        </p>
      </aside>
    </div>
  );
}

function PathCard({ pathKey, tone }) {
  const { t } = useI18n();
  const path = t(`compass.basics.paths.${pathKey}`);
  const toneClasses = tone === 'navy'
    ? 'border-navy [&_.accent]:text-navy'
    : 'border-sienna [&_.accent]:text-sienna';

  return (
    <article className={`border-t-2 ${toneClasses} bg-paper p-6 lg:p-7`}>
      <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase accent mb-2">
        {path.label}
      </div>
      <h3 className="font-display text-2xl text-ink leading-tight mb-4 text-balance">
        {path.title}
      </h3>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-5 pb-5 border-b border-rule">
        <Meta label="Dauer · Duration" value={path.duration} />
        <Meta label="Sprache · Language" value={path.language} />
        <div className="col-span-2">
          <Meta label="Förderung · Funding" value={path.funding} />
        </div>
      </dl>

      <p className="text-ink2 leading-relaxed text-[15px] mb-5 text-pretty">
        {path.description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <div className="font-mono text-[10.5px] tracking-wider uppercase text-sage mb-2">
            ✓ Vorteile · Pros
          </div>
          <ul className="space-y-1.5">
            {(path.pros ?? []).map((p, i) => (
              <li key={i} className="text-sm text-ink2 leading-snug ps-4 relative before:content-['→'] before:absolute before:start-0 before:text-sage">
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-mono text-[10.5px] tracking-wider uppercase text-danger mb-2">
            ⚠ Nachteile · Cons
          </div>
          <ul className="space-y-1.5">
            {(path.cons ?? []).map((c, i) => (
              <li key={i} className="text-sm text-ink2 leading-snug ps-4 relative before:content-['—'] before:absolute before:start-0 before:text-danger">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-4 border-t border-rule">
        <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted mb-1.5">
          Beispiele · Examples
        </div>
        <p className="text-sm text-ink2 font-mono leading-relaxed">{path.examples}</p>
      </div>
    </article>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <dt className="font-mono text-[10px] tracking-wider uppercase text-muted mb-0.5">{label}</dt>
      <dd className="text-ink2">{value}</dd>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// RESEARCH TOOLS
// ═══════════════════════════════════════════════════════════

function ResearchSection() {
  const { t } = useI18n();

  const grouped = researchTools.reduce((acc, tool) => {
    acc[tool.category] = acc[tool.category] || [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  return (
    <div className="space-y-16">
      <header>
        <div className="section-marker">
          <span className="font-mono text-xs tracking-wider text-muted">02.</span>
          <h2 className="font-display text-display-md text-ink">
            {t('compass.research.title')}
          </h2>
        </div>
        <p className="text-lg leading-relaxed text-ink2 max-w-3xl text-pretty">
          {t('compass.research.intro')}
        </p>
      </header>

      {/* Workflow */}
      <section className="bg-paper2/40 border border-rule p-6 lg:p-8 max-w-4xl">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-sienna mb-4">
          ⌘ {t('compass.research.workflow.title')}
        </div>
        <ol className="space-y-3">
          {(t('compass.research.workflow.steps') ?? []).map((s, i) => (
            <li key={i} className="grid grid-cols-[auto_1fr] gap-4 items-baseline">
              <span className="font-display text-2xl text-navy leading-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-ink2 leading-relaxed text-pretty">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Tools by category */}
      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat}>
          <h3 className="font-display text-xl text-ink mb-5 flex items-baseline gap-3">
            <span className="font-mono text-[10.5px] tracking-wider uppercase text-muted">/</span>
            {t(`compass.research.categories.${cat}`)}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((tool) => (
              <ToolCard key={tool.key} tool={tool} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ToolCard({ tool }) {
  const { t } = useI18n();
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border border-rule hover:border-ink p-5 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="font-display text-lg text-ink leading-tight">{tool.name}</div>
        {tool.free === true && (
          <span className="specimen text-sage border-sage/50">Frei</span>
        )}
        {tool.free === 'limited' && (
          <span className="specimen text-ochre border-ochre/50">Freemium</span>
        )}
      </div>
      <p className="text-sm text-ink2 leading-relaxed text-pretty mb-3">
        {t(`compass.research.tools.${tool.key}`)}
      </p>
      <span className="font-mono text-[10.5px] tracking-wider uppercase text-navy group-hover:text-sienna">
        {t('compass.research.open_link')} →
      </span>
    </a>
  );
}

// ═══════════════════════════════════════════════════════════
// FIELDS
// ═══════════════════════════════════════════════════════════

function FieldsSection() {
  const { t } = useI18n();
  const fields = ['cancer', 'immunology', 'neuroscience'];

  return (
    <div className="space-y-16">
      <header>
        <div className="section-marker">
          <span className="font-mono text-xs tracking-wider text-muted">03.</span>
          <h2 className="font-display text-display-md text-ink">
            {t('compass.fields.title')}
          </h2>
        </div>
        <p className="text-lg leading-relaxed text-ink2 max-w-3xl text-pretty">
          {t('compass.fields.intro')}
        </p>
      </header>

      <div className="space-y-12">
        {fields.map((f, i) => (
          <FieldCard key={f} fieldKey={f} index={i} />
        ))}
      </div>
    </div>
  );
}

function FieldCard({ fieldKey, index }) {
  const { t } = useI18n();
  const field = t(`compass.fields.${fieldKey}`);
  const ACCENT = ['sienna', 'navy', 'sage'][index];
  const accentClass = {
    sienna: 'border-sienna text-sienna',
    navy: 'border-navy text-navy',
    sage: 'border-sage text-sage',
  }[ACCENT];

  return (
    <article className={`border-t-2 ${accentClass.split(' ')[0]} pt-6`}>
      <div className="flex items-baseline gap-4 mb-6">
        <span className={`font-display text-4xl ${accentClass.split(' ')[1]} leading-none`}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="font-display text-3xl text-ink text-balance">
          {field.title}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Areas */}
        <div className="lg:col-span-5">
          <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted mb-3">
            ✦ Teilgebiete · Sub-areas
          </div>
          <ul className="grid grid-cols-1 gap-2">
            {(field.areas ?? []).map((a, i) => (
              <li key={i} className="text-ink2 leading-snug ps-4 relative before:content-['◦'] before:absolute before:start-0 before:text-muted">
                {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Journals */}
        <div className="lg:col-span-3">
          <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted mb-3">
            ❦ Schlüssel-Zeitschriften
          </div>
          <ul className="space-y-1.5">
            {(field.key_journals ?? []).map((j, i) => (
              <li key={i} className="text-ink2 font-display-italic text-[15px] leading-snug">
                {j}
              </li>
            ))}
          </ul>
        </div>

        {/* Institutions */}
        <div className="lg:col-span-4">
          <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted mb-3">
            ◈ Führende Institutionen
          </div>
          <ul className="space-y-1.5">
            {(field.key_institutions ?? []).map((inst, i) => (
              <li key={i} className="text-ink2 text-sm leading-snug">
                {inst}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Search terms */}
      <div className="mt-6 pt-5 border-t border-rule">
        <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted mb-2">
          ⌕ Suchbegriffe · PubMed search terms
        </div>
        <p className="font-mono text-[12.5px] text-ink2 leading-relaxed">
          {field.search_terms}
        </p>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════
// WRITING
// ═══════════════════════════════════════════════════════════

function WritingSection() {
  const { t } = useI18n();

  return (
    <div className="space-y-16 max-w-5xl">
      <header>
        <div className="section-marker">
          <span className="font-mono text-xs tracking-wider text-muted">04.</span>
          <h2 className="font-display text-display-md text-ink">
            {t('compass.writing.title')}
          </h2>
        </div>
        <p className="text-lg leading-relaxed text-ink2 text-pretty">
          {t('compass.writing.intro')}
        </p>
      </header>

      {/* Exposé */}
      <section>
        <h3 className="font-display text-2xl text-ink mb-3">
          {t('compass.writing.expose.title')}
        </h3>
        <p className="text-ink2 leading-relaxed mb-6 max-w-3xl text-pretty">
          {t('compass.writing.expose.what')}
        </p>

        <ol className="border-t border-rule">
          {(t('compass.writing.expose.sections') ?? []).map((sec, i) => (
            <li key={i} className="grid grid-cols-[40px_1fr_2fr] gap-4 py-4 border-b border-rule items-baseline">
              <span className="font-mono text-[11px] tracking-wider text-muted">
                §{String(i + 1).padStart(2, '0')}
              </span>
              <div className="font-display text-lg text-ink leading-tight">
                {sec.name}
              </div>
              <div className="text-ink2 text-[15px] leading-relaxed text-pretty">
                {sec.purpose}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Motivation */}
      <section>
        <h3 className="font-display text-2xl text-ink mb-3">
          {t('compass.writing.motivation.title')}
        </h3>
        <p className="text-ink2 leading-relaxed mb-4 max-w-3xl text-pretty">
          {t('compass.writing.motivation.what')}
        </p>
        <ol className="space-y-3 max-w-3xl">
          {(t('compass.writing.motivation.structure') ?? []).map((s, i) => (
            <li key={i} className="grid grid-cols-[auto_1fr] gap-4 items-baseline">
              <span className="font-display text-3xl text-sienna leading-none">¶{i + 1}</span>
              <span className="text-ink2 leading-relaxed text-pretty">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Dissertation type */}
      <section>
        <h3 className="font-display text-2xl text-ink mb-6">
          {t('compass.writing.dissertation.title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-rule p-6">
            <div className="font-mono text-[10.5px] tracking-wider uppercase text-navy mb-2">
              ◇ Monografie
            </div>
            <p className="text-ink2 leading-relaxed text-pretty">
              {t('compass.writing.dissertation.mono')}
            </p>
          </div>
          <div className="border-2 border-sienna bg-sienna/5 p-6 relative">
            <div className="absolute -top-3 start-4 px-2 bg-paper font-mono text-[10px] tracking-wider uppercase text-sienna">
              Lebenswissenschaften — Standard
            </div>
            <div className="font-mono text-[10.5px] tracking-wider uppercase text-sienna mb-2">
              ◆ Kumulativ
            </div>
            <p className="text-ink2 leading-relaxed text-pretty">
              {t('compass.writing.dissertation.cumulative')}
            </p>
          </div>
        </div>
      </section>

      <aside className="border-l-4 border-ochre bg-paper2/40 p-6 max-w-3xl">
        <p className="font-display-italic text-base text-ink2 leading-relaxed text-pretty">
          {t('compass.writing.tip')}
        </p>
      </aside>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TIMELINE
// ═══════════════════════════════════════════════════════════

function TimelineSection() {
  const { t } = useI18n();
  const items = t('compass.timeline.items') ?? [];

  return (
    <div className="space-y-12">
      <header>
        <div className="section-marker">
          <span className="font-mono text-xs tracking-wider text-muted">05.</span>
          <h2 className="font-display text-display-md text-ink">
            {t('compass.timeline.title')}
          </h2>
        </div>
        <p className="text-lg leading-relaxed text-ink2 max-w-3xl text-pretty">
          {t('compass.timeline.intro')}
        </p>
      </header>

      <ol className="relative">
        {/* Vertical timeline line */}
        <div className="absolute start-[60px] md:start-[100px] top-0 bottom-0 w-px bg-rule" />

        {items.map((item, i) => (
          <li key={i} className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-6 pb-10 last:pb-0 relative">
            {/* Month marker */}
            <div className="relative">
              <div className="font-mono text-[10px] tracking-wider uppercase text-muted mb-1">
                Monat
              </div>
              <div className="font-display text-2xl md:text-3xl text-sienna leading-none">
                {item.month}
              </div>
              {/* Dot on the line */}
              <div className="absolute end-[-7px] md:end-[-11px] top-2 w-3 h-3 md:w-4 md:h-4 bg-paper border-2 border-sienna rounded-full" />
            </div>

            {/* Content */}
            <div className="ps-6 border-s-0">
              <h3 className="font-display text-xl text-ink leading-tight mb-3">
                {item.title}
              </h3>
              <ul className="space-y-1.5">
                {(item.items ?? []).map((sub, j) => (
                  <li key={j} className="text-ink2 leading-snug ps-4 relative before:content-['→'] before:absolute before:start-0 before:text-muted text-pretty">
                    {sub}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

