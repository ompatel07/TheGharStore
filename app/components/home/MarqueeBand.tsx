import { Link } from "react-router";

import { Spark } from "~/components/ui/Ornaments";

type MarqueeItem = { label: string; to?: string; hand?: boolean };

/**
 * Infinite ticker band. Content is duplicated once for a seamless loop; the copy
 * is aria-hidden so screen readers hear each item once. Pauses on hover; static
 * under reduced motion.
 */
export function MarqueeBand({
  items,
  tone = "dark",
  duration = 45,
}: {
  items: MarqueeItem[];
  tone?: "dark" | "terracotta" | "light";
  duration?: number;
}) {
  if (items.length === 0) return null;
  const handClass = tone === "light" ? "text-terracotta-deep" : tone === "dark" ? "text-peach" : "text-cream";
  const toneClass =
    tone === "dark"
      ? "bg-chocolate text-cream"
      : tone === "light"
        ? "bg-surface text-on-surface border-y border-border"
        : "bg-terracotta-deep text-white";

  const renderTrack = (hidden: boolean) => (
    <ul role="list" className="marquee-track" aria-hidden={hidden || undefined}>
      {items.map((item, index) => (
        <li
          key={`${item.label}-${index}`}
          className="flex shrink-0 items-center gap-10"
        >
          {item.to && !hidden ? (
            <Link
              to={item.to}
              className={`whitespace-nowrap hover:underline ${
                item.hand
                  ? `type-hand text-3xl md:text-4xl ${handClass}`
                  : "font-heading text-2xl font-extrabold tracking-tight md:text-4xl"
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={`whitespace-nowrap ${
                item.hand
                  ? `type-hand text-3xl md:text-4xl ${handClass}`
                  : "font-heading text-2xl font-extrabold tracking-tight md:text-4xl"
              }`}
            >
              {item.label}
            </span>
          )}
          <Spark className={`size-5 shrink-0 ${tone === "terracotta" ? "text-cream/70" : "text-gold"}`} />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={`${toneClass} marquee relative py-6 md:py-8`}
      style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
    >
      {renderTrack(false)}
      {renderTrack(true)}
    </div>
  );
}
