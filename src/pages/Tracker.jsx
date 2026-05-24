import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n.jsx';
import { useTracker, COLUMNS } from '../lib/tracker.js';
import { programmesWithInstitutions } from '../data/seed.js';
import { supabase, hasSupabase } from '../lib/supabase.js';
import { buildIcs, downloadIcs } from '../lib/ics.js';
import TrackerCard from '../components/TrackerCard.jsx';
import AddProgrammeModal from '../components/AddProgrammeModal.jsx';

export default function Tracker() {
  const { t } = useI18n();
  const { apps, add, update, remove, move } = useTracker();

  // Programmes catalogue (Supabase or seed fallback)
  const [programmes, setProgrammes] = useState(programmesWithInstitutions);

  useEffect(() => {
    if (!hasSupabase) return;
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from('programmes')
        .select('*, institution:institutions(*)');
      if (alive && !error && data?.length) setProgrammes(data);
    })();
    return () => { alive = false; };
  }, []);

  const programmeMap = useMemo(() => {
    return Object.fromEntries(programmes.map((p) => [p.id, p]));
  }, [programmes]);

  // Group apps by column
  const grouped = useMemo(() => {
    const g = Object.fromEntries(COLUMNS.map((c) => [c, []]));
    apps.forEach((a) => {
      if (g[a.status]) g[a.status].push(a);
    });
    // Sort within column: most recently updated first
    Object.values(g).forEach((col) =>
      col.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
    );
    return g;
  }, [apps]);

  // Stats
  const stats = useMemo(() => {
    const total = apps.length;
    const active = apps.filter((a) => a.status !== 'decision').length;

    const upcomingDates = apps
      .map((a) => a.nextActionDate)
      .filter(Boolean)
      .filter((d) => new Date(d) >= new Date(new Date().toDateString()))
      .sort();
    const nextDeadline = upcomingDates[0] ?? null;

    return { total, active, nextDeadline };
  }, [apps]);

  // Add modal
  const [showAdd, setShowAdd] = useState(false);

  // Calendar sync all deadlines
  const handleSyncAll = () => {
    const events = apps
      .filter((a) => a.nextActionDate)
      .map((a) => {
        const prog = programmeMap[a.programmeId];
        const title = prog
          ? `${prog.short_name ?? prog.name}${a.piId ? '' : ''} — Deadline`
          : 'PhD Deadline';
        return {
          summary: title,
          dateStr: a.nextActionDate,
          description: a.nextAction ?? '',
          url: prog?.website ?? '',
        };
      });

    if (events.length === 0) return;
    const ics = buildIcs(events);
    downloadIcs(ics, 'phd-deadlines.ics');
  };

  // Empty state
  if (apps.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
        <Hero />
        <EmptyState onAdd={() => setShowAdd(true)} />
        {showAdd && (
          <AddProgrammeModal
            programmes={programmes}
            existingProgrammeIds={apps.map((a) => a.programmeId)}
            onAdd={(input) => add(input)}
            onClose={() => setShowAdd(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
      <Hero />

      {/* STATS BAR ──────────────────────────────────────── */}
      <section className="grid grid-cols-3 gap-px bg-rule border border-rule mb-10">
        <Stat label={t('tracker.stats.total')} value={stats.total} />
        <Stat label={t('tracker.stats.active')} value={stats.active} />
        <Stat
          label={t('tracker.stats.next_deadline')}
          value={stats.nextDeadline ? formatDate(stats.nextDeadline) : t('tracker.stats.no_deadlines')}
          isText={!stats.nextDeadline || true}
        />
      </section>

      {/* CONTROLS BAR ───────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="section-marker flex-1">
          <span className="font-mono text-xs tracking-wider text-muted">·</span>
          <h2 className="font-display text-display-md text-ink">
            Pipeline
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {apps.some((a) => a.nextActionDate) && (
            <button
              onClick={handleSyncAll}
              title="Download all deadlines as .ics"
              className="btn-ghost text-sm"
            >
              ⊕ Sync All
            </button>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary text-sm"
          >
            + {t('tracker.add.button')}
          </button>
        </div>
      </div>

      {/* KANBAN BOARD ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-3">
        {COLUMNS.map((col, i) => (
          <Column
            key={col}
            col={col}
            index={i}
            apps={grouped[col]}
            programmeMap={programmeMap}
            onUpdate={update}
            onRemove={remove}
            onMove={move}
          />
        ))}
      </div>

      {showAdd && (
        <AddProgrammeModal
          programmes={programmes}
          existingProgrammeIds={apps.map((a) => a.programmeId)}
          onAdd={(input) => add(input)}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════

function Hero() {
  const { t } = useI18n();
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 lg:mb-16 animate-fade-up">
      <div className="lg:col-span-8">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sienna mb-4">
          ❦ {t('tracker.hero_eyebrow')}
        </div>
        <h1 className="font-display text-display-lg text-ink text-balance leading-[0.95]">
          {t('tracker.hero_title')}
        </h1>
      </div>

      <div className="lg:col-span-4 lg:pt-6 lg:border-l lg:border-rule lg:pl-8">
        <p className="text-base leading-relaxed text-ink2 dropcap text-pretty">
          {t('tracker.hero_lead')}
        </p>
      </div>
    </section>
  );
}

function Stat({ label, value, isText }) {
  return (
    <div className="bg-paper p-5 lg:p-6">
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted mb-2">
        {label}
      </div>
      <div className={isText ? 'font-display text-xl lg:text-2xl text-ink leading-tight' : 'font-display text-4xl lg:text-5xl text-ink leading-none'}>
        {value}
      </div>
    </div>
  );
}

function Column({ col, index, apps, programmeMap, onUpdate, onRemove, onMove }) {
  const { t } = useI18n();
  const tone = ['text-muted', 'text-ochre', 'text-navy', 'text-sienna', 'text-sage'][index];

  return (
    <section className="flex flex-col">
      {/* Column header */}
      <header className="mb-4 pb-3 border-b-2 border-ink">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg text-ink leading-none">
            <span className={`font-mono text-[10px] tracking-[0.18em] uppercase ${tone} me-2`}>
              {String(index + 1).padStart(2, '0')}
            </span>
            {t(`tracker.columns.${col}`)}
          </h3>
          <span className="font-mono text-[11px] text-muted">
            {apps.length}
          </span>
        </div>
        <p className="font-display-italic text-[12.5px] text-muted leading-snug mt-1.5">
          {t(`tracker.column_hints.${col}`)}
        </p>
      </header>

      {/* Cards */}
      <div className="flex-1 space-y-3">
        {apps.length === 0 ? (
          <div className="border border-dashed border-rule p-6 text-center font-display-italic text-muted text-sm">
            — {t('tracker.column_empty')} —
          </div>
        ) : (
          apps.map((a, i) => (
            <div
              key={a.id}
              className="animate-fade-up opacity-0"
              style={{ animationDelay: `${Math.min(i, 5) * 50}ms` }}
            >
              <TrackerCard
                app={a}
                programme={programmeMap[a.programmeId]}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onMove={onMove}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function EmptyState({ onAdd }) {
  const { t } = useI18n();
  return (
    <div className="border border-rule p-12 lg:p-20 text-center max-w-3xl mx-auto bg-paper2/30">
      <div className="font-display text-5xl text-sienna mb-4">∅</div>
      <h2 className="font-display text-3xl text-ink mb-3 text-balance">
        {t('tracker.empty.title')}
      </h2>
      <p className="text-ink2 leading-relaxed max-w-md mx-auto mb-8">
        {t('tracker.empty.body')}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={onAdd} className="btn-primary">
          + {t('tracker.add.button')}
        </button>
        <Link to="/match" className="btn-ghost">
          {t('tracker.empty.go_match')} →
        </Link>
        <Link to="/" className="btn-link text-sm self-center">
          {t('tracker.empty.go_discover')}
        </Link>
      </div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
  } catch {
    return iso;
  }
}

