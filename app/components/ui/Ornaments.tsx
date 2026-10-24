// Decorative brand ornaments drawn in SVG (aria-hidden, currentColor).
// Inspired by Indian jaali and rangoli geometry — fine, never busy.

export function Mandala({ className = "" }: { className?: string }) {
  const petals = Array.from({ length: 16 }, (_, i) => i * 22.5);
  const dots = Array.from({ length: 32 }, (_, i) => i * 11.25);
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" fill="none">
      <g stroke="currentColor" strokeWidth="1">
        <circle cx="200" cy="200" r="196" strokeDasharray="1 6" strokeLinecap="round" />
        <circle cx="200" cy="200" r="170" opacity="0.7" />
        <circle cx="200" cy="200" r="120" strokeDasharray="2 5" opacity="0.8" />
        {petals.map((angle) => (
          <path
            key={angle}
            d="M200 30 C222 70 222 100 200 128 C178 100 178 70 200 30 Z"
            transform={`rotate(${angle} 200 200)`}
            opacity="0.85"
          />
        ))}
        {petals.map((angle) => (
          <path
            key={`inner-${angle}`}
            d="M200 82 C210 100 210 112 200 124 C190 112 190 100 200 82 Z"
            transform={`rotate(${angle + 11.25} 200 200)`}
            opacity="0.6"
          />
        ))}
      </g>
      <g fill="currentColor">
        {dots.map((angle) => (
          <circle key={angle} cx="200" cy="12" r="2" transform={`rotate(${angle} 200 200)`} />
        ))}
      </g>
    </svg>
  );
}

/** Hand-drawn underline that draws itself (see .draw-stroke). */
export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 24" className={`draw-stroke ${className}`} aria-hidden="true" fill="none" preserveAspectRatio="none">
      <path
        d="M4 16 C 60 6, 120 4, 170 10 S 260 20, 296 8"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        pathLength={1}
      />
    </svg>
  );
}

/** Small four-point star used as a separator. */
export function Spark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 1.5c.6 5 3.5 8 10.5 10.5-7 2.5-9.9 5.5-10.5 10.5-.6-5-3.5-8-10.5-10.5C8.5 9.5 11.4 6.5 12 1.5Z" />
    </svg>
  );
}

/** Hand-drawn curved arrow for handwritten notes. */
export function CurlyArrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 60" className={`draw-stroke ${className}`} aria-hidden="true" fill="none">
      <path
        d="M84 6C76 30 54 48 14 50m0 0 12-12M14 50l14 8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
      />
    </svg>
  );
}

/** Arch-topped window outline (jharokha), for decorative frames. */
export function ArchOutline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 260" className={className} aria-hidden="true" fill="none" preserveAspectRatio="none">
      <path
        d="M10 255V110C10 55 50 10 100 10s90 45 90 100v145"
        stroke="currentColor"
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
