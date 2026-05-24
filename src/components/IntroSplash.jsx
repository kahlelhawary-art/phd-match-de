import { useState, useEffect } from 'react';

/**
 * Cinematic intro splash.
 *
 * The Kurdish rising-sun mark draws itself on a deep ink background, the
 * wordmark fades up, a gold rule expands — then the whole overlay dissolves
 * to reveal the app. Shows once per browser session (sessionStorage), and
 * can be skipped with a click / any key / reduced-motion preference.
 */

const SESSION_KEY = 'phd-match-intro-shown';
const GOLD = '#FEBD11';
const RED = '#ED2024';
const GREEN = '#278E43';

// 21-ray sun, top ray vertical. Rays start above the horizon (cy=60).
function sunRayPaths(cx, cy, rInner, rOuter, widthDeg = 3.4) {
  const paths = [];
  for (let i = 0; i < 21; i++) {
    const ang = ((-90 + i * (360 / 21)) * Math.PI) / 180;
    const half = (widthDeg * Math.PI) / 180;
    const tipX = cx + rOuter * Math.cos(ang);
    const tipY = cy + rOuter * Math.sin(ang);
    const b1X = cx + rInner * Math.cos(ang - half);
    const b1Y = cy + rInner * Math.sin(ang - half);
    const b2X = cx + rInner * Math.cos(ang + half);
    const b2Y = cy + rInner * Math.sin(ang + half);
    paths.push(`M${tipX.toFixed(2)} ${tipY.toFixed(2)} L${b1X.toFixed(2)} ${b1Y.toFixed(2)} L${b2X.toFixed(2)} ${b2Y.toFixed(2)} Z`);
  }
  return paths;
}

export default function IntroSplash() {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const alreadyShown =
    typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1';

  const [visible, setVisible] = useState(!alreadyShown && !prefersReduced);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SESSION_KEY, '1');

    // Lock scroll while the splash is up
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Total runtime ~3s, then dissolve
    const startLeave = setTimeout(() => setLeaving(true), 3000);
    const remove = setTimeout(() => setVisible(false), 3700);

    return () => {
      clearTimeout(startLeave);
      clearTimeout(remove);
      document.body.style.overflow = prevOverflow;
    };
  }, [visible]);

  if (!visible) return null;

  const skip = () => {
    setLeaving(true);
    setTimeout(() => setVisible(false), 500);
  };

  const rays = sunRayPaths(50, 60, 13, 41);

  return (
    <div
      onClick={skip}
      onKeyDown={skip}
      role="button"
      tabIndex={0}
      aria-label="Intro"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer transition-opacity duration-700 ${leaving ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'radial-gradient(circle at 50% 42%, #211d17 0%, #15120e 70%, #100d0a 100%)' }}
    >
      {/* faint paper grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* SUN MARK */}
      <svg width="150" height="150" viewBox="0 0 100 100" className="intro-sun" aria-hidden="true">
        <defs>
          <clipPath id="introCirc"><circle cx="50" cy="50" r="46" /></clipPath>
          <clipPath id="introAbove"><rect x="0" y="0" width="100" height="60" /></clipPath>
          <radialGradient id="introGlow" cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.35" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* glow */}
        <circle cx="50" cy="56" r="48" fill="url(#introGlow)" className="intro-glow" />

        <g clipPath="url(#introCirc)">
          {/* sky stays transparent (dark bg shows through) */}
          <g clipPath="url(#introAbove)">
            {/* rays draw on one by one */}
            {rays.map((d, i) => (
              <path
                key={i}
                d={d}
                fill={GOLD}
                className="intro-ray"
                style={{ animationDelay: `${0.5 + i * 0.035}s` }}
              />
            ))}
            {/* sun disk */}
            <circle cx="50" cy="60" r="15.5" fill={GOLD} className="intro-disk" />
          </g>

          {/* tricolour ground */}
          <g className="intro-ground">
            <rect x="0" y="60" width="100" height="13.4" fill={RED} />
            <rect x="0" y="73.4" width="100" height="13.3" fill="#FFFFFF" />
            <rect x="0" y="86.7" width="100" height="13.3" fill={GREEN} />
          </g>
        </g>

        {/* ring */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="#3a342b" strokeWidth="1.4" className="intro-ring" />
      </svg>

      {/* WORDMARK */}
      <div className="intro-word mt-7 text-center">
        <div className="font-display text-3xl tracking-tight" style={{ color: '#F4EFE6' }}>
          PhD<span style={{ color: '#E0A93B' }}>·</span>Match
          <span className="ms-2 font-mono text-xs tracking-[0.3em] align-middle" style={{ color: '#8a7d68' }}>
            DE
          </span>
        </div>
      </div>

      {/* gold rule */}
      <div className="intro-rule mt-5 h-px" style={{ background: 'linear-gradient(90deg, transparent, #E0A93B, transparent)' }} />

      <style>{`
        .intro-sun { filter: drop-shadow(0 8px 30px rgba(254,189,17,0.12)); }

        .intro-ray {
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center;
          animation: rayIn 0.5s ease-out forwards;
        }
        @keyframes rayIn {
          from { opacity: 0; transform: scale(0.55); }
          to   { opacity: 1; transform: scale(1); }
        }

        .intro-disk {
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center;
          animation: diskIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s forwards;
        }
        @keyframes diskIn {
          from { opacity: 0; transform: scale(0.2); }
          to   { opacity: 1; transform: scale(1); }
        }

        .intro-ground {
          opacity: 0;
          animation: groundIn 0.8s ease-out 1.15s forwards;
        }
        @keyframes groundIn { from { opacity: 0; } to { opacity: 1; } }

        .intro-ring {
          opacity: 0;
          animation: ringIn 1s ease-out 1.3s forwards;
        }
        @keyframes ringIn { from { opacity: 0; } to { opacity: 1; } }

        .intro-glow {
          opacity: 0;
          animation: glowPulse 2.4s ease-in-out 1.2s forwards;
        }
        @keyframes glowPulse {
          0%   { opacity: 0; }
          40%  { opacity: 1; }
          100% { opacity: 0.65; }
        }

        .intro-word {
          opacity: 0;
          transform: translateY(8px);
          animation: wordIn 0.9s cubic-bezier(0.16,1,0.3,1) 1.5s forwards;
        }
        @keyframes wordIn {
          to { opacity: 1; transform: translateY(0); }
        }

        .intro-rule {
          width: 0;
          animation: ruleIn 1s cubic-bezier(0.16,1,0.3,1) 1.85s forwards;
        }
        @keyframes ruleIn { to { width: 220px; } }
      `}</style>
    </div>
  );
}
