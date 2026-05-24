import { useState, useMemo } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { COLUMNS } from '../lib/tracker.js';
import { pis as allPis } from '../data/pis.js';
import { buildIcs, downloadIcs } from '../lib/ics.js';

/**
 * One application card inside a Kanban column.
 * Expanded view shows next-step editor, notes textarea, and full actions.
 */
export default function TrackerCard({ app, programme, onUpdate, onRemove, onMove }) {
  const { t, isRtl } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [editingAction, setEditingAction] = useState(false);
  const [actionText, setActionText] = useState(app.nextAction ?? '');
  const [actionDate, setActionDate] = useState(app.nextActionDate ?? '');
  const [notesDraft, setNotesDraft] = useState(app.notes ?? '');
  const [notesDirty, setNotesDirty] = useState(false);

  // Resolve PI if present
  const pi = useMemo(
    () => (app.piId ? allPis.find((p) => p.id === app.piId) : null),
    [app.piId]
  );

  const colIdx = COLUMNS.indexOf(app.status);
  const canBack = colIdx > 0;
  const canForward = colIdx < COLUMNS.length - 1;

  const handleSaveAction = () => {
    onUpdate(app.id, {
      nextAction: actionText.trim() || null,
      nextActionDate: actionDate || null,
    });
    setEditingAction(false);
  };

  const handleSaveNotes = () => {
    onUpdate(app.id, { notes: notesDraft });
    setNotesDirty(false);
  };

  const handleAddToCalendar = () => {
    const title = pi
      ? `${pi.name} — ${programme.short_name ?? programme.name}`
      : programme.short_name ?? programme.name;
    const ics = buildIcs([{
      summary: title,
      dateStr: app.nextActionDate,
      description: app.nextAction ?? '',
      url: programme.website ?? '',
    }]);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    downloadIcs(ics, `${slug}-deadline.ics`);
  };

  const handleRemove = () => {
    if (window.confirm(t('tracker.card.confirm_remove'))) {
      onRemove(app.id);
    }
  };

  if (!programme) {
    return (
      <div className="border border-rule p-3 bg-paper2/30">
        <p className="text-xs text-muted font-mono">missing programme</p>
      </div>
    );
  }

  const fitTone = !app.fit ? 'text-muted'
    : app.fit >= 85 ? 'text-sage'
    : app.fit >= 70 ? 'text-navy'
    : app.fit >= 55 ? 'text-ochre'
    : 'text-muted';

  return (
    <article className="border border-rule bg-paper hover:border-ink transition-colors duration-300">
      {/* Compact header */}
      <header
        onClick={() => setExpanded((v) => !v)}
        className="cursor-pointer p-4"
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted truncate">
            {programme.institution?.short_name} · {programme.institution?.city}
          </span>
          {app.fit !== null && app.fit !== undefined && (
            <span className={`font-display text-base leading-none shrink-0 ${fitTone}`}>
              {app.fit}
            </span>
          )}
        </div>

        <h3 className="font-display text-[15.5px] text-ink leading-[1.2] mb-1 text-balance">
          {programme.name}
        </h3>

        {pi && (
          <div className="font-display-italic text-[12.5px] text-sienna mb-2">
            ✦ {pi.name}
          </div>
        )}

        {/* Next action preview */}
        {app.nextAction && !expanded && (
          <div className="flex items-baseline gap-2 mt-2 pt-2 border-t border-rule">
            <span className="font-mono text-[9.5px] tracking-wider uppercase text-sienna">
              →
            </span>
            <span className="text-xs text-ink2 leading-snug line-clamp-2 flex-1">
              {app.nextAction}
              {app.nextActionDate && (
                <span className="text-muted ms-1.5">· {formatDate(app.nextActionDate)}</span>
              )}
            </span>
          </div>
        )}

        {/* Source badge */}
        {app.source === 'match' && !expanded && (
          <div className="font-mono text-[9px] tracking-wider uppercase text-sienna/70 mt-2">
            ✦ {t('tracker.card.added_from_match')}
          </div>
        )}
      </header>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-rule">
          {/* Next-action block */}
          <div className="p-4 border-b border-rule">
            <div className="font-mono text-[10px] tracking-wider uppercase text-muted mb-2">
              → {t('tracker.card.next_action')}
            </div>

            {editingAction ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder={t('tracker.card.action_label')}
                  className="input-editorial text-sm py-1.5"
                />
                <input
                  type="date"
                  value={actionDate}
                  onChange={(e) => setActionDate(e.target.value)}
                  className="input-editorial text-sm py-1.5"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAction}
                    className="px-3 py-1 text-xs bg-ink text-paper hover:bg-navy transition-colors"
                  >
                    {t('tracker.card.save')}
                  </button>
                  <button
                    onClick={() => { setEditingAction(false); setActionText(app.nextAction ?? ''); setActionDate(app.nextActionDate ?? ''); }}
                    className="px-3 py-1 text-xs border border-rule text-ink2 hover:border-ink"
                  >
                    {t('tracker.card.cancel')}
                  </button>
                </div>
              </div>
            ) : app.nextAction ? (
              <div>
                <p className="text-sm text-ink2 leading-relaxed">{app.nextAction}</p>
                {app.nextActionDate && (
                  <p className="font-mono text-[11px] text-sienna mt-1">
                    {formatDate(app.nextActionDate)}
                  </p>
                )}
                <button
                  onClick={() => setEditingAction(true)}
                  className="mt-2 text-xs text-navy hover:text-sienna underline underline-offset-2"
                >
                  {t('tracker.card.edit')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingAction(true)}
                className="text-xs text-navy hover:text-sienna underline underline-offset-2"
              >
                + {t('tracker.card.set_action')}
              </button>
            )}
          </div>

          {/* Notes block */}
          <div className="p-4 border-b border-rule">
            <div className="font-mono text-[10px] tracking-wider uppercase text-muted mb-2">
              ✎ {t('tracker.card.notes')}
            </div>
            <textarea
              value={notesDraft}
              onChange={(e) => { setNotesDraft(e.target.value); setNotesDirty(true); }}
              placeholder={t('tracker.card.add_note')}
              rows={3}
              className="textarea-editorial text-sm"
            />
            {notesDirty && (
              <button
                onClick={handleSaveNotes}
                className="mt-2 text-xs px-3 py-1 bg-ink text-paper hover:bg-navy transition-colors"
              >
                {t('tracker.card.save_note')}
              </button>
            )}
          </div>

          {/* Actions */}
          <footer className="p-4 flex items-center justify-between gap-2">
            <div className="flex gap-1">
              <button
                onClick={() => onMove(app.id, -1)}
                disabled={!canBack}
                title={t('tracker.card.move_back')}
                className="w-7 h-7 inline-flex items-center justify-center border border-rule text-ink2 hover:border-ink hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isRtl ? '→' : '←'}
              </button>
              <button
                onClick={() => onMove(app.id, +1)}
                disabled={!canForward}
                title={t('tracker.card.move_forward')}
                className="w-7 h-7 inline-flex items-center justify-center border border-rule text-ink2 hover:border-ink hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isRtl ? '←' : '→'}
              </button>
            </div>

            <div className="flex gap-2">
              {programme.website && (
                <a
                  href={programme.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-navy hover:text-sienna underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('tracker.card.open_programme')} ↗
                </a>
              )}
              {app.nextActionDate && (
                <button
                  onClick={handleAddToCalendar}
                  title="Add deadline to calendar"
                  className="text-xs text-navy hover:text-sienna underline underline-offset-2"
                >
                  ⊕ Cal
                </button>
              )}
              <button
                onClick={handleRemove}
                className="text-xs text-muted hover:text-danger transition-colors"
                title={t('tracker.card.remove')}
              >
                ✕
              </button>
            </div>
          </footer>
        </div>
      )}
    </article>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

