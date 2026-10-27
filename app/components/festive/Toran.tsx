import type { CSSProperties } from "react";

/**
 * A marigold toran — the garland hung over Indian doorways for festivals —
 * strung across the top of the homepage while festive mode is on (Shopify
 * `festive_mode` metaobject). Pure SVG: round-capped dashed strokes become
 * strings of marigold beads; each strand ends in a mango leaf and sways on
 * its own. Decorative (aria-hidden), static under reduced motion.
 */
export function Toran({ className = "" }: { className?: string }) {
  const units = Array.from({ length: 18 }, (_, index) => index);
  return (
    <div aria-hidden="true" className={`toran pointer-events-none flex justify-center overflow-hidden ${className}`}>
      {units.map((index) => (
        <svg
          key={index}
          viewBox="0 0 120 150"
          className="toran-unit h-[7.5rem] w-24 shrink-0 md:h-[9.5rem] md:w-[7.5rem]"
          style={{ "--d": `${(index % 5) * 0.35}s` } as CSSProperties}
        >
          {/* scallop of beads between two strands */}
          <path d="M0 8 Q60 56 120 8" className="toran-beads" />
          <path d="M0 8 Q60 56 120 8" className="toran-beads-core" />
          {/* the strand hanging from this unit's left edge */}
          <g className="toran-strand">
            <path d="M6 6 L6 104" className="toran-beads toran-beads--alt" />
            <path d="M6 6 L6 104" className="toran-beads-core" />
            <path d="M6 108 C16 118 14 134 6 146 C-2 134 -4 118 6 108 Z" className="toran-leaf" />
            <path d="M6 110 L6 144" className="toran-leaf-vein" />
          </g>
          {/* cord */}
          <path d="M0 4 H120" className="toran-cord" />
        </svg>
      ))}
    </div>
  );
}

/**
 * A scalloped wire of warm bulbs that twinkle one after another. Used on the
 * night sections during festive mode.
 */
export function StringLights({ className = "", count = 22 }: { className?: string; count?: number }) {
  const bulbs = Array.from({ length: count }, (_, index) => index);
  return (
    <div aria-hidden="true" className={`string-lights pointer-events-none ${className}`}>
      <svg viewBox={`0 0 ${count * 60} 60`} preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-14 w-full">
        <path
          d={bulbs.map((i) => `${i === 0 ? "M0 4" : ""} Q${i * 60 + 30} 40 ${i * 60 + 60} 4`).join(" ")}
          className="string-wire"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <ul className="absolute inset-x-0 top-0 flex h-14 justify-around">
        {bulbs.map((index) => (
          <li
            key={index}
            className="string-bulb"
            style={{ "--d": `${(index * 0.37) % 2.6}s`, "--y": "16px" } as CSSProperties}
          />
        ))}
      </ul>
    </div>
  );
}
