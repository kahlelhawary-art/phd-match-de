import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n.jsx';
import { useTracker, COLUMNS } from '../lib/tracker.js';
import { useInterviewHistory } from '../lib/interviewHistory.js';
import { programmesWithInstitutions } from '../data/seed.js';
import { pis as allPis } from '../data/pis.js';

const COLUMN_TONE = {
  interested: '#7A6E5B',
  contacted: '#B8893F',
  applied: '#1B2A4E',
  interview: '#9C4A2C',
  decision: '#5F7257',
};

function readOutreachLog() {
  try {
    const log = JSON.parse(localStorage.getItem('phd-match-outreach-log'));
    return Array.isArray(log) ? log : [];
  } catch { return []; }
}

function daysUntil(iso) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(iso); d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

export default function Dashboard() {
  const { t, lang } = useI18n();
  const { apps } = useTracker();
  const { records: interviews } = useInterviewHistory();
  const outreach = useMemo(readOutreachLog, []);

  const progMap = useMemo(
    () => Object.fromEntries(programmesWithInstitutions.map((p) => [p.id, p])),
    []
  );
  const piMap = useMemo(() => Object.fromEntries(allPis.map((p) => [p.id, p])), []);

  // ── Stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = apps.length;
    const decisions = apps.filter((a) => a.status === 'decision').length;
    const active = total - decisions;

    const deadlines = apps
      .filter((a) => a.deadline)
      .map((a) => ({ app: a, days: daysUntil(a.deadline) }))
      .filter((d) => d.days >= 0)
      .sort((a, b) => a.days - b.days);
    const nextDeadline = deadlines[0] ?? null;

    const sent = outreach.length;
    const replied = outreach.filter((o) => o.replied).length;
    const replyRate = sent > 0 ? Math.round((replied / sent) * 100) : 0;

    const scores = interviews.map((i) => i.score).filter((n) => typeof n === 'number');
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const bestScore = scores.length ? Math.max(...scores) : null;

    const byColumn = Object.fromEntries(COLUMNS.map((c) => [c, 0]));
    apps.forEach((a) => { if (byColumn[a.status] != null) byColumn[a.status]++; });

    return { total, active, decisions, nextDeadline, deadlines, sent, replied, replyRate, avgScore, bestScore, interviews: interviews.length, byColumn };
  }, [apps, outreach, interviews]);

  // ── Recent activity (merge sources, newest first) ──────
  const activity = useMemo(() => {
    const items = [];
    apps.forEach((a) => {
      const prog = progMap[a.programmeId];
      const pi = a.piId ? piMap[a.piId] : null;
      items.push({
        type: 'app',
        at: a.updatedAt || a.createdAt,
        title: pi?.name || prog?.name || 'Programme',
        sub: prog?.institution?.short_name || '',
        tag: a.status,
      });
    });
    outreach.forEach((o) => items.push({
      type: 'outreach', at: o.createdAt,
      title: o.piName || o.programmeName || 'Outreach',
      sub: o.institution || '', tag: o.replied ? 'replied' : 'sent',
    }));
    interviews.forEach((iv) => items.push({
      type: 'interview', at: iv.createdAt,
      title: 'Interview', sub: iv.field || '', tag: `${iv.score}%`,
    }));
    return items
      .filter((x) => x.at)
      .sort((a, b) => (b.at || '').localeCompare(a.at || ''))
      .slice(0, 8);
  }, [apps, outreach, interviews, progMap, piMap]);

  const fmtDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString(
        lang === 'de' ? 'de-DE' : lang === 'ar' ? 'ar' : 'en-GB',
        { day: '2-digit', month: 'short' }
      );
    } catch { return ''; }
  };

  const isEmpty = stats.total === 0 && stats.sent === 0 && stats.interviews === 0;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
      {/* HERO ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 lg:mb-14 animate-fade-up">
        <div className="lg:col-span-8">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sienna mb-4">
            ❦ {t('dashboard.hero_eyebrow')}
          </div>
          <h1 className="font-display text-display-lg text-ink text-balance leading-[0.95]">
            {t('dashboard.hero_title')}
          </h1>
        </div>
        <div className="lg:col-span-4 lg:pt-6 lg:border-l lg:border-rule lg:pl-8">
          <p className="text-base leading-relaxed text-ink2 dropcap text-pretty">
            {t('dashboard.hero_lead')}
          </p>
        </div>
      </section>

      {isEmpty ? (
        <EmptyState t={t} />
      ) : (
        <>
          {/* STAT TILES ─────────────────────────────────── */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule mb-10">
            <StatTile label={t('dashboard.stats.total')} value={stats.total} />
            <StatTile label={t('dashboard.stats.active')} value={stats.active} accent="#1B2A4E" />
            <StatTile
              label={t('dashboard.stats.next_deadline')}
              value={stats.nextDeadline ? fmtDate(stats.nextDeadline.app.deadline) : t('dashboard.stats.no_deadline')}
              small={!stats.nextDeadline}
              accent={stats.nextDeadline && stats.nextDeadline.days <= 7 ? '#9C4A2C' : undefined}
            />
            <StatTile
              label={t('dashboard.stats.outreach_sent')}
              value={stats.sent}
              hint={stats.sent > 0 ? `${stats.replied} ${t('dashboard.stats.outreach_replied')}` : undefined}
            />
          </section>

          {/* MAIN GRID ──────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
            {/* Pipeline */}
            <section className="lg:col-span-7 pi-card">
              <div className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-muted mb-5">
                ◈ {t('dashboard.pipeline_title')}
              </div>
              <PipelineBars byColumn={stats.byColumn} total={stats.total} t={t} />
            </section>

            {/* Outreach + interview rings */}
            <section className="lg:col-span-5 grid grid-cols-2 gap-6">
              <RingCard
                label={t('dashboard.reply_rate')}
                pct={stats.replyRate}
                center={`${stats.replyRate}%`}
                sub={`${stats.replied}/${stats.sent}`}
                color="#5F7257"
              />
              <RingCard
                label={t('dashboard.stats.avg_score')}
                pct={stats.avgScore ?? 0}
                center={stats.avgScore != null ? `${stats.avgScore}` : '—'}
                sub={stats.bestScore != null ? `${t('dashboard.stats.best')} ${stats.bestScore}` : `${stats.interviews} ${t('dashboard.stats.interviews')}`}
                color="#1B2A4E"
              />
            </section>
          </div>

          {/* DEADLINES + ACTIVITY ───────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
            {/* Deadlines */}
            <section className="lg:col-span-6 pi-card">
              <div className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-muted mb-4">
                ⌖ {t('dashboard.deadlines_title')}
              </div>
              {stats.deadlines.length === 0 ? (
                <p className="font-display-italic text-muted text-sm">{t('dashboard.deadlines_empty')}</p>
              ) : (
                <ul className="space-y-3">
                  {stats.deadlines.slice(0, 5).map(({ app, days }) => {
                    const prog = progMap[app.programmeId];
                    const pi = app.piId ? piMap[app.piId] : null;
                    const urgent = days <= 7;
                    return (
                      <li key={app.id} className="flex items-center gap-4">
                        <div className={`shrink-0 w-14 text-center ${urgent ? 'text-sienna' : 'text-ink2'}`}>
                          <div className="font-display text-2xl leading-none">{days}</div>
                          <div className="font-mono text-[9px] tracking-wider uppercase text-muted mt-0.5">
                            {days === 0 ? t('dashboard.today') : t('dashboard.days_left', { n: days }).replace(/\d+\s*/, '')}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 border-s border-rule ps-4">
                          <div className="font-display text-[15px] text-ink leading-tight truncate">
                            {pi?.name || prog?.name || '—'}
                          </div>
                          <div className="font-mono text-[10px] tracking-wider uppercase text-muted">
                            {prog?.institution?.short_name} · {fmtDate(app.deadline)}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Activity */}
            <section className="lg:col-span-6 pi-card">
              <div className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-muted mb-4">
                ◦ {t('dashboard.activity_title')}
              </div>
              {activity.length === 0 ? (
                <p className="font-display-italic text-muted text-sm">{t('dashboard.activity_empty')}</p>
              ) : (
                <ul className="space-y-2.5">
                  {activity.map((item, i) => (
                    <li key={i} className="flex items-baseline gap-3 text-sm">
                      <span className="font-mono text-[9px] text-muted shrink-0 w-10">{fmtDate(item.at)}</span>
                      <span className="shrink-0 text-muted">{glyph(item.type)}</span>
                      <span className="flex-1 min-w-0 truncate text-ink2">{item.title}</span>
                      <span className="font-mono text-[9px] tracking-wider uppercase text-muted shrink-0">{item.tag}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* QUICK ACTIONS ──────────────────────────────── */}
          <section className="mb-20">
            <div className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-muted mb-4">
              ✦ {t('dashboard.quick_title')}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <QuickLink to="/match" label={t('dashboard.quick.match')} />
              <QuickLink to="/labs" label={t('dashboard.quick.labs')} />
              <QuickLink to="/outreach" label={t('dashboard.quick.outreach')} />
              <QuickLink to="/interview" label={t('dashboard.quick.interview')} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// ── Components ────────────────────────────────────────────
function StatTile({ label, value, hint, accent, small }) {
  return (
    <div className="bg-paper p-5 lg:p-6">
      <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted mb-2">{label}</div>
      <div
        className={`font-display leading-none ${small ? 'text-xl' : 'text-4xl lg:text-5xl'}`}
        style={{ color: accent || '#1A1814' }}
      >
        {value}
      </div>
      {hint && <div className="font-mono text-[10px] tracking-wider uppercase text-sage mt-2">{hint}</div>}
    </div>
  );
}

function PipelineBars({ byColumn, total, t }) {
  const max = Math.max(1, ...Object.values(byColumn));
  return (
    <div className="space-y-3">
      {COLUMNS.map((c) => {
        const n = byColumn[c] || 0;
        const pct = (n / max) * 100;
        return (
          <div key={c} className="flex items-center gap-3">
            <div className="w-24 lg:w-28 shrink-0 font-mono text-[10.5px] tracking-wider uppercase text-muted text-end">
              {t(`tracker.columns.${c}`)}
            </div>
            <div className="flex-1 h-7 bg-paper2/60 rounded-sm overflow-hidden relative">
              <div
                className="h-full rounded-sm transition-all duration-700"
                style={{ width: `${pct}%`, background: COLUMN_TONE[c], opacity: n ? 1 : 0 }}
              />
            </div>
            <div className="w-7 shrink-0 font-display text-lg text-ink text-center">{n}</div>
          </div>
        );
      })}
    </div>
  );
}

function RingCard({ label, pct, center, sub, color }) {
  const r = 30, circ = 2 * Math.PI * r;
  const off = circ - (Math.min(100, Math.max(0, pct)) / 100) * circ;
  return (
    <div className="pi-card flex flex-col items-center justify-center text-center py-6">
      <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted mb-3">{label}</div>
      <div className="relative w-[84px] h-[84px]">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#E5DDCB" strokeWidth="6" />
          <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={off}
            style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-display text-2xl text-ink">
          {center}
        </div>
      </div>
      {sub && <div className="font-mono text-[10px] tracking-wider uppercase text-muted mt-3">{sub}</div>}
    </div>
  );
}

function QuickLink({ to, label }) {
  return (
    <Link
      to={to}
      className="group border border-rule bg-paper hover:border-ink hover:bg-ink transition-colors rounded-sm p-4 flex items-center justify-between"
    >
      <span className="font-display text-[15px] text-ink group-hover:text-paper transition-colors">{label}</span>
      <span className="text-muted group-hover:text-paper transition-colors">→</span>
    </Link>
  );
}

function EmptyState({ t }) {
  return (
    <div className="border border-dashed border-rule rounded-sm p-12 lg:p-16 text-center max-w-2xl mx-auto">
      <div className="font-display text-5xl text-muted/40 mb-4">◷</div>
      <h2 className="font-display text-2xl text-ink mb-2">{t('dashboard.empty_title')}</h2>
      <p className="text-ink2 leading-relaxed mb-6 text-pretty">{t('dashboard.empty_body')}</p>
      <Link to="/" className="btn-primary inline-flex">{t('dashboard.empty_cta')} →</Link>
    </div>
  );
}

function glyph(type) {
  return type === 'app' ? '◈' : type === 'outreach' ? '✉' : '✺';
}
