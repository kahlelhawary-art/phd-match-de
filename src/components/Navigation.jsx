import { NavLink } from 'react-router-dom';
import { useI18n } from '../lib/i18n.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import Logo from './Logo.jsx';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export default function Navigation() {
  const { t, isRtl } = useI18n();

  const links = [
    { to: '/', key: 'nav.discover' },
    { to: '/compass', key: 'nav.compass' },
    { to: '/library', key: 'nav.library' },
    { to: '/labs', key: 'nav.labs' },
    { to: '/match', key: 'nav.match' },
    { to: '/tracker', key: 'nav.tracker' },
    { to: '/letter', key: 'nav.letter' },
    { to: '/outreach', key: 'nav.outreach' },
    { to: '/profile', key: 'nav.profile' },
    { to: '/interview', key: 'nav.interview' },
  ];

  return (
    <header className="border-b border-rule bg-paper sticky top-0 z-40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Top row — brand + lang */}
        <div className="flex items-center justify-between py-4 border-b border-rule/60">
          <NavLink to="/" className="group">
            <div className="flex items-center gap-3">
              <Logo size={34} tone="light" className="shrink-0 transition-transform duration-500 group-hover:rotate-[8deg]" />
              <div className="flex items-baseline gap-3">
                <span className="font-display text-xl tracking-tightest text-ink leading-none">
                  PhD<span className="text-sienna">·</span>Match
                </span>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted border-l border-rule pl-3">
                  DE
                </span>
              </div>
            </div>
          </NavLink>

          <LanguageSwitcher />
        </div>

        {/* Bottom row — nav links */}
        <nav className="flex items-stretch overflow-x-auto -mb-px">
          {links.map((link, idx) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                [
                  'group relative flex items-baseline gap-2 px-4 lg:px-5 py-3 text-sm transition-colors whitespace-nowrap',
                  'border-b-2',
                  isActive
                    ? 'text-ink border-ink'
                    : 'text-ink2 border-transparent hover:text-ink',
                ].join(' ')
              }
            >
              <span className="font-mono text-[10px] text-muted">{ROMAN[idx]}.</span>
              <span className="font-body">{t(link.key)}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

