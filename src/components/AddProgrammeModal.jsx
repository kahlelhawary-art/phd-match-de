import { useState, useMemo } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { COLUMNS } from '../lib/tracker.js';

/**
 * Modal for adding a programme to the tracker.
 * Searches across all known programmes; lets user pick the starting column.
 */
export default function AddProgrammeModal({ programmes, existingProgrammeIds, onAdd, onClose }) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState('');
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [targetColumn, setTargetColumn] = useState('interested');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programmes.filter((p) => {
      const hay = [
        p.name, p.short_name,
        p.institution?.name, p.institution?.short_name, p.institution?.city,
      ].filter(Boolean).join(' ').toLowerCase();
      if (q && !hay.includes(q)) return false;
      return true;
    });
  }, [programmes, query]);

  const handleAdd = () => {
    if (!selectedProgramme) return;
    onAdd({ programmeId: selectedProgramme.id, status: targetColumn });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 flex items-start sm:items-center justify-center p-4 sm:p-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-paper border border-ink max-w-2xl w-full my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-baseline justify-between p-5 border-b border-rule">
          <h2 className="font-display text-xl text-ink">
            {t('tracker.add.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-muted hover:text-ink leading-none"
          >
            ×
          </button>
        </header>

        {/* Search */}
        <div className="p-5 border-b border-rule">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('tracker.add.search')}
            autoFocus
            className="input-editorial font-display text-lg"
          />
        </div>

        {/* Results */}
        <div className="max-h-[40vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center font-display-italic text-muted">
              {t('tracker.add.empty')}
            </div>
          ) : (
            <ul>
              {filtered.map((p) => {
                const alreadyIn = existingProgrammeIds.includes(p.id);
                const isSelected = selectedProgramme?.id === p.id;
                return (
                  <li
                    key={p.id}
                    className={[
                      'border-b border-rule last:border-b-0',
                      alreadyIn ? 'opacity-50' : '',
                    ].join(' ')}
                  >
                    <button
                      disabled={alreadyIn}
                      onClick={() => setSelectedProgramme(p)}
                      className={[
                        'w-full text-start px-5 py-3 transition-colors',
                        isSelected ? 'bg-ink text-paper'
                        : alreadyIn ? 'cursor-not-allowed'
                        : 'hover:bg-paper2/60',
                      ].join(' ')}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className={`font-mono text-[10.5px] tracking-[0.15em] uppercase ${isSelected ? 'text-paper/70' : 'text-muted'} mb-0.5`}>
                            {p.institution?.short_name} · {p.institution?.city}
                          </div>
                          <div className="font-display text-base leading-tight">
                            {p.name}
                          </div>
                        </div>
                        {alreadyIn && (
                          <span className="font-mono text-[10px] tracking-wider uppercase text-muted shrink-0">
                            ✓ {t('tracker.add.already_added')}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Column selector + actions */}
        {selectedProgramme && (
          <div className="border-t-2 border-ink p-5">
            <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted mb-3">
              {t('tracker.add.add_to')}
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {COLUMNS.map((c) => (
                <button
                  key={c}
                  onClick={() => setTargetColumn(c)}
                  className={targetColumn === c ? 'tag tag-active' : 'tag hover:border-ink'}
                >
                  {t(`tracker.columns.${c}`)}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="btn-ghost"
              >
                {t('tracker.add.cancel')}
              </button>
              <button
                onClick={handleAdd}
                className="btn-primary"
              >
                + {t('tracker.add.button')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

