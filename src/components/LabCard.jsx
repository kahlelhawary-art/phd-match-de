import { useI18n } from '../lib/i18n.jsx';

/**
 * Editorial-style card for a single PI / research group.
 */
export default function LabCard({ pi, onSave, isSaved, onDraftOutreach, onReadPaper }) {
  const { t, lang, isRtl } = useI18n();
  const inst = pi.institution;

  const focus =
    lang === 'de' ? pi.research_focus_de :
    lang === 'ar' ? pi.research_focus_ar :
    pi.research_focus;

  const handleEmailClick = (e) => {
    if (!pi.email) e.preventDefault();
  };

  return (
    <article className="pi-card group flex flex-col h-full">
      {/* HEADER ─────────────────────────────────────────── */}
      <header className="pb-4 border-b border-rule">
        <div className="flex items-baseline justify-between gap-3 mb-1.5">
          <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-muted">
            {inst?.short_name} · {inst?.city}
          </span>
          {pi.title && (
            <span className="font-mono text-[10.5px] tracking-wider uppercase text-sienna shrink-0">
              {pi.title}
            </span>
          )}
        </div>

        <h3 className="font-display text-2xl leading-[1.1] text-ink text-balance">
          {pi.name}
        </h3>

        {/* Accepting status */}
        <div className="mt-3 flex items-center gap-2">
          {pi.accepting_students ? (
            <span className="flex items-center gap-1.5 text-[10.5px] font-mono tracking-wider text-sage uppercase">
              <span className="dot bg-sage animate-pulse" />
              {t('labs.card.accepting')}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10.5px] font-mono tracking-wider text-muted uppercase">
              <span className="dot bg-muted" />
              {t('labs.card.not_accepting')}
            </span>
          )}
        </div>
      </header>

      {/* RESEARCH FOCUS ─────────────────────────────────── */}
      <div className="py-5">
        <div className="font-mono text-[10px] tracking-wider uppercase text-muted mb-2">
          ❦ {t('labs.card.research_focus')}
        </div>
        <p className="text-[14.5px] leading-relaxed text-ink2 text-pretty">
          {focus}
        </p>
      </div>

      {/* FIELDS ──────────────────────────────────────────── */}
      <div className="pb-4">
        <div className="flex flex-wrap gap-1.5">
          {pi.fields.map((f) => (
            <span key={f} className="tag">
              {t(`discover.fields.${f}`) ?? f}
            </span>
          ))}
        </div>
      </div>

      {/* RECENT PAPERS ──────────────────────────────────── */}
      {pi.recent_papers && pi.recent_papers.length > 0 && (
        <div className="border-t border-rule pt-4 pb-4">
          <div className="font-mono text-[10px] tracking-wider uppercase text-muted mb-3">
            ◈ {t('labs.card.recent_papers')}
          </div>
          <ul className="space-y-2">
            {pi.recent_papers.map((p, i) => (
              <li key={i} className="text-sm">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:text-sienna transition-colors"
                >
                  <span className="font-display-italic text-[14px] text-ink2 leading-snug">
                    {p.title}
                  </span>
                  <span className="block font-mono text-[10.5px] tracking-wider text-muted mt-0.5">
                    {p.journal} · {p.year}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* NOTES ──────────────────────────────────────────── */}
      {pi.notes && (
        <div className="border-t border-rule pt-3 pb-3">
          <div className="font-mono text-[10px] tracking-wider uppercase text-muted mb-1">
            ※ {t('labs.card.notes')}
          </div>
          <p className="font-display-italic text-[12.5px] text-muted leading-snug">
            {pi.notes}
          </p>
        </div>
      )}

      {/* FOOTER CTAs ──────────────────────────────────── */}
      <footer className="mt-auto border-t border-rule pt-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => onSave?.(pi)}
            className={[
              'inline-flex items-center gap-1.5 text-sm transition-colors',
              isSaved ? 'text-sienna' : 'text-ink2 hover:text-ink',
            ].join(' ')}
            title={t('labs.card.save_to_tracker')}
          >
            <BookmarkIcon filled={isSaved} />
            {isSaved ? t('labs.card.saved') : t('labs.card.save_to_tracker')}
          </button>

          {onDraftOutreach && (
            <button
              onClick={() => onDraftOutreach(pi)}
              className="text-sm text-navy hover:text-sienna ms-3"
            >
              ✎ {t('labs.card.draft_outreach')}
            </button>
          )}

          {onReadPaper && (
            <button
              onClick={() => onReadPaper(pi)}
              className="text-sm text-navy hover:text-sienna ms-3"
            >
              ◐ {t('labs.card.read_paper')}
            </button>
          )}
        </div>

        <div className="flex items-baseline gap-3">
          {pi.email ? (
            <a
              href={`mailto:${pi.email}`}
              className="btn-link text-xs"
              onClick={handleEmailClick}
            >
              ↗ {t('labs.card.send_email')}
            </a>
          ) : (
            <span
              className="text-xs text-muted/70"
              title={t('labs.card.no_email')}
            >
              {t('labs.card.no_email')}
            </span>
          )}

          {pi.lab_url && (
            <a
              href={pi.lab_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-link text-sm"
            >
              {t('labs.card.view_lab')}
              <ArrowIcon rtl={isRtl} />
            </a>
          )}
        </div>
      </footer>
    </article>
  );
}

function BookmarkIcon({ filled }) {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2">
      <path d="M1.5 1h8v11L5.5 9 1.5 12V1z" />
    </svg>
  );
}

function ArrowIcon({ rtl }) {
  return (
    <svg
      width="11" height="11" viewBox="0 0 11 11" className="ms-1"
      style={{ transform: rtl ? 'scaleX(-1)' : 'none' }}
    >
      <path d="M1 5.5h9M6 1.5l4 4-4 4" stroke="currentColor" strokeWidth="1.3" fill="none" />
    </svg>
  );
}

