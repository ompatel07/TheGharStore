import { useEffect, useRef } from "react";

import { Spark } from "~/components/ui/Ornaments";

/**
 * Brand statement whose words light up as you scroll (GSAP scrub, lazy).
 * Words wrapped in *asterisks* get the terracotta accent. Static and fully
 * readable without JS or with reduced motion.
 */
export function Statement({
  text,
  signature,
}: {
  text: string;
  signature?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(/\s+/);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const spans = Array.from(element.querySelectorAll<HTMLElement>(".lw"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      spans.forEach((span) => span.classList.add("is-lit"));
      return;
    }

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const loader = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        loader.disconnect();
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const trigger = ScrollTrigger.create({
          trigger: element,
          start: "top 80%",
          end: "bottom 45%",
          scrub: true,
          onUpdate: (self) => {
            const lit = Math.round(self.progress * spans.length);
            spans.forEach((span, index) =>
              span.classList.toggle("is-lit", index < lit),
            );
          },
        });
        cleanup = () => trigger.kill();
      },
      { rootMargin: "300px 0px" },
    );
    loader.observe(element);
    return () => {
      cancelled = true;
      loader.disconnect();
      cleanup?.();
    };
  }, []);

  return (
    <section
      aria-label="About The Ghar Store"
      className="max-w-page px-margin mx-auto py-24 md:py-36"
    >
      <Spark className="text-gold mx-auto mb-8 size-8" />
      <p
        ref={ref}
        className="lit-words font-heading mx-auto max-w-5xl text-center text-[clamp(1.8rem,1.1rem+2.6vw,3.6rem)] leading-[1.12] font-extrabold tracking-tight"
      >
        {words.map((word, index) => {
          const accent = /^\*.*\*[.,!?]?$/.test(word);
          const clean = word.replace(/\*/g, "");
          return (
            <span
              key={`${word}-${index}`}
              className={`lw ${accent ? "accent" : ""}`}
            >
              {clean}{" "}
            </span>
          );
        })}
      </p>
      {signature ? (
        <p className="type-hand text-terracotta-deep mt-8 text-center text-2xl md:text-3xl">
          {signature}
        </p>
      ) : null}
    </section>
  );
}
