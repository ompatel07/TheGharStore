/**
 * Soft wavy section edge (the brand's "curved section edges"). Colour comes
 * from `currentColor`, so set it to the section's background colour.
 */
export function Wave({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 64"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none block h-7 w-full md:h-12 ${flip ? "rotate-180" : ""} ${className}`}
    >
      <path d="M0 40 C 180 8 360 8 540 30 S 900 60 1080 34 S 1350 6 1440 22 V64 H0 Z" fill="currentColor" />
    </svg>
  );
}
