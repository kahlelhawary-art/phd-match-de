import { useI18n } from '../lib/i18n.jsx';

/**
 * Editorial-style citation card. Renders a single landmark paper with
 * citation, DOI, why-to-read, and an external link.
 */
export default function PaperCard({ paper }) {
  const { t, isRtl } = useI18n();

  return (
    <article className="border border-rule hover:border-ink transition-colors duration-300 p-6 bg-paper">
      {/* Top row — year + essential badge */}
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-muted">
          {paper.year} · {paper.journal}
        </span>
        {paper.essential && (
          <span className="specimen text-sienna border-sienna/60">
            ✦ {t('library.labels.essential')}
          </span>
        )}
      </div>

      {/* Title — Fraunces, generous leading */}
      <h3 className="font-display text-xl text-ink leading-[1.15] mb-3 text-balance">
        {paper.title}
      </h3>

      {/* Authors */}
      <p className="text-sm text-ink2 mb-4 leading-snug">{paper.authors}</p>

      {/* Citation block — mono, in a subtle frame */}
      <div className="border-s-2 border-rule ps-3 mb-4">
        <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted mb-0.5">
          {t('library.labels.citation')}
        </div>
        <div className="font-mono text-[12.5px] text-ink2 leading-relaxed">
          {paper.citation}
          {paper.doi && (
            <>
              <br />
              <span className="text-muted">doi: </span>
              <span className="text-navy">{paper.doi}</span>
            </>
          )}
        </div>
      </div>

      {/* Why */}
      <div className="mb-5">
        <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted mb-1.5">
          ❦ {t('library.labels.why')}
        </div>
        <p className="text-[14.5px] text-ink2 leading-relaxed text-pretty">
          {paper.why}
        </p>
      </div>

      {/* CTA */}
      <div className="pt-4 border-t border-rule">
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-link text-sm"
        >
          {t('library.labels.open')}
          <ArrowIcon rtl={isRtl} />
        </a>
      </div>
    </article>
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
