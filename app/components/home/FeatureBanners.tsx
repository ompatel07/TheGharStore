import { useEffect, useRef, type CSSProperties } from "react";
import { Link } from "react-router";

import { Icon } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";
import type { FeatureBanner } from "~/lib/home";
import { responsiveSrcSet, shopifyImageUrl } from "~/lib/image";
import { compareMoney, formatPrice, salePercent } from "~/lib/money";

const PANELS = [
  { panel: "bg-night text-cream", kicker: "text-peach", chip: "bg-white/10 text-cream", muted: "text-cream/75", button: "btn-light" },
  { panel: "bg-peach-soft text-chocolate", kicker: "text-terracotta-deep", chip: "bg-white text-chocolate", muted: "text-chocolate-muted", button: "btn-dark" },
  { panel: "bg-cream-deep text-chocolate", kicker: "text-burgundy", chip: "bg-white text-chocolate", muted: "text-chocolate-muted", button: "btn-dark" },
];

/**
 * Editorial "spotlight" banners: a real room photo beside the product story,
 * alternating sides. Photos wipe in as they enter view and drift on hover.
 */
export function FeatureBanners({ features }: { features: FeatureBanner[] }) {
  const ref = useStackProgress<HTMLElement>();
  if (features.length === 0) return null;

  return (
    <section
      ref={ref}
      aria-label="Featured finds"
      className="max-w-page px-margin mx-auto grid gap-6 py-10 md:gap-10 md:py-16"
      style={{ "--stack-top": "6.5rem" } as CSSProperties}
    >
      {features.map((feature, index) => {
        const tone = PANELS[index % PANELS.length];
        const flip = index % 2 === 1;
        const onSale = feature.compareAt && compareMoney(feature.compareAt, feature.price) > 0;
        const percent = onSale && feature.compareAt ? salePercent(feature.price, feature.compareAt) : null;
        return (
          <article
            key={feature.handle}
            data-stack-card
            style={{ "--si": index } as CSSProperties}
            className={`feature-banner stack-card group relative grid overflow-hidden rounded-[2rem] shadow-[var(--shadow-xl)] md:min-h-[32rem] md:grid-cols-2 ${tone.panel}`}
          >
            <Reveal className={`wipe relative aspect-[4/3] overflow-hidden md:aspect-auto ${flip ? "md:order-2" : ""}`}>
              <img
                src={shopifyImageUrl(feature.image.url, { width: 1000 })}
                srcSet={responsiveSrcSet(feature.image.url, [600, 900, 1200], feature.image.width)}
                sizes="(min-width: 768px) 50vw, 100vw"
                alt={feature.image.altText ?? feature.title}
                className="feature-img absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </Reveal>
            <div className="flex flex-col justify-center gap-5 p-7 md:p-12 lg:p-16">
              <p className={`type-hand text-2xl md:text-3xl ${tone.kicker}`}>{feature.kicker}</p>
              <h2 className="ed-display ed-md">{feature.title}</h2>
              {feature.description ? (
                <p className={`max-w-md text-base leading-relaxed md:text-lg ${tone.muted}`}>{feature.description}</p>
              ) : null}
              {feature.highlights.length > 0 ? (
                <ul role="list" className="flex flex-wrap gap-2">
                  {feature.highlights.map((highlight) => (
                    <li key={highlight} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${tone.chip}`}>
                      <Icon name="check" size={15} strokeWidth={2.5} />
                      {highlight}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link to={`/products/${feature.handle}`} prefetch="intent" className={`btn ${tone.button}`}>
                  Shop now
                  <span className="btn-arrow" aria-hidden="true">
                    <Icon name="arrow-right" size={16} strokeWidth={2.5} />
                  </span>
                </Link>
                <p className="flex items-baseline gap-2">
                  <span className="font-heading text-3xl font-extrabold">
                    <span className="sr-only">Price </span>
                    {formatPrice(feature.price)}
                  </span>
                  {onSale && feature.compareAt ? (
                    <>
                      <s className={`text-base ${tone.muted}`}>
                        <span className="sr-only">MRP </span>
                        {formatPrice(feature.compareAt)}
                      </s>
                      {percent ? <span className="text-sm font-bold">{percent}% off</span> : null}
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

/**
 * Stacking cards (md+): every banner sticks under the header and, as the next
 * one slides over it, eases back (scale + shade via --p). One rAF scroll
 * handler; off on phones and under reduced motion.
 */
function useStackProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const desktop = window.matchMedia("(min-width: 48rem)");
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-stack-card]"));
    if (cards.length < 2) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!desktop.matches) {
        cards.forEach((card) => card.style.removeProperty("--p"));
        return;
      }
      for (let i = 0; i < cards.length - 1; i += 1) {
        const current = cards[i].getBoundingClientRect();
        const next = cards[i + 1].getBoundingClientRect();
        const overlap = (current.bottom - next.top) / current.height;
        cards[i].style.setProperty("--p", Math.min(1, Math.max(0, overlap)).toFixed(3));
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return ref;
}
