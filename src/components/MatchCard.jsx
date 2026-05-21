import { useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';

/**
 * Result card for a single programme match.
 * Collapsed: shows score, institution, name, top strength.
 * Expanded: shows full reasoning, strengths, gaps, application tips.
 */
export default function MatchCard({ programme, match, rank, onSave, isSaved }) {
  const { t, isRtl } = useI18n();
  const [expanded, setExpanded] = useState(rank <= 2);  // top 2 auto-expand

  const score = match.score ?? 0;
  const tone = scoreToTone(score);

  return (
    <article className={`border ${tone.border} bg-paper transition-all duration-300 ${expanded ? 'shadow-[0_8px_28px_-12px_rgba(26,24,20,0.18)]' : ''}`}>
      {/* HEADER ROW ───────────────────────────────────── */}
      <header
        onClick={() => setExpanded((v) => !v)}
        className="cursor-pointer p-5 lg:p-6 flex items-start gap-4 lg:gap-6 hover:bg-paper2/40 transition-colors"
      >
        {/* Rank */}
        <div className="hidden md:block shrink-0">
          <div className="font-mono text-[10px] tracking-wider uppercase text-muted mb-1">
            #
          </div>
          <div className="font-display text-3xl text-ink leading-none">
            {String(rank).padStart(2, '0')}
          </div>
        </div>

        {/* Title block */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-muted">
              {programme.institution?.short_name} · {programme.institution?.city}
            </span>
            {programme.is_rolling && (
              <span className="font-mono text-[10px] tracking-wider uppercase text-sage">
                · rolling
              </span>
            )}
          </div>
          <h3 className="font-display text-xl lg:text-2xl text-ink leading-[1.15] text-balance">
            {programme.name}
          </h3>

          {/* Top-line strength teaser when collapsed */}
          {!expanded && match.strengths?.[0] && (
            <p className="mt-2 font-display-italic text-sm text-muted line-clamp-1 text-pretty">
              ※ {match.strengths[0]}
            </p>
          )}
        </div>

        {/* Score ring */}
        <ScoreDial score={score} tone={tone} />
      </header>

      {/* EXPANDED BODY ─────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-rule">
          {/* Reasoning */}
          <div className="px-5 lg:px-6 py-5 border-b border-rule">
            <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted mb-2">
              ❦ {t('match.step3.match_reasoning')}
            </div>
            <p className="text-[15px] text-ink2 leading-relaxed text-pretty dropcap">
              {match.reasoning}
            </p>
          </div>

          {/* Strengths + Gaps grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-rule">
            <div className="p-5 lg:p-6 md:border-e md:border-rule">
              <div className="font-mono text-[10.5px] tracking-wider uppercase text-sage mb-3">
                ✓ {t('match.step3.match_strengths')}
              </div>
              <ul className="space-y-2">
                {(match.strengths ?? []).map((s, i) => (
                  <li
                    key={i}
                    className="text-[14.5px] text-ink2 leading-snug ps-4 relative before:content-['→'] before:absolute before:start-0 before:text-sage text-pretty"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 lg:p-6 border-t md:border-t-0 border-rule">
              <div className="font-mono text-[10.5px] tracking-wider uppercase text-ochre mb-3">
                ⚠ {t('match.step3.match_gaps')}
              </div>
              <ul className="space-y-2">
                {(match.gaps ?? []).map((g, i) => (
                  <li
                    key={i}
                    className="text-[14.5px] text-ink2 leading-snug ps-4 relative before:content-['—'] before:absolute before:start-0 before:text-ochre text-pretty"
                  >
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tips */}
          {match.tips?.length > 0 && (
            <div className="px-5 lg:px-6 py-5 border-b border-rule bg-sienna/5">
              <div className="font-mono text-[10.5px] tracking-wider uppercase text-sienna mb-3">
                ✦ {t('match.step3.match_tips')}
              </div>
              <ol className="space-y-2 max-w-3xl">
                {match.tips.map((tip, i) => (
                  <li key={i} className="grid grid-cols-[auto_1fr] gap-3 items-baseline">
                    <span className="font-display text-xl text-sienna leading-none">
                      ¶{i + 1}
                    </span>
                    <span className="text-[14.5px] text-ink2 leading-relaxed text-pretty">
                      {tip}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Actions */}
          <footer className="px-5 lg:px-6 py-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={(e) => { e.stopPropagation(); onSave?.(programme); }}
                className={[
                  'inline-flex items-center gap-2 px-4 py-2 text-sm transition-colors border',
                  isSaved
                    ? 'bg-ink text-paper border-ink'
                    : 'border-ink text-ink hover:bg-ink hover:text-paper',
                ].join(' ')}
              >
                <BookmarkIcon filled={isSaved} />
                {isSaved ? t('match.step3.saved') : t('match.step3.save_to_tracker')}
              </button>

              {programme.website && (
                <a
                  href={programme.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="btn-link text-sm self-center"
                >
                  {t('match.step3.open_programme')} →
                </a>
              )}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
              className="font-mono text-[10.5px] tracking-wider uppercase text-muted hover:text-ink"
            >
              {t('match.step3.hide_details')} ↑
            </button>
          </footer>
        </div>
      )}
    </article>
  );
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

function scoreToTone(score) {
  if (score >= 85) return { border: 'border-sage', text: 'text-sage', stroke: '#5F7257' };
  if (score >= 70) return { border: 'border-navy', text: 'text-navy', stroke: '#1B2A4E' };
  if (score >= 55) return { border: 'border-ochre', text: 'text-ochre', stroke: '#B8893F' };
  if (score >= 40) return { border: 'border-rule', text: 'text-muted', stroke: '#7A6E5B' };
  return { border: 'border-rule', text: 'text-muted', stroke: '#C9BFA8' };
}

function ScoreDial({ score, tone }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative shrink-0 w-16 h-16 lg:w-20 lg:h-20" aria-label={`Fit ${score}`}>
      <svg viewBox="0 0 70 70" className="w-full h-full -rotate-90">
        <circle cx="35" cy="35" r={radius} fill="none" stroke="#C9BFA8" strokeWidth="2" />
        <circle
          cx="35" cy="35" r={radius}
          fill="none" stroke={tone.stroke} strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-baseline justify-center">
        <span className={`font-display text-xl lg:text-2xl ${tone.text} leading-none mt-3`}>
          {score}
        </span>
      </div>
    </div>
  );
}

function BookmarkIcon({ filled }) {
  return (
    <svg width="11" height="13" viewBox="0 0 11 13" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2">
      <path d="M1.5 1h8v11L5.5 9 1.5 12V1z" />
    </svg>
  );
}
