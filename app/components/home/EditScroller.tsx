import { useEffect, useRef } from "react";
import { Link } from "react-router";

import { ProductCard } from "~/components/ProductCard";
import { Icon } from "~/components/ui/Icon";
import type { HomeCollection } from "~/lib/home";

/**
 * A pinned, horizontally scrolling "edit" of one collection (desktop). GSAP +
 * ScrollTrigger load only when the section approaches. Phones get a native
 * swipe row; reduced motion gets the same swipe row (no pinning).
 */
export function EditScroller({
  collection,
  kicker,
  title,
  accent,
}: {
  collection: HomeCollection;
  kicker: string;
  title: string;
  accent: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const products = collection.products.slice(0, 8);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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
        const context = gsap.context(() => {
          const distance = () =>
            Math.max(0, track.scrollWidth - window.innerWidth + 80);
          gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
        }, section);
        cleanup = () => context.revert();
      },
      { rootMargin: "600px 0px" },
    );
    loader.observe(section);
    return () => {
      cancelled = true;
      loader.disconnect();
      cleanup?.();
    };
  }, []);

  if (products.length < 3) return null;

  return (
    <section
      ref={sectionRef}
      aria-labelledby={`edit-${collection.handle}`}
      className="bg-night text-cream relative overflow-hidden lg:flex lg:h-svh lg:items-center"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_15%_60%,rgb(239_119_86/0.28),transparent_70%),radial-gradient(40%_40%_at_85%_20%,rgb(201_167_106/0.18),transparent_70%)]"
      />
      <EditMotes />

      <ul
        ref={trackRef}
        role="list"
        className="scrollbar-none relative flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto px-[var(--spacing-margin)] py-16 lg:snap-none lg:overflow-visible lg:py-0 lg:ps-[max(var(--spacing-margin),calc((100vw-var(--spacing-page))/2+var(--spacing-margin)))]"
      >
        <li className="flex w-[80vw] shrink-0 snap-start flex-col justify-center sm:w-[24rem] lg:w-[30rem] lg:pe-10">
          <p className="eyebrow text-peach">{kicker}</p>
          <h2 id={`edit-${collection.handle}`} className="ed-display ed-xl mt-5">
            {title}
            <em className="ed-italic text-sheen block pe-2">{accent}</em>
          </h2>
          {collection.description ? (
            <p className="text-cream/75 mt-5 max-w-sm text-lg">
              {collection.description}
            </p>
          ) : null}
          <Link to={`/collections/${collection.handle}`} className="btn btn-light mt-8 w-fit" prefetch="intent">
            Shop the edit
            <span className="btn-arrow" aria-hidden="true">
              <Icon name="arrow-right" size={16} strokeWidth={2.5} />
            </span>
          </Link>
          <p className="text-cream/50 mt-10 hidden items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase lg:inline-flex">
            Keep scrolling <Icon name="arrow-right" size={14} />
          </p>
        </li>
        {products.map((product, index) => (
          <li
            key={product.id}
            className={`w-[72vw] shrink-0 snap-start sm:w-[19rem] lg:w-[22rem] ${index % 2 === 1 ? "lg:translate-y-10" : "lg:-translate-y-6"}`}
          >
            <ProductCard product={product} tone="dark" />
          </li>
        ))}
        <li className="flex w-[60vw] shrink-0 snap-start items-center sm:w-[16rem]">
          <Link
            to={`/collections/${collection.handle}`}
            className="group border-cream/30 hover:bg-cream/10 flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-full border text-center transition-colors"
          >
            <span className="ed-display ed-italic text-3xl">
              See all
            </span>
            <span className="text-cream/70 text-sm">
              {collection.products.length} finds
            </span>
            <Icon
              name="arrow-right"
              size={24}
              className="motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
            />
          </Link>
        </li>
      </ul>
    </section>
  );
}

const EDIT_MOTES = [
  [6, 70, 6, 10, 0],
  [18, 30, 4, 12, 2],
  [27, 82, 7, 9, 4],
  [41, 16, 3, 11, 1],
  [52, 64, 5, 10, 3],
  [63, 36, 6, 12, 5],
  [74, 78, 4, 9, 1.5],
  [86, 24, 7, 11, 3.5],
  [93, 58, 4, 10, 0.8],
] as const;

function EditMotes() {
  return (
    <div className="motes" aria-hidden="true">
      {EDIT_MOTES.map(([left, top, size, duration, delay]) => (
        <i
          key={`${left}-${top}`}
          style={
            {
              left: `${left}%`,
              top: `${top}%`,
              "--s": `${size}px`,
              "--d": `${duration}s`,
              "--delay": `${delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
