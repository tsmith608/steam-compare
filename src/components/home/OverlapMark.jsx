// The brand device: two libraries, one overlap. Thin rings with the shared
// lens lit in the accent colour. Purely decorative.
export default function OverlapMark({ className = "", label = true }) {
  return (
    <svg viewBox="0 0 640 420" className={className} aria-hidden="true">
      <defs>
        <clipPath id="ov-a">
          <circle cx="250" cy="210" r="190" />
        </clipPath>
        <radialGradient id="ov-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(96,165,250,0.30)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0.04)" />
        </radialGradient>
      </defs>
      <circle cx="390" cy="210" r="190" fill="url(#ov-glow)" clipPath="url(#ov-a)" />
      <circle cx="250" cy="210" r="190" fill="none" stroke="rgba(232,238,247,0.16)" strokeWidth="1.25" />
      <circle cx="390" cy="210" r="190" fill="none" stroke="rgba(232,238,247,0.16)" strokeWidth="1.25" />
      <circle cx="390" cy="210" r="190" fill="none" stroke="rgba(96,165,250,0.55)" strokeWidth="1.25" clipPath="url(#ov-a)" />
      {label && (
        <text x="320" y="216" textAnchor="middle" fill="rgba(147,197,253,0.75)" fontSize="11" letterSpacing="2.4" fontFamily="var(--font-sans)" fontWeight="650">
          BOTH OWN
        </text>
      )}
    </svg>
  );
}
