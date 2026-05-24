import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n.jsx';
import { useProfile } from '../lib/profile.js';
import { useTracker } from '../lib/tracker.js';

const DISMISS_KEY = 'phd-match-onboarding-dismissed';
const LABS_SEEN_KEY = 'phd-match-labs-seen';

/**
 * Smart "getting started" guide shown atop the home page.
 * Each step verifies real user state, so progress reflects what they've
 * actually done — not just clicks. Auto-hides once all steps are done or
 * when the user dismisses it. A small "show getting started" pill lets
 * them bring it back.
 */
export default function OnboardingGuide() {
  const { t } = useI18n();
  const { profile } = useProfile();
  const { apps } = useTracker();

  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === '1'
  );

  // Re-read transient localStorage flags on mount
  const [flags, setFlags] = useState({ match: false, outreach: false, labs: false });
  useEffect(() => {
    const read = () => {
      let match = false, outreach = false, labs = false;
      try {
        const r = JSON.parse(localStorage.getItem('phd-match-cv-results'));
        match = Boolean(r?.matches?.length || r?.profile);
      } catch { /* ignore */ }
      try {
        const log = JSON.parse(localStorage.getItem('phd-match-outreach-log'));
        outreach = Array.isArray(log) && log.length > 0;
      } catch { /* ignore */ }
      labs = localStorage.getItem(LABS_SEEN_KEY) === '1';
      setFlags({ match, outreach, labs });
    };
    read();
    window.addEventListener('focus', read);
    return () => window.removeEventListener('focus', read);
  }, []);

  const steps = useMemo(() => {
    const profileDone = Boolean((profile?.cv_text || '').trim().length > 30);
    const saveDone = apps.length > 0;
    return [
      { key: 'profile', done: profileDone, to: '/profile' },
      { key: 'match', done: flags.match, to: '/match' },
      { key: 'labs', done: flags.labs, to: '/labs' },
      { key: 'save', done: saveDone, to: '/' },
      { key: 'outreach', done: flags.outreach, to: '/outreach' },
    ];
  }, [profile, apps, flags]);

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  // Dismissed → small restore pill
  if (dismissed) {
    return (
      <button
        onClick={() => { localStorage.removeItem(DISMISS_KEY); setDismissed(false); }}
        className="mb-8 inline-flex items-center gap-2 font-mono text-[10.5px] tracking-wider uppercase text-muted border border-rule px-3 py-1.5 rounded-sm hover:border-ink hover:text-ink transition-colors"
      >
        ◷ {t('onboarding.restore')}
      </button>
    );
  }

  const dismiss = () => { localStorage.setItem(DISMISS_KEY, '1'); setDismissed(true); };

  return (
    <section className="mb-12 border border-ink/15 bg-paper2/40 rounded-sm overflow-hidden animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-5 lg:p-6 border-b border-rule">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-display text-xl lg:text-2xl text-ink leading-tight">
              {allDone ? t('onboarding.done_title') : t('onboarding.title')}
            </span>
          </div>
          <p className="text-sm text-ink2 leading-relaxed text-pretty max-w-2xl">
            {allDone ? t('onboarding.done_body') : t('onboarding.subtitle')}
          </p>
        </div>
        <button
          onClick={dismiss}
          className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-ink shrink-0 mt-1"
        >
          ✕ {t('onboarding.dismiss')}
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-5 lg:px-6 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] tracking-wider uppercase text-muted">
            {t('onboarding.progress', { done: doneCount, total: steps.length })}
          </span>
          <span className="font-mono text-[10px] text-muted">{Math.round((doneCount / steps.length) * 100)}%</span>
        </div>
        <div className="h-1 bg-rule/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-sage transition-all duration-700 ease-out"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <ol className="p-5 lg:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {steps.map((step, i) => (
          <li key={step.key}>
            <Link
              to={step.to}
              className={[
                'group block h-full border rounded-sm p-4 transition-colors',
                step.done
                  ? 'border-sage/40 bg-sage/5'
                  : 'border-rule bg-paper hover:border-ink',
              ].join(' ')}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={[
                    'w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 transition-colors',
                    step.done
                      ? 'bg-sage text-paper'
                      : 'border border-muted text-muted',
                  ].join(' ')}
                >
                  {step.done ? '✓' : i + 1}
                </span>
                <span className="font-mono text-[9.5px] tracking-wider uppercase text-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="font-display text-[15px] text-ink leading-tight mb-1">
                {t(`onboarding.steps.${step.key}.title`)}
              </div>
              <p className="text-[12.5px] text-muted leading-snug text-pretty mb-3">
                {t(`onboarding.steps.${step.key}.body`)}
              </p>
              {!step.done && (
                <span className="font-mono text-[10.5px] tracking-wider uppercase text-navy group-hover:text-sienna transition-colors">
                  {t(`onboarding.steps.${step.key}.cta`)} →
                </span>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
