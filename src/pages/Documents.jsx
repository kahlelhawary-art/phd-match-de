import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n.jsx';
import { useProfile } from '../lib/profile.js';
import { programmesWithInstitutions } from '../data/seed.js';
import { generateResearchStatement, generateAcademicCv } from '../lib/documents.js';

const CV_RESULTS_KEY = 'phd-match-cv-results';
const CV_DRAFT_KEY = 'phd-match-cv-draft';

function readMatchProfile() {
  try {
    const r = JSON.parse(localStorage.getItem(CV_RESULTS_KEY));
    return r?.profile ?? null;
  } catch { return null; }
}

export default function Documents() {
  const { t, lang } = useI18n();
  const { profile } = useProfile();

  const matchProfile = useMemo(readMatchProfile, []);
  const cvText = useMemo(
    () => profile?.cv_text || localStorage.getItem(CV_DRAFT_KEY) || '',
    [profile]
  );
  const hasSource = Boolean(matchProfile || cvText.trim().length > 30);

  const [programmeId, setProgrammeId] = useState('');
  const [docLang, setDocLang] = useState(lang === 'ar' ? 'de' : lang);
  const [notes, setNotes] = useState('');

  // Per-type state: { research: {...}, cv: {...} }
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(null);

  const programme = useMemo(
    () => programmesWithInstitutions.find((p) => p.id === programmeId) || null,
    [programmeId]
  );

  const run = async (type) => {
    setLoading((l) => ({ ...l, [type]: true }));
    setErrors((e) => ({ ...e, [type]: null }));
    try {
      const args = {
        programme,
        profile: matchProfile,
        cvText,
        language: docLang,
        extraNotes: notes,
      };
      const res = type === 'research'
        ? await generateResearchStatement(args)
        : await generateAcademicCv(args);
      setResults((r) => ({ ...r, [type]: res }));
    } catch (err) {
      setErrors((e) => ({ ...e, [type]: t('documents.error') }));
    } finally {
      setLoading((l) => ({ ...l, [type]: false }));
    }
  };

  const textOf = (type, res) => {
    if (type === 'research') return `${res.title}\n\n${res.body}`;
    // cv
    return (res.sections || [])
      .map((s) => `${s.heading}\n${'─'.repeat(s.heading.length)}\n` +
        (s.entries || []).map((e) => `${e.left}\t${e.right}`).join('\n'))
      .join('\n\n');
  };

  const copy = (type, res) => {
    navigator.clipboard?.writeText(textOf(type, res));
    setCopied(type);
    setTimeout(() => setCopied(null), 1600);
  };

  const download = (type, res) => {
    const blob = new Blob([textOf(type, res)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type === 'research' ? 'research-statement' : 'academic-cv'}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
      {/* HERO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 animate-fade-up">
        <div className="lg:col-span-8">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sienna mb-4">
            ❦ {t('documents.hero_eyebrow')}
          </div>
          <h1 className="font-display text-display-lg text-ink text-balance leading-[0.95]">
            {t('documents.hero_title')}
          </h1>
        </div>
        <div className="lg:col-span-4 lg:pt-6 lg:border-l lg:border-rule lg:pl-8">
          <p className="text-base leading-relaxed text-ink2 dropcap text-pretty">
            {t('documents.hero_lead')}
          </p>
        </div>
      </section>

      {!hasSource ? (
        <div className="border border-dashed border-rule rounded-sm p-12 lg:p-16 text-center max-w-2xl mx-auto">
          <div className="font-display text-5xl text-muted/40 mb-4">◷</div>
          <h2 className="font-display text-2xl text-ink mb-2">{t('documents.no_profile_title')}</h2>
          <p className="text-ink2 leading-relaxed mb-6 text-pretty">{t('documents.no_profile_body')}</p>
          <Link to="/profile" className="btn-primary inline-flex">{t('documents.no_profile_cta')} →</Link>
        </div>
      ) : (
        <>
          {/* CONFIG BAR */}
          <section className="border border-rule rounded-sm p-5 lg:p-6 mb-10 bg-paper2/30 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className="font-mono text-[10px] tracking-wider uppercase text-muted block mb-2">
                  {t('documents.select_programme')}
                </label>
                <select
                  value={programmeId}
                  onChange={(e) => setProgrammeId(e.target.value)}
                  className="input-editorial"
                >
                  <option value="">{t('documents.select_placeholder')}</option>
                  {programmesWithInstitutions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.institution?.short_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-wider uppercase text-muted block mb-2">
                  {t('documents.language_label')}
                </label>
                <div className="flex gap-2">
                  {['de', 'en'].map((l) => (
                    <button
                      key={l}
                      onClick={() => setDocLang(l)}
                      className={[
                        'px-4 py-2 text-sm border rounded-sm transition-colors flex-1',
                        docLang === l ? 'bg-ink text-paper border-ink' : 'border-rule text-ink2 hover:border-ink',
                      ].join(' ')}
                    >
                      {l === 'de' ? 'Deutsch' : 'English'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-wider uppercase text-muted block mb-2">
                {t('documents.notes_label')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('documents.notes_placeholder')}
                rows={2}
                className="textarea-editorial text-sm"
              />
            </div>
          </section>

          {/* KIT TYPES */}
          <div className="section-marker">
            <span className="font-mono text-xs tracking-wider text-muted">·</span>
            <h2 className="font-display text-display-md text-ink">{t('documents.kit_title')}</h2>
          </div>

          <div className="space-y-6 mb-20">
            {/* Cover letter — points to Letter page */}
            <article className="border border-rule rounded-sm p-5 lg:p-6 flex items-center gap-5 bg-paper">
              <div className="font-display text-4xl text-sienna/40 shrink-0">✉</div>
              <div className="flex-1">
                <h3 className="font-display text-xl text-ink">{t('documents.types.letter.title')}</h3>
                <p className="text-sm text-muted leading-relaxed">{t('documents.types.letter.desc')}</p>
                <p className="font-display-italic text-[12.5px] text-muted mt-1">{t('documents.letter_hint')}</p>
              </div>
              <Link to="/letter" className="btn-ghost text-sm shrink-0">{t('documents.go_to_letter')} →</Link>
            </article>

            {/* Research statement */}
            <DocBlock
              icon="◈" type="research"
              title={t('documents.types.research.title')}
              desc={t('documents.types.research.desc')}
              loading={loading.research} error={errors.research}
              result={results.research}
              onRun={() => run('research')}
              onCopy={() => copy('research', results.research)}
              onDownload={() => download('research', results.research)}
              copied={copied === 'research'}
              t={t}
              render={(res) => (
                <div>
                  <h4 className="font-display text-lg text-ink mb-3">{res.title}</h4>
                  <pre className="whitespace-pre-wrap font-body text-[14px] leading-relaxed text-ink2">{res.body}</pre>
                </div>
              )}
            />

            {/* Academic CV */}
            <DocBlock
              icon="◊" type="cv"
              title={t('documents.types.cv.title')}
              desc={t('documents.types.cv.desc')}
              loading={loading.cv} error={errors.cv}
              result={results.cv}
              onRun={() => run('cv')}
              onCopy={() => copy('cv', results.cv)}
              onDownload={() => download('cv', results.cv)}
              copied={copied === 'cv'}
              t={t}
              render={(res) => (
                <div className="space-y-6">
                  {(res.sections || []).map((s, i) => (
                    <div key={i}>
                      <div className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-sienna mb-2 pb-1 border-b border-rule">
                        {s.heading}
                      </div>
                      <table className="w-full text-[13.5px]">
                        <tbody>
                          {(s.entries || []).map((e, j) => (
                            <tr key={j} className="align-top">
                              <td className="py-1.5 pe-4 font-mono text-[11px] text-muted whitespace-nowrap w-1/4">{e.left}</td>
                              <td className="py-1.5 text-ink2">{e.right}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}

function DocBlock({ icon, type, title, desc, loading, error, result, onRun, onCopy, onDownload, copied, t, render }) {
  return (
    <article className="border border-rule rounded-sm bg-paper overflow-hidden">
      <div className="p-5 lg:p-6 flex items-center gap-5">
        <div className="font-display text-4xl text-navy/40 shrink-0">{icon}</div>
        <div className="flex-1">
          <h3 className="font-display text-xl text-ink">{title}</h3>
          <p className="text-sm text-muted leading-relaxed">{desc}</p>
        </div>
        <button onClick={onRun} disabled={loading} className="btn-primary text-sm shrink-0 disabled:opacity-50">
          {loading ? t('documents.generating') : (result ? t('documents.regenerate') : t('documents.generate'))}
        </button>
      </div>

      {error && (
        <div className="px-6 pb-5">
          <div className="border-s-2 border-sienna bg-sienna/5 px-4 py-3 text-sm text-sienna">{error}</div>
        </div>
      )}

      {result && (
        <div className="border-t border-rule">
          <div className="flex items-center justify-between px-6 py-3 bg-paper2/40 border-b border-rule">
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted">
              {t('documents.result_title')}
            </span>
            <div className="flex gap-3">
              <button onClick={onCopy} className="font-mono text-[10.5px] tracking-wider uppercase text-navy hover:text-sienna">
                {copied ? t('documents.copied') : t('documents.copy')}
              </button>
              <button onClick={onDownload} className="font-mono text-[10.5px] tracking-wider uppercase text-navy hover:text-sienna">
                ⬇ {t('documents.download')}
              </button>
            </div>
          </div>
          <div className="p-6 lg:p-8 bg-[#FBF8F1]">
            {render(result)}
          </div>
        </div>
      )}
    </article>
  );
}
