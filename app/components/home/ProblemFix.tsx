import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Link } from "react-router";

import type { ProductCardData } from "~/components/ProductCard";
import { Icon } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";
import { responsiveSrcSet, shopifyImageUrl } from "~/lib/image";
import { formatPrice } from "~/lib/money";
import type { Problem } from "~/lib/problems";

type Pair = { problem: Problem; product: ProductCardData };

const DURATION_MS = 6500;

/**
 * "Chhoti problems, smart fixes" — an everyday problem on the left, the product
 * that fixes it on the right. Desktop: ARIA tabs that auto-advance (a CSS bar
 * fills; its animationend moves on), paused on hover / off-screen, never under
 * reduced motion. Phones: a swipe rail of problem → fix cards.
 */
export function ProblemFix({ pairs }: { pairs: Pair[] }) {
  const items = pairs.slice(0, 6);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setPaused(!entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (items.length < 3) return null;
  const current = items[active];

  const select = (index: number, focus = false) => {
    const next = (index + items.length) % items.length;
    setActive(next);
    if (focus) tabRefs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      select(active + 1, true);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      select(active - 1, true);
    } else if (event.key === "Home") {
      event.preventDefault();
      select(0, true);
    } else if (event.key === "End") {
      event.preventDefault();
      select(items.length - 1, true);
    }
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="fix-title"
      className="bg-cream-deep relative overflow-hidden py-20 md:py-28"
    >
      <div className="max-w-page px-margin mx-auto">
        <Reveal className="max-w-3xl">
          <p className="eyebrow text-terracotta-deep">Har ghar ki kahani</p>
          <h2 id="fix-title" className="ed-display ed-lg text-on-surface mt-4">
            Chhoti problems, <em className="text-terracotta-deep">smart fixes</em>
          </h2>
        </Reveal>

        {/* Desktop: tabs + panel */}
        <div className="mt-14 hidden grid-cols-[1fr_1.05fr] items-center gap-16 lg:grid">
          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label="Everyday problems"
            className="fix-tabs grid"
            data-paused={paused}
          >
            {items.map((pair, index) => {
              const selected = index === active;
              return (
                <button
                  key={pair.product.id}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${index}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(index)}
                  onKeyDown={onKeyDown}
                  className={`fix-tab group relative py-5 text-start transition-colors ${
                    selected ? "text-on-surface" : "text-on-surface/45 hover:text-on-surface/80"
                  }`}
                >
                  <span className="flex items-baseline gap-5">
                    <span className="w-7 shrink-0 text-sm font-bold tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="ed-display text-[clamp(1.5rem,1rem+1.2vw,2.15rem)] leading-tight">
                      {pair.problem.problem}
                    </span>
                  </span>
                  <span className="bg-chocolate/12 absolute inset-x-0 bottom-0 block h-px overflow-hidden">
                    {selected ? (
                      <span
                        className="fix-bar bg-terracotta-deep absolute inset-0 block"
                        style={{ "--dur": `${DURATION_MS}ms` } as CSSProperties}
                        onAnimationEnd={() => select(active + 1)}
                      />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id={`${baseId}-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${active}`}
            className="relative"
          >
            <FixPanel key={current.product.id} pair={current} />
          </div>
        </div>
      </div>

      {/* Phones / tablets: swipe cards */}
      <ul role="list" className="rail mt-10 lg:hidden">
        {items.map((pair, index) => (
          <li key={pair.product.id} className="w-[80vw] max-w-[22rem]">
            <FixCard pair={pair} index={index} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function FixPanel({ pair }: { pair: Pair }) {
  const { problem, product } = pair;
  const image = product.featuredImage ?? product.images.nodes[0] ?? null;

  return (
    <div className="fix-panel grid grid-cols-[1.1fr_1fr] overflow-hidden rounded-[2rem] bg-white shadow-[var(--shadow-xl)]">
      <div className="relative aspect-square bg-white">
        {image ? (
          <img
            src={shopifyImageUrl(image.url, { width: 720 })}
            srcSet={responsiveSrcSet(image.url, [480, 720, 960], image.width)}
            sizes="28vw"
            alt={image.altText || product.title}
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : null}
      </div>
      <div className="flex flex-col justify-between gap-6 p-7 xl:p-9">
        <div>
          <span className="icon-chip [--chip-size:3rem]">
            <Icon name={problem.icon} size={24} />
          </span>
          <p className="ed-display ed-italic text-on-surface mt-6 text-[1.6rem] leading-snug">{problem.fix}</p>
        </div>
        <div>
          <p className="text-on-surface-secondary text-sm font-semibold">{product.title}</p>
          <p className="text-on-surface mt-1 text-2xl font-bold">{formatPrice(product.priceRange.minVariantPrice)}</p>
          <Link to={`/products/${product.handle}`} prefetch="intent" className="btn btn-dark mt-5 w-full">
            Shop the fix
            <span className="btn-arrow" aria-hidden="true">
              <Icon name="arrow-right" size={16} strokeWidth={2.5} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function FixCard({ pair, index }: { pair: Pair; index: number }) {
  const { problem, product } = pair;
  const image = product.featuredImage ?? product.images.nodes[0] ?? null;

  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      className="flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[var(--shadow)]"
    >
      <span className="p-6 pb-5">
        <span className="text-terracotta-deep text-xs font-bold tracking-[0.2em]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="ed-display text-on-surface mt-2 block text-[1.6rem] leading-tight">{problem.problem}</span>
        <span className="text-on-surface-secondary mt-3 block text-[0.95rem] leading-snug">{problem.fix}</span>
      </span>
      <span className="bg-cream mt-auto flex items-center gap-3 p-3">
        {image ? (
          <img
            src={shopifyImageUrl(image.url, { width: 160 })}
            alt=""
            className="size-16 shrink-0 rounded-xl object-cover"
            loading="lazy"
          />
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="text-on-surface line-clamp-1 text-sm font-semibold">{product.title}</span>
          <span className="text-on-surface font-bold">{formatPrice(product.priceRange.minVariantPrice)}</span>
        </span>
        <span className="bg-chocolate text-cream grid size-10 shrink-0 place-items-center rounded-full">
          <Icon name="arrow-right" size={18} />
        </span>
      </span>
    </Link>
  );
}
