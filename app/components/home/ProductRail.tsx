import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";

import { ProductCard, type ProductCardData } from "~/components/ProductCard";
import { Icon } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";

/**
 * A horizontally scrolling shelf of product cards: native scroll-snap (swipe on
 * phones, trackpad / arrows on desktop) with a progress line. No carousel library.
 */
export function ProductRail({
  id,
  eyebrow,
  title,
  products,
  viewAll,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  products: ProductCardData[];
  viewAll?: { to: string; label: string };
}) {
  const railRef = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(0.2);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const visible = rail.clientWidth / rail.scrollWidth;
      const ratio = max > 0 ? rail.scrollLeft / max : 1;
      setProgress(Math.min(1, visible + (1 - visible) * ratio));
      setEdges({ start: rail.scrollLeft < 8, end: rail.scrollLeft > max - 8 });
    };
    update();
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scroll = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 24 : rail.clientWidth * 0.8;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({ left: direction * step * 2, behavior: reduce ? "auto" : "smooth" });
  };

  if (products.length < 3) return null;

  return (
    <section aria-labelledby={id} className="py-16 md:py-24">
      <Reveal className="max-w-page px-margin mx-auto flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-terracotta-deep">{eyebrow}</p>
          <h2 id={id} className="ed-display ed-lg text-on-surface mt-4">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {viewAll ? (
            <Link to={viewAll.to} prefetch="intent" className="text-on-surface me-3 inline-flex min-h-11 items-center gap-2 font-semibold">
              <span className="link-sweep">{viewAll.label}</span>
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={edges.start}
            aria-label="Scroll back"
            className="border-chocolate/25 text-on-surface hover:bg-chocolate hover:text-cream hidden size-12 place-items-center rounded-full border transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current md:grid"
          >
            <Icon name="chevron-left" size={20} />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={edges.end}
            aria-label="Scroll forward"
            className="border-chocolate/25 text-on-surface hover:bg-chocolate hover:text-cream hidden size-12 place-items-center rounded-full border transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current md:grid"
          >
            <Icon name="chevron-right" size={20} />
          </button>
        </div>
      </Reveal>

      <ul ref={railRef} role="list" className="rail mt-10 pb-2">
        {products.map((product) => (
          <li key={product.id} className="w-[62vw] sm:w-[40vw] md:w-[30vw] lg:w-[calc((min(100vw,var(--spacing-page))-2*var(--spacing-margin)-4.5rem)/4)]">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>

      <div className="max-w-page px-margin mx-auto mt-8">
        <div className="rail-progress text-chocolate" aria-hidden="true">
          <span style={{ "--p": progress.toFixed(3) } as React.CSSProperties} />
        </div>
      </div>
    </section>
  );
}
