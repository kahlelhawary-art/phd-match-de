import { useI18n } from '../lib/i18n.jsx';

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-rule mt-24 bg-paper">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-display text-lg tracking-tightest text-ink mb-2">
              PhD<span className="text-sienna">·</span>Match DE
            </div>
            <p className="text-sm text-ink2 leading-relaxed max-w-xs">
              {t('brand.tagline')}
            </p>
          </div>

          <div className="text-sm text-ink2">
            <div className="specimen mb-3">Disclaimer</div>
            <p className="leading-relaxed">
              Programminformationen sind kuratiert, jedoch ohne Gewähr. Fristen und
              Förderkonditionen bitte auf der jeweiligen Programm-Website verifizieren.
            </p>
          </div>

          <div className="text-sm text-ink2 md:text-end">
            <div className="specimen mb-3">Colophon</div>
            <p className="font-display italic">
              Editorial set in Fraunces & Geist.
            </p>
            <p className="mt-2 text-muted font-mono text-[11px]">
              © {year} · Built with Nexus Tech
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

