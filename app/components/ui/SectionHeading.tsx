import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { CurlyArrow, Spark } from "~/components/ui/Ornaments";

type SectionHeadingProps = {
  id: string;
  /** Small handwritten line above the title (Kalam). */
  kicker?: string;
  title: string;
  /** Words appended in the accent colour. */
  accent?: string;
  /** Handwritten aside with a hand-drawn arrow, e.g. "free delivery on all of these!" */
  note?: string;
  /** "peach": on peach backgrounds (burgundy accents for AA contrast). */
  tone?: "light" | "dark" | "peach";
  size?: "lg" | "xl" | "md";
  align?: "start" | "center";
  /** Right-hand slot on wide screens (links, arrows). */
  aside?: ReactNode;
  className?: string;
};

/**
 * Section title that animates in as it scrolls into view: words rise from a
 * mask one by one, the kicker fades up, and the note's arrow draws itself.
 * Server HTML is fully visible; only below-the-fold headings arm the effect,
 * and reduced-motion users see it static.
 */
export function SectionHeading({
  id,
  kicker,
  title,
  accent,
  note,
  tone = "light",
  size = "lg",
  align = "start",
  aside,
  className = "",
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    element.classList.add("sh-armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.classList.add("is-in");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const words = title.split(/\s+/).filter(Boolean);
  const accentWords = accent ? accent.split(/\s+/).filter(Boolean) : [];
  const dark = tone === "dark";
  const accentClass = dark ? "text-peach" : tone === "peach" ? "text-burgundy" : "text-terracotta-deep";
  const sizeClass = size === "xl" ? "ed-xl" : size === "md" ? "ed-md" : "ed-lg";

  return (
    <div
      ref={ref}
      className={`flex flex-wrap items-end gap-x-8 gap-y-5 ${align === "center" ? "justify-center text-center" : "justify-between"} ${className}`}
    >
      <div className={align === "center" ? "mx-auto" : ""}>
        {kicker ? (
          <p
            className={`sh-fade type-hand inline-flex items-center gap-2 text-2xl md:text-[1.7rem] ${accentClass}`}
          >
            <Spark className="sh-spark text-gold size-4" />
            {kicker}
            <Spark className="sh-spark text-gold size-3" />
          </p>
        ) : null}
        <h2 id={id} className={`sh-words ed-display ${sizeClass} mt-1 ${dark ? "text-cream" : "text-on-surface"}`}>
          {words.map((word, index) => (
            <span key={`${word}-${index}`} className="w">
              <span style={{ "--i": index } as CSSProperties}>{word}&nbsp;</span>
            </span>
          ))}
          {accentWords.map((word, index) => (
            <span key={`a-${word}-${index}`} className="w">
              <span
                style={{ "--i": words.length + index } as CSSProperties}
                className={accentClass}
              >
                {word}
                {index < accentWords.length - 1 ? " " : ""}
              </span>
            </span>
          ))}
        </h2>
        {note ? (
          <p
            className={`sh-fade type-hand mt-2 inline-flex items-start gap-1 text-xl md:text-2xl ${dark ? "text-cream/80" : "text-burgundy"} ${align === "center" ? "" : "md:ms-10"}`}
          >
            <CurlyArrow className="mt-1 h-9 w-14 shrink-0 -scale-x-100 rotate-[200deg]" />
            {note}
          </p>
        ) : null}
      </div>
      {aside ? <div className="sh-fade">{aside}</div> : null}
    </div>
  );
}
