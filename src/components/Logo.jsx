/**
 * Logo — "Rising Sun" mark.
 *
 * A 21-ray Kurdish sun rising over a tricolour horizon (red / white / green),
 * enclosed in a circular seal. The top ray is vertical, per the official
 * standard. Symbolises a new academic dawn — and carries Kurdish identity
 * with quiet dignity.
 *
 * Pure SVG, scales crisply at any size. Pass `size` (px) and optionally
 * `tone="light" | "dark"` to adapt the ring/sky to the background.
 */

const GOLD = '#FEBD11';
const RED = '#ED2024';
const GREEN = '#278E43';
const INK = '#1A1814';
const PAPER = '#F4EFE6';
const RULE = '#C9BFA8';

// Build 21 rays. Top ray vertical (-90°). Only used above the horizon (clipped).
function sunRays(cx, cy, rInner, rOuter, color, rayWidthDeg = 3.6) {
  const rays = [];
  for (let i = 0; i < 21; i++) {
    const ang = ((-90 + i * (360 / 21)) * Math.PI) / 180;
    const half = (rayWidthDeg * Math.PI) / 180;
    const tipX = cx + rOuter * Math.cos(ang);
    const tipY = cy + rOuter * Math.sin(ang);
    const b1X = cx + rInner * Math.cos(ang - half);
    const b1Y = cy + rInner * Math.sin(ang - half);
    const b2X = cx + rInner * Math.cos(ang + half);
    const b2Y = cy + rInner * Math.sin(ang + half);
    rays.push(
      `M${tipX.toFixed(2)} ${tipY.toFixed(2)} L${b1X.toFixed(2)} ${b1Y.toFixed(2)} L${b2X.toFixed(2)} ${b2Y.toFixed(2)} Z`
    );
  }
  return rays.join(' ');
}

export default function Logo({ size = 34, tone = 'light', className = '' }) {
  const sky = tone === 'dark' ? '#23201B' : PAPER;
  const ring = tone === 'dark' ? RULE : INK;
  // Unique ids so multiple instances on one page don't clash
  const uid = `lg${size}${tone}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="PhD Match — rising sun"
    >
      <defs>
        <clipPath id={`circ-${uid}`}>
          <circle cx="50" cy="50" r="46" />
        </clipPath>
        <clipPath id={`above-${uid}`}>
          {/* everything above the horizon line at y=60 */}
          <rect x="0" y="0" width="100" height="60" />
        </clipPath>
      </defs>

      <g clipPath={`url(#circ-${uid})`}>
        {/* Sky */}
        <rect x="0" y="0" width="100" height="60" fill={sky} />

        {/* Sun + rays, clipped to above the horizon */}
        <g clipPath={`url(#above-${uid})`}>
          <path d={sunRays(50, 60, 13, 41, GOLD)} fill={GOLD} />
          <circle cx="50" cy="60" r="15.5" fill={GOLD} />
          {/* subtle inner highlight for depth */}
          <circle cx="50" cy="60" r="15.5" fill="none" stroke="#FFD451" strokeWidth="1.2" opacity="0.6" />
        </g>

        {/* Tricolour ground — red / white / green */}
        <rect x="0" y="60" width="100" height="13.4" fill={RED} />
        <rect x="0" y="73.4" width="100" height="13.3" fill="#FFFFFF" />
        <rect x="0" y="86.7" width="100" height="13.3" fill={GREEN} />

        {/* thin horizon line for crispness */}
        <line x1="0" y1="60" x2="100" y2="60" stroke={INK} strokeWidth="0.6" opacity="0.25" />
      </g>

      {/* Outer ring */}
      <circle cx="50" cy="50" r="46" fill="none" stroke={ring} strokeWidth="1.6" />
    </svg>
  );
}
