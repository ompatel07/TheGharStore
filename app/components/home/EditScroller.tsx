import { useEffect, useRef } from "react";
import { Link } from "react-router";

import { ProductCard } from "~/components/ProductCard";
import { Icon } from "~/components/ui/Icon";
import { Mandala } from "~/components/ui/Ornaments";
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
      className="bg-chocolate text-cream relative overflow-hidden lg:flex lg:h-svh lg:items-center"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-[44rem] text-[var(--color-gold)] opacity-20"
      >
        <Mandala className="spin-slow-reverse h-full w-full" />
      </div>
      <div
        aria-hidden="true"
        className="festive-glow pointer-events-none absolute top-1/3 left-10 size-[30rem] rounded-full"
      />

      <ul
        ref={trackRef}
        role="list"
        className="scrollbar-none relative flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto px-[var(--spacing-margin)] py-16 lg:snap-none lg:overflow-visible lg:py-0 lg:ps-[max(var(--spacing-margin),calc((100vw-var(--spacing-page))/2+var(--spacing-margin)))]"
      >
        <li className="flex w-[80vw] shrink-0 snap-start flex-col justify-center sm:w-[24rem] lg:w-[30rem] lg:pe-10">
          <p className="type-hand text-peach text-3xl">{kicker}</p>
          <h2 id={`edit-${collection.handle}`} className="display-xl mt-2">
            {title}
            <span className="text-outline-cream block">{accent}</span>
          </h2>
          {collection.description ? (
            <p className="text-cream/75 mt-5 max-w-sm text-lg">
              {collection.description}
            </p>
          ) : null}
          <Link
            to={`/collections/${collection.handle}`}
            className="bg-cream text-chocolate hover:bg-peach mt-8 inline-flex min-h-12 w-fit items-center gap-2 rounded-full px-6 font-bold"
          >
            Shop the edit <Icon name="arrow-right" size={18} />
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
            <ProductCard product={product} />
          </li>
        ))}
        <li className="flex w-[60vw] shrink-0 snap-start items-center sm:w-[16rem]">
          <Link
            to={`/collections/${collection.handle}`}
            className="group border-cream/30 hover:bg-cream/10 flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-full border text-center"
          >
            <span className="font-heading text-2xl font-extrabold">
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
