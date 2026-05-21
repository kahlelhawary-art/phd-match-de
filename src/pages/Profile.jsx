import { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { useProfile, useAuth, signIn, signUp, signOut, pushToCloud, pullFromCloud, getSyncMeta } from '../lib/profile.js';

const TABS = [
  { key: 'identity', icon: '◐' },
  { key: 'academic', icon: '✦' },
  { key: 'cv', icon: '✎' },
  { key: 'account', icon: '⌖' },
];

export default function Profile() {
  const { t } = useI18n();
  const [tab, setTab] = useState('identity');
  const { profile, update, updateField, reset } = useProfile();

  // Subtle saved toast
  const [savedFlash, setSavedFlash] = useState(false);
  useEffect(() => {
    if (!profile.updated_at) return;
    setSavedFlash(true);
    const tm = setTimeout(() => setSavedFlash(false), 1500);
    return () => clearTimeout(tm);
  }, [profile.updated_at]);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20">
      {/* HERO ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 lg:mb-16 animate-fade-up">
        <div className="lg:col-span-8">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-sienna mb-4">
            ❦ {t('profile.hero_eyebrow')}
          </div>
          <h1 className="font-display text-display-lg text-ink text-balance leading-[0.95]">
            {t('profile.hero_title')}
          </h1>
        </div>

        <div className="lg:col-span-4 lg:pt-6 lg:border-l lg:border-rule lg:pl-8">
          <p className="text-base leading-relaxed text-ink2 dropcap text-pretty">
            {t('profile.hero_lead')}
          </p>
        </div>
      </section>

      {/* TABS ────────────────────────────────────────────── */}
      <nav className="border-y border-rule mb-10 sticky top-[105px] bg-paper/95 backdrop-blur-sm z-30 -mx-6 lg:-mx-12 px-6 lg:px-12">
        <div className="flex overflow-x-auto items-center">
          {TABS.map((tabDef, i) => (
            <button
              key={tabDef.key}
              onClick={() => setTab(tabDef.key)}
              className={[
                'flex items-baseline gap-2 px-4 lg:px-5 py-4 text-sm whitespace-nowrap border-b-2 transition-colors',
                tab === tabDef.key
                  ? 'text-ink border-ink'
                  : 'text-ink2 border-transparent hover:text-ink',
              ].join(' ')}
            >
              <span className="font-mono text-[10px] text-muted">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display-italic me-1">{tabDef.icon}</span>
              <span>{t(`profile.tabs.${tabDef.key}`)}</span>
            </button>
          ))}

          {/* Auto-save indicator on the right */}
          <span className={[
            'ms-auto font-mono text-[10.5px] tracking-wider uppercase transition-opacity',
            savedFlash ? 'opacity-100 text-sage' : 'opacity-50 text-muted',
          ].join(' ')}>
            {savedFlash ? t('profile.saved') : t('profile.auto_save')}
          </span>
        </div>
      </nav>

      {/* TAB CONTENT ─────────────────────────────────────── */}
      <div className="animate-fade-in" key={tab}>
        {tab === 'identity' && <IdentitySection profile={profile} updateField={updateField} />}
        {tab === 'academic' && <AcademicSection profile={profile} updateField={updateField} />}
        {tab === 'cv' && <CvSection profile={profile} update={update} updateField={updateField} />}
        {tab === 'account' && <AccountSection reset={reset} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// IDENTITY
// ═══════════════════════════════════════════════════════════

function IdentitySection({ profile, updateField }) {
  const { t } = useI18n();
  return (
    <div className="max-w-3xl">
      <div className="section-marker">
        <span className="font-mono text-xs tracking-wider text-muted">01.</span>
        <h2 className="font-display text-display-md text-ink">{t('profile.identity.title')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <Field label={t('profile.identity.full_name')}>
          <input
            type="text"
            value={profile.full_name}
            onChange={(e) => updateField('full_name', e.target.value)}
            placeholder={t('profile.identity.full_name_placeholder')}
            className="input-editorial text-base"
          />
        </Field>
        <Field label={t('profile.identity.email')}>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder={t('profile.identity.email_placeholder')}
            className="input-editorial text-base"
          />
        </Field>
        <Field label={t('profile.identity.phone')}>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder={t('profile.identity.phone_placeholder')}
            className="input-editorial text-base"
          />
        </Field>
        <Field label={t('profile.identity.city')}>
          <input
            type="text"
            value={profile.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder={t('profile.identity.city_placeholder')}
            className="input-editorial text-base"
          />
        </Field>
        <Field label={t('profile.identity.linkedin')}>
          <input
            type="url"
            value={profile.linkedin}
            onChange={(e) => updateField('linkedin', e.target.value)}
            placeholder={t('profile.identity.linkedin_placeholder')}
            className="input-editorial text-base"
          />
        </Field>
        <Field label={t('profile.identity.orcid')}>
          <input
            type="text"
            value={profile.orcid}
            onChange={(e) => updateField('orcid', e.target.value)}
            placeholder={t('profile.identity.orcid_placeholder')}
            className="input-editorial text-base font-mono"
          />
        </Field>
        <Field label={t('profile.identity.github')}>
          <input
            type="text"
            value={profile.github}
            onChange={(e) => updateField('github', e.target.value)}
            placeholder="github.com/…"
            className="input-editorial text-base font-mono"
          />
        </Field>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ACADEMIC
// ═══════════════════════════════════════════════════════════

function AcademicSection({ profile, updateField }) {
  const { t } = useI18n();
  return (
    <div className="max-w-3xl">
      <div className="section-marker">
        <span className="font-mono text-xs tracking-wider text-muted">02.</span>
        <h2 className="font-display text-display-md text-ink">{t('profile.academic.title')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <Field label={t('profile.academic.degree')}>
          <input
            type="text"
            value={profile.degree}
            onChange={(e) => updateField('degree', e.target.value)}
            placeholder={t('profile.academic.degree_placeholder')}
            className="input-editorial text-base"
          />
        </Field>
        <Field label={t('profile.academic.graduation_year')}>
          <input
            type="number"
            min="1990"
            max="2030"
            value={profile.graduation_year}
            onChange={(e) => updateField('graduation_year', e.target.value)}
            placeholder="2025"
            className="input-editorial text-base font-mono w-32"
          />
        </Field>
        <div className="md:col-span-2">
          <Field label={t('profile.academic.university')}>
            <input
              type="text"
              value={profile.university}
              onChange={(e) => updateField('university', e.target.value)}
              placeholder={t('profile.academic.university_placeholder')}
              className="input-editorial text-base"
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label={t('profile.academic.thesis_title')}>
            <input
              type="text"
              value={profile.thesis_title}
              onChange={(e) => updateField('thesis_title', e.target.value)}
              placeholder={t('profile.academic.thesis_placeholder')}
              className="input-editorial text-base"
            />
          </Field>
        </div>
        <Field label={t('profile.academic.thesis_supervisor')}>
          <input
            type="text"
            value={profile.thesis_supervisor}
            onChange={(e) => updateField('thesis_supervisor', e.target.value)}
            placeholder="Prof. Dr. …"
            className="input-editorial text-base"
          />
        </Field>
        <Field label={t('profile.academic.thesis_grade')}>
          <input
            type="text"
            value={profile.thesis_grade}
            onChange={(e) => updateField('thesis_grade', e.target.value)}
            placeholder="1.3 / sehr gut"
            className="input-editorial text-base font-mono w-40"
          />
        </Field>
        <div className="md:col-span-2">
          <Field label={t('profile.academic.publications')}>
            <textarea
              value={(profile.publications ?? []).join('\n')}
              onChange={(e) => updateField('publications', e.target.value.split('\n').filter(Boolean))}
              rows={5}
              placeholder={t('profile.academic.publications_placeholder')}
              className="w-full bg-transparent border border-rule p-3 font-mono text-[13px] text-ink2 focus:outline-none focus:border-ink resize-y"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CV
// ═══════════════════════════════════════════════════════════

function CvSection({ profile, update, updateField }) {
  const { t } = useI18n();
  return (
    <div className="max-w-4xl">
      <div className="section-marker">
        <span className="font-mono text-xs tracking-wider text-muted">03.</span>
        <h2 className="font-display text-display-md text-ink">{t('profile.cv.title')}</h2>
      </div>

      {/* Full CV text */}
      <Field label={t('profile.cv.raw_text')} hint={t('profile.cv.raw_text_help')}>
        <textarea
          value={profile.cv_text}
          onChange={(e) => updateField('cv_text', e.target.value)}
          rows={14}
          className="w-full bg-paper2/30 border border-rule p-4 font-mono text-[13.5px] leading-relaxed text-ink2 focus:outline-none focus:border-ink resize-y"
        />
      </Field>

      {/* Methods + Software grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6">
        <Field label={t('profile.cv.methods')}>
          <input
            type="text"
            value={(profile.methods ?? []).join(', ')}
            onChange={(e) => updateField('methods', commaSplit(e.target.value))}
            placeholder={t('profile.cv.methods_placeholder')}
            className="input-editorial text-base font-mono"
          />
          {profile.methods?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.methods.map((m, i) => (
                <span key={i} className="tag">{m}</span>
              ))}
            </div>
          )}
        </Field>
        <Field label={t('profile.cv.software')}>
          <input
            type="text"
            value={(profile.software ?? []).join(', ')}
            onChange={(e) => updateField('software', commaSplit(e.target.value))}
            placeholder={t('profile.cv.software_placeholder')}
            className="input-editorial text-base font-mono"
          />
          {profile.software?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.software.map((s, i) => (
                <span key={i} className="tag">{s}</span>
              ))}
            </div>
          )}
        </Field>
      </div>

      {/* Languages */}
      <div className="mt-8">
        <Field label={t('profile.cv.languages')}>
          <LanguagesEditor
            languages={profile.languages ?? []}
            onChange={(langs) => updateField('languages', langs)}
          />
        </Field>
      </div>

      {/* Research interests */}
      <div className="mt-6">
        <Field label={t('profile.cv.fields_interest')}>
          <input
            type="text"
            value={(profile.fields_of_interest ?? []).join(', ')}
            onChange={(e) => updateField('fields_of_interest', commaSplit(e.target.value))}
            placeholder={t('profile.cv.fields_interest_placeholder')}
            className="input-editorial text-base"
          />
        </Field>
      </div>
    </div>
  );
}

function LanguagesEditor({ languages, onChange }) {
  const { t } = useI18n();
  const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'];

  const update = (i, patch) => {
    const next = [...languages];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i) => onChange(languages.filter((_, idx) => idx !== i));
  const add = () => onChange([...languages, { code: 'en', level: 'B2' }]);

  return (
    <div className="space-y-2">
      {languages.map((lang, i) => (
        <div key={i} className="flex items-center gap-3 border border-rule p-2.5">
          <input
            type="text"
            value={lang.code}
            onChange={(e) => update(i, { code: e.target.value.toLowerCase() })}
            placeholder="de"
            className="w-16 bg-transparent border-b border-rule px-1 py-1 font-mono text-sm focus:outline-none focus:border-ink"
          />
          <select
            value={lang.level}
            onChange={(e) => update(i, { level: e.target.value })}
            className="bg-transparent border-b border-rule px-1 py-1 text-sm focus:outline-none focus:border-ink"
          >
            {LEVELS.map((lv) => <option key={lv}>{lv}</option>)}
          </select>
          <button
            onClick={() => remove(i)}
            className="ms-auto text-muted hover:text-danger text-xs"
          >
            ✕ {t('profile.cv.remove_lang')}
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="font-mono text-[11px] tracking-wider uppercase text-navy hover:text-sienna"
      >
        {t('profile.cv.add_language')}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ACCOUNT
// ═══════════════════════════════════════════════════════════

function AccountSection({ reset }) {
  const { t } = useI18n();
  const { user, ready, hasSupabase: supaOn } = useAuth();

  return (
    <div className="max-w-3xl space-y-12">
      <div>
        <div className="section-marker">
          <span className="font-mono text-xs tracking-wider text-muted">04.</span>
          <h2 className="font-display text-display-md text-ink">{t('profile.account.title')}</h2>
        </div>

        {!supaOn ? (
          <div className="border border-ochre/40 bg-ochre/5 p-5 max-w-2xl">
            <div className="font-mono text-[10.5px] tracking-wider uppercase text-ochre mb-2">⚠ Local-only mode</div>
            <p className="text-sm text-ink2 leading-relaxed">{t('profile.account.no_supabase')}</p>
          </div>
        ) : !ready ? (
          <p className="font-display-italic text-muted">{t('common.loading')}</p>
        ) : user ? (
          <SignedInPanel user={user} />
        ) : (
          <AuthPanel />
        )}
      </div>

      {/* Danger zone */}
      <DangerZone reset={reset} />
    </div>
  );
}

function SignedInPanel({ user }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(getSyncMeta());

  const doSignOut = async () => {
    setBusy(true);
    try { await signOut(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const doPush = async () => {
    setError(null); setBusy(true);
    try {
      await pushToCloud(user.id);
      setMeta(getSyncMeta());
    } catch (e) { setError(`${t('profile.errors.sync_failed')} ${e.message}`); }
    finally { setBusy(false); }
  };

  const doPull = async () => {
    setError(null); setBusy(true);
    try {
      await pullFromCloud(user.id);
      setMeta(getSyncMeta());
    } catch (e) { setError(`${t('profile.errors.sync_failed')} ${e.message}`); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div className="border border-rule p-5 max-w-xl">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted">
              {t('profile.account.signed_in_as')}
            </div>
            <div className="font-display text-lg text-ink">{user.email}</div>
          </div>
          <button onClick={doSignOut} disabled={busy} className="btn-ghost text-sm">
            {t('profile.account.sign_out')}
          </button>
        </div>
      </div>

      {/* Sync controls */}
      <div className="border border-rule p-5 max-w-xl">
        <div className="font-mono text-[10.5px] tracking-wider uppercase text-muted mb-3">
          ↻ Sync
        </div>
        <p className="text-sm text-ink2 leading-relaxed mb-4">
          {t('profile.account.sync_help')}
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={doPush} disabled={busy} className="btn-primary text-sm">
            {busy ? t('profile.account.syncing') : `↑ ${t('profile.account.push_to_cloud')}`}
          </button>
          <button onClick={doPull} disabled={busy} className="btn-ghost text-sm">
            {busy ? t('profile.account.syncing') : `↓ ${t('profile.account.pull_from_cloud')}`}
          </button>
        </div>
        {meta && (
          <div className="font-mono text-[10.5px] text-muted mt-3">
            {t('profile.account.synced_at')}: {' '}
            {meta.last_pushed_at && `↑ ${formatDate(meta.last_pushed_at)}`}
            {meta.last_pushed_at && meta.last_pulled_at && ' · '}
            {meta.last_pulled_at && `↓ ${formatDate(meta.last_pulled_at)}`}
          </div>
        )}
        {error && (
          <div className="mt-3 border border-danger bg-danger/5 p-2 text-xs text-danger">{error}</div>
        )}
      </div>
    </div>
  );
}

function AuthPanel() {
  const { t } = useI18n();
  const [mode, setMode] = useState('signin');  // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(email, password);
      // useAuth will pick up the state change
    } catch (e) {
      setError(`${t(mode === 'signin' ? 'profile.errors.sign_in_failed' : 'profile.errors.sign_up_failed')} ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="border border-rule p-6 max-w-md">
      <h3 className="font-display text-2xl text-ink mb-5">
        {mode === 'signin' ? t('profile.account.sign_in') : t('profile.account.sign_up')}
      </h3>

      <div className="space-y-4 mb-5">
        <Field label={t('profile.account.email')}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-editorial text-base"
          />
        </Field>
        <Field label={t('profile.account.password')}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="input-editorial text-base"
          />
        </Field>
      </div>

      {error && (
        <div className="mb-4 border border-danger bg-danger/5 p-2 text-xs text-danger">{error}</div>
      )}

      <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-40">
        {busy ? '…' : (mode === 'signin' ? t('profile.account.submit_signin') : t('profile.account.submit_signup'))}
      </button>

      <button
        type="button"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        className="mt-3 w-full text-center text-sm text-navy hover:text-sienna underline underline-offset-2"
      >
        {mode === 'signin' ? t('profile.account.to_signup') : t('profile.account.to_signin')}
      </button>
    </form>
  );
}

function DangerZone({ reset }) {
  const { t } = useI18n();
  const [confirming, setConfirming] = useState(false);

  const doReset = () => {
    if (window.confirm(t('profile.danger.confirm'))) {
      reset();
      setConfirming(false);
    }
  };

  return (
    <div className="border border-danger/30 bg-danger/5 p-5 max-w-2xl">
      <div className="font-mono text-[10.5px] tracking-wider uppercase text-danger mb-2">
        ⚠ {t('profile.danger.title')}
      </div>
      <p className="text-sm text-ink2 leading-relaxed mb-4">{t('profile.danger.body')}</p>
      <button
        onClick={doReset}
        className="text-sm text-danger hover:text-paper hover:bg-danger transition-colors border border-danger px-4 py-2"
      >
        {t('profile.danger.button')}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Field wrapper + helpers
// ═══════════════════════════════════════════════════════════

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block font-mono text-[10.5px] tracking-[0.15em] uppercase text-muted mb-2">
        {label}
      </span>
      {children}
      {hint && (
        <span className="block font-display-italic text-xs text-muted mt-1.5 leading-relaxed">
          {hint}
        </span>
      )}
    </label>
  );
}

function commaSplit(value) {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}
