import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../lib/i18n.jsx';
import { useProfile } from '../lib/profile.js';
import { digestPaper } from '../lib/paperDigest.js';

const CV_RESULTS_KEY = 'phd-match-cv-results';
const CV_DRAFT_KEY = 'phd-match-cv-draft';

function readMatchProfile() {
  try {
    const r = JSON.parse(localStorage.getItem(CV_RESULTS_KEY));
    return r?.profile ?? null;
  } catch { return null; }
}

export default function Digest() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { profile } = useProfile();

  const matchProfile = useMemo(readMatchProfile, []);
  const cvText = useMemo(
    () => profile?.cv_text || localStorage.getItem(CV_DRAFT_KEY) || '',
    [profile]
  );
  const hasProfile = Boolean(matchProfile || cvText.trim().length > 30);

  // Prefill from Labs ("read paper" button)
  const prefill = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('phd-match-digest-prefill');
      if (!raw) return null;
      sessionStorage.removeItem('phd-match-digest-prefill');
      return JSON.parse(raw);
    } catch { return null; }
  }, []);

  const [paperText, setPaperText] = useState('');
  const [piName, setPiName] = useState(prefill?.piName ?? '');
  const [labFocus, setLabFocus] = useState(prefill?.labFocus ?? '');
  const [docLang, setDocLang] = useState(lang === 'ar' ? 'en' : lang);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setLoading(true); setError(null);
    try {
      const res = await digestPaper({
        paperText, piName, labFocus,
        profile: matchProfile, cvText, language: docLang,
      });
      setResult(res);
    } catch (err) {
      setError(t('digest.error'));
    } finally {
      setLoading(false);
    }
  };

  const copyHook = () => {
    if (!result?.outreach_hook) return;
    navigator.clipboard?.writeText(result.outreach_hook);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const useInOutreach = () => {
    try {
      sessionStorage.setItem('phd-match-outreach-prefill', JSON.stringify({
        piName,
        labFocus,
        paperHook: result?.outreach_hook || '',
      }));
    } catch { /* ignore */ }
    navigate('/outreach');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
      {/* HERO */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 animate-fade-up">
        <div className="lg:col-span-8">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sienna mb-4">
            ◐ {t('digest.hero_eyebrow')}
          </div>
          <h1 className="font-display text-display-lg text-ink text-balance leading-[0.95]">
            {t('digest.hero_title')}
          </h1>
        </div>
        <div className="lg:col-span-4 lg:pt-6 lg:border-l lg:border-rule lg:pl-8">
          <p className="text-base leading-relaxed text-ink2 dropcap text-pretty">
            {t('digest.hero_lead')}
          </p>
        </div>
      </section>

      {/* INPUT */}
      <section className="border border-rule rounded-sm p-5 lg:p-6 mb-8 bg-paper2/30 space-y-5">
        <div>
          <label className="font-mono text-[10px] tracking-wider uppercase text-muted block mb-2">
            {t('digest.paper_label')}
          </label>
          <textarea
            value={paperText}
            onChange={(e) => setPaperText(e.target.value)}
            placeholder={t('digest.paper_placeholder')}
            rows={7}
            className="textarea-editorial text-sm"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <label className="font-mono text-[10px] tracking-wider uppercase text-muted block mb-2">
              {t('digest.pi_label')}
            </label>
            <input
              type="text" value={piName}
              onChange={(e) => setPiName(e.target.value)}
              className="input-editorial"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-wider uppercase text-muted block mb-2">
              {t('digest.focus_label')}
            </label>
            <input
              type="text" value={labFocus}
              onChange={(e) => setLabFocus(e.target.value)}
              className="input-editorial"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <label className="font-mono text-[10px] tracking-wider uppercase text-muted block mb-2">
              {t('digest.language_label')}
            </label>
            <div className="flex gap-2">
              {['de', 'en'].map((l) => (
                <button
                  key={l}
                  onClick={() => setDocLang(l)}
                  className={[
                    'px-4 py-2 text-sm border rounded-sm transition-colors',
                    docLang === l ? 'bg-ink text-paper border-ink' : 'border-rule text-ink2 hover:border-ink',
                  ].join(' ')}
                >
                  {l === 'de' ? 'Deutsch' : 'English'}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={run}
            disabled={loading || paperText.trim().length < 40}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? t('digest.analyzing') : (result ? t('digest.reanalyze') : t('digest.analyze'))}
          </button>
        </div>

        {!hasProfile && (
          <p className="font-display-italic text-[12.5px] text-muted leading-snug">
            💡 {t('digest.no_profile_note')}
          </p>
        )}
      </section>

      {error && (
        <div className="border-s-2 border-sienna bg-sienna/5 px-4 py-3 text-sm text-sienna mb-8">{error}</div>
      )}

      {/* RESULT */}
      {result && (
        <section className="space-y-6 mb-20 animate-fade-up">
          {/* Summary */}
          <Block label={t('digest.result.summary')} mark="❦">
            <p className="text-[15px] leading-relaxed text-ink2 text-pretty">{result.summary}</p>
          </Block>

          {/* Findings + Methods side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {result.key_findings?.length > 0 && (
              <Block label={t('digest.result.findings')} mark="◈">
                <ul className="space-y-2">
                  {result.key_findings.map((f, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-ink2">
                      <span className="text-sage mt-0.5 shrink-0">✓</span>
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            )}
            {result.methods?.length > 0 && (
              <Block label={t('digest.result.methods')} mark="◊">
                <div className="flex flex-wrap gap-2">
                  {result.methods.map((m, i) => (
                    <span key={i} className="tag">{m}</span>
                  ))}
                </div>
              </Block>
            )}
          </div>

          {/* Connections — the heart of the tool */}
          {result.connections?.length > 0 && (
            <Block label={t('digest.result.connections')} mark="✦" accent>
              <ul className="space-y-4">
                {result.connections.map((c, i) => (
                  <li key={i} className="border-s-2 border-sienna ps-4">
                    <div className="font-display text-[15px] text-ink mb-0.5">{c.point}</div>
                    <p className="text-sm text-ink2 leading-relaxed text-pretty">{c.detail}</p>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {/* Outreach hook */}
          {result.outreach_hook && (
            <div className="border border-navy/25 bg-navy/[0.03] rounded-sm p-5 lg:p-6">
              <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-navy mb-3">
                ✉ {t('digest.result.hook')}
              </div>
              <p className="font-display-italic text-[16px] text-ink leading-relaxed mb-5 text-pretty">
                "{result.outreach_hook}"
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={useInOutreach} className="btn-primary text-sm">
                  {t('digest.use_in_outreach')} →
                </button>
                <button onClick={copyHook} className="btn-ghost text-sm">
                  {copied ? t('digest.copied') : t('digest.copy_hook')}
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Block({ label, mark, accent, children }) {
  return (
    <div className={`border rounded-sm p-5 lg:p-6 ${accent ? 'border-sienna/30 bg-sienna/[0.03]' : 'border-rule bg-paper'}`}>
      <div className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-muted mb-4">
        {mark} {label}
      </div>
      {children}
    </div>
  );
}
