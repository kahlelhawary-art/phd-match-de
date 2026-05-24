import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n.jsx';
import { useTracker } from '../lib/tracker.js';
import { buildIcs, downloadIcs } from '../lib/ics.js';
import { programmesWithInstitutions } from '../data/seed.js';
import { pis as allPis } from '../data/pis.js';

function daysUntil(iso) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(iso); d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

// Bucket by urgency
function bucketOf(days) {
  if (days < 0) return 'overdue';
  if (days <= 7) return 'urgent';
  if (days <= 31) return 'soon';
  return 'later';
}

const GROUP_ORDER = ['overdue', 'urgent', 'soon', 'later'];
const GROUP_TONE = {
  overdue: '#9C4A2C',
  urgent: '#B8893F',
  soon: '#1B2A4E',
  later: '#5F7257',
};

export default function Deadlines() {
  const { t, lang } = useI18n();
  const { apps } = useTracker();

  const progMap = useMemo(
    () => Object.fromEntries(programmesWithInstitutions.map((p) => [p.id, p])),
    []
  );
  const piMap = useMemo(() => Object.fromEntries(allPis.map((p) => [p.id, p])), []);

  // Collect every app that has a deadline (deadline OR nextActionDate)
  const items = useMemo(() => {
    return apps
      .map((a) => {
        const date = a.deadline || a.nextActionDate;
        if (!date) return null;
        const prog = progMap[a.programmeId];
        const pi = a.piId ? piMap[a.piId] : null;
        const days = daysUntil(date);
        return {
          app: a,
          date,
          days,
          bucket: bucketOf(days),
          title: pi?.name || prog?.name || 'Programme',
          inst: prog?.institution?.short_name || prog?.short_name || '',
          city: prog?.institution?.city || '',
          status: a.status,
          url: prog?.website || pi?.lab_url || '',
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.days - b.days);
  }, [apps, progMap, piMap]);

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const thisWeek = items.filter((i) => i.days >= 0 && i.days <= 7).length;
    const thisMonth = items.filter((i) => i.days >= 0 && i.days <= 31).length;
    const overdue = items.filter((i) => i.days < 0).length;
    return { total, thisWeek, thisMonth, overdue };
  }, [items]);

  // Group by bucket
  const groups = useMemo(() => {
    const g = {};
    items.forEach((it) => {
      (g[it.bucket] ||= []).push(it);
    });
    return g;
  }, [items]);

  const fmtDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString(
        lang === 'de' ? 'de-DE' : lang === 'ar' ? 'ar' : 'en-GB',
        { day: '2-digit', month: 'short', year: 'numeric' }
      );
    } catch { return iso; }
  };

  const exportAll = () => {
    const events = items.map((it) => ({
      summary: `${it.title} — ${t('deadlines.card.deadline')}`,
      dateStr: it.date,
      description: `${it.inst}${it.city ? ' · ' + it.city : ''}`,
      url: it.url,
    }));
    if (events.length === 0) return;
    downloadIcs(buildIcs(events), 'phd-deadlines.ics');
  };

  const exportOne = (it) => {
    const ev = [{
      summary: `${it.title} — ${t('deadlines.card.deadline')}`,
      dateStr: it.date,
      description: `${it.inst}${it.city ? ' · ' + it.city : ''}`,
      url: it.url,
    }];
    const slug = (it.title || 'deadline').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    downloadIcs(buildIcs(ev), `${slug}-deadline.ics`);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
      {/* HERO ─────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 animate-fade-up">
        <div className="lg:col-span-8">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sienna mb-4">
            ⌖ {t('deadlines.hero_eyebrow')}
          </div>
          <h1 className="font-display text-display-lg text-ink text-balance leading-[0.95]">
            {t('deadlines.hero_title')}
          </h1>
        </div>
        <div className="lg:col-span-4 lg:pt-6 lg:border-l lg:border-rule lg:pl-8">
          <p className="text-base leading-relaxed text-ink2 dropcap text-pretty">
            {t('deadlines.hero_lead')}
          </p>
        </div>
      </section>

      {items.length === 0 ? (
        <EmptyState t={t} />
      ) : (
        <>
          {/* STATS ───────────────────────────────────── */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule mb-8">
            <Stat label={t('deadlines.stats.total')} value={stats.total} />
            <Stat label={t('deadlines.stats.this_week')} value={stats.thisWeek} accent={stats.thisWeek ? '#B8893F' : undefined} />
            <Stat label={t('deadlines.stats.this_month')} value={stats.thisMonth} accent="#1B2A4E" />
            <Stat label={t('deadlines.stats.overdue')} value={stats.overdue} accent={stats.overdue ? '#9C4A2C' : undefined} />
          </section>

          {/* EXPORT BAR ──────────────────────────────── */}
          <div className="flex justify-end mb-8">
            <button onClick={exportAll} className="btn-primary text-sm">
              ⊞ {t('deadlines.export_all')}
            </button>
          </div>

          {/* GROUPS ──────────────────────────────────── */}
          {GROUP_ORDER.filter((g) => groups[g]?.length).map((g) => (
            <section key={g} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: GROUP_TONE[g] }} />
                <h2 className="font-mono text-[11px] tracking-[0.18em] uppercase" style={{ color: GROUP_TONE[g] }}>
                  {t(`deadlines.groups.${g}`)}
                </h2>
                <span className="font-mono text-[10px] text-muted">{groups[g].length}</span>
                <div className="flex-1 border-b border-rule ms-2" />
              </div>

              <div className="space-y-3">
                {groups[g].map((it) => (
                  <article
                    key={it.app.id}
                    className="flex items-center gap-4 border border-rule bg-paper hover:border-ink transition-colors p-4 rounded-sm"
                  >
                    {/* Day counter */}
                    <div className="shrink-0 w-16 text-center" style={{ color: GROUP_TONE[g] }}>
                      <div className="font-display text-3xl leading-none">
                        {it.days < 0 ? Math.abs(it.days) : it.days}
                      </div>
                      <div className="font-mono text-[8.5px] tracking-wider uppercase text-muted mt-1">
                        {it.days < 0
                          ? t('deadlines.groups.overdue')
                          : it.days === 0
                          ? t('deadlines.card.today')
                          : it.days === 1
                          ? t('deadlines.card.tomorrow')
                          : t('deadlines.card.unit')}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 border-s border-rule ps-4">
                      <div className="font-display text-base text-ink leading-tight truncate">
                        {it.title}
                      </div>
                      <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted mt-0.5">
                        {it.inst}{it.city ? ` · ${it.city}` : ''} · {fmtDate(it.date)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => exportOne(it)}
                        className="font-mono text-[10px] tracking-wider uppercase text-navy hover:text-sienna border border-rule hover:border-sienna rounded-sm px-2.5 py-1.5 transition-colors"
                        title={t('deadlines.export_one')}
                      >
                        ⊞
                      </button>
                      <Link
                        to="/tracker"
                        className="font-mono text-[10px] tracking-wider uppercase text-muted hover:text-ink"
                      >
                        →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}

          {/* TIPS ────────────────────────────────────── */}
          <aside className="border-l-4 border-sienna bg-paper2/40 p-5 lg:p-6 mb-20 mt-4">
            <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-sienna mb-3">
              ※ {t('deadlines.tip_title')}
            </div>
            <ul className="space-y-2">
              {(t('deadlines.tips') ?? []).map((tip, i) => (
                <li key={i} className="text-sm text-ink2 leading-relaxed ps-5 relative before:content-['→'] before:absolute before:start-0 before:text-sienna text-pretty">
                  {tip}
                </li>
              ))}
            </ul>
          </aside>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="bg-paper p-4 lg:p-5">
      <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted mb-2">{label}</div>
      <div className="font-display text-3xl lg:text-4xl leading-none" style={{ color: accent || '#1A1814' }}>
        {value}
      </div>
    </div>
  );
}

function EmptyState({ t }) {
  return (
    <div className="border border-dashed border-rule rounded-sm p-12 lg:p-16 text-center max-w-2xl mx-auto">
      <div className="font-display text-5xl text-muted/40 mb-4">⌖</div>
      <h2 className="font-display text-2xl text-ink mb-2">{t('deadlines.empty_title')}</h2>
      <p className="text-ink2 leading-relaxed mb-6 text-pretty">{t('deadlines.empty_body')}</p>
      <Link to="/tracker" className="btn-primary inline-flex">{t('deadlines.empty_cta')} →</Link>
    </div>
  );
}
