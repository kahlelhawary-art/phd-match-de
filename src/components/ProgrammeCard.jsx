import { useI18n } from '../lib/i18n.jsx';

/**
 * Editorial-style card for a PhD programme.
 * Shows institution, title, fields, language, funding, deadline, and CTAs.
 */
export default function ProgrammeCard({ programme, onSave, isSaved }) {
  const { t, lang, isRtl } = useI18n();
  const inst = programme.institution;

  const description =
    lang === 'de' ? programme.description_de :
    lang === 'ar' ? programme.description_ar :
    programme.description_en;

  const langLabel = {
    german: t('discover.language.german'),
    english: t('discover.language.english'),
    bilingual: t('discover.language.bilingual'),
  }[programme.language];

  return (
    <article className="pi-card group flex flex-col h-full">
      {/* Header — institution short name in mono */}
      <header className="flex items-start justify-between gap-4 pb-4 border-b border-rule">
        <div className="flex flex-col">
          <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-muted">
            {inst?.short_name} · {inst?.city}
          </span>
          <h3 className="font-display text-2xl leading-[1.1] mt-1.5 text-ink text-balance">
            {programme.name}
          </h3>
        </div>

        {programme.open_for_applications && (
          <span className="shrink-0 flex items-center gap-1.5 text-[10.5px] font-mono tracking-wider text-sage uppercase">
            <span className="dot bg-sage animate-pulse" />
            {t('common.open')}
          </span>
        )}
      </header>

      {/* Body */}
      <div className="py-5 flex-1">
        <p className="text-[14.5px] leading-relaxed text-ink2 text-pretty">
          {description}
        </p>
      </div>

      {/* Metadata grid */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm pb-5 border-t border-rule pt-4">
        <div>
          <dt className="font-mono text-[10px] tracking-wider uppercase text-muted mb-1">
            {t('discover.card.fields')}
          </dt>
          <dd className="flex flex-wrap gap-1.5">
            {programme.fields.slice(0, 3).map((f) => (
              <span key={f} className="tag">
                {t(`discover.fields.${f}`)}
              </span>
            ))}
            {programme.fields.length > 3 && (
              <span className="tag">+{programme.fields.length - 3}</span>
            )}
          </dd>
        </div>

        <div>
          <dt className="font-mono text-[10px] tracking-wider uppercase text-muted mb-1">
            {t('discover.card.language')}
          </dt>
          <dd className="text-ink2">{langLabel}</dd>
        </div>

        <div className="col-span-2">
          <dt className="font-mono text-[10px] tracking-wider uppercase text-muted mb-1">
            {t('discover.card.funding')}
          </dt>
          <dd className="text-ink2">{programme.funding_info}</dd>
        </div>

        <div className="col-span-2">
          <dt className="font-mono text-[10px] tracking-wider uppercase text-muted mb-1">
            {t('discover.card.deadline')}
          </dt>
          <dd className="text-ink2 font-display italic">
            {programme.is_rolling
              ? t('discover.card.rolling')
              : programme.next_intake}
          </dd>
        </div>
      </dl>

      {/* Footer CTAs */}
      <footer className="flex items-center justify-between gap-3 pt-4 border-t border-rule">
        <button
          onClick={() => onSave?.(programme)}
          className={[
            'text-sm transition-colors flex items-center gap-1.5',
            isSaved ? 'text-sienna' : 'text-ink2 hover:text-ink',
          ].join(' ')}
        >
          <BookmarkIcon filled={isSaved} />
          {isSaved ? t('discover.card.saved') : t('discover.card.save')}
        </button>

        <a
          href={programme.website}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-link text-sm"
        >
          {t('discover.card.external')}
          <ArrowIcon rtl={isRtl} />
        </a>
      </footer>
    </article>
  );
}

function BookmarkIcon({ filled }) {
  return (
    <svg width="13" height="14" viewBox="0 0 13 14" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2">
      <path d="M2 1h9v12L6.5 9.5 2 13V1z" />
    </svg>
  );
}

function ArrowIcon({ rtl }) {
  return (
    <svg
      width="11" height="11" viewBox="0 0 11 11"
      style={{ transform: rtl ? 'scaleX(-1)' : 'none' }}
    >
      <path d="M1 5.5h9M6 1.5l4 4-4 4" stroke="currentColor" strokeWidth="1.3" fill="none" />
    </svg>
  );
}

