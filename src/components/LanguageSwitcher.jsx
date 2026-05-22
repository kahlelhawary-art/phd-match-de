import { useI18n } from '../lib/i18n.jsx';

const LABEL = { de: 'DE', en: 'EN', ar: 'AR' };

export default function LanguageSwitcher() {
  const { lang, setLang, available } = useI18n();

  return (
    <div className="flex items-center gap-0 font-mono text-[11px] tracking-wider">
      {available.map((code, i) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={[
            'px-2 py-1 transition-colors',
            lang === code ? 'text-ink' : 'text-muted hover:text-ink',
          ].join(' ')}
        >
          {LABEL[code]}
          {i < available.length - 1 && <span className="text-rule mx-0 select-none ml-2">·</span>}
        </button>
      ))}
    </div>
  );
}

