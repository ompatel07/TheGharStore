import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Link } from "react-router";

import { StringLights } from "~/components/festive/Toran";
import { ProductCard } from "~/components/ProductCard";
import { Icon } from "~/components/ui/Icon";
import { SectionHeading } from "~/components/ui/SectionHeading";
import type { HomeCollection } from "~/lib/home";

const AUTOPLAY_MS = 4800;

/**
 * The Diwali Edit as a 3D coverflow: the centre product sits lit and large,
 * neighbours fan back in depth. Arrows, dots, swipe and arrow keys move it;
 * a gentle autoplay pauses on hover / focus / touch, off-screen and under
 * reduced motion. No scroll hijacking — the page scrolls normally.
 */
export function FestiveCarousel({
  collection,
  festive = false,
}: {
  collection: HomeCollection;
  festive?: boolean;
}) {
  const products = collection.products.slice(0, 9);
  const count = products.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const swipe = useRef<{ x: number; id: number } | null>(null);

  const go = useCallback((delta: number) => setActive((current) => (current + delta + count) % count), [count]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !visible || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, visible, count, go]);

  if (count < 3) return null;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby={`edit-${collection.handle}`}
      className="bg-night text-cream relative overflow-hidden py-20 md:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_55%_at_50%_58%,rgb(239_119_86/0.32),transparent_70%),radial-gradient(30%_30%_at_12%_20%,rgb(201_167_106/0.16),transparent_70%)]"
      />
      {festive ? <StringLights /> : null}

      <div className="max-w-page px-margin relative mx-auto">
        <SectionHeading
          id={`edit-${collection.handle}`}
          tone="dark"
          kicker="roshni ka tyohaar"
          title="The Diwali"
          accent="Edit"
          note="swipe through the season's picks"
          align="center"
        />
      </div>

      {/* Pointer wrapper: pause on hover/touch and read swipes (buttons below are the keyboard controls). */}
      <div
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onPointerDown={(event) => {
          swipe.current = { x: event.clientX, id: event.pointerId };
        }}
        onPointerUp={(event) => {
          const start = swipe.current;
          swipe.current = null;
          if (!start || start.id !== event.pointerId) return;
          const dx = event.clientX - start.x;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="The Diwali Edit"
        className="cf-stage relative mx-auto mt-12 h-[30rem] max-w-[90rem] touch-pan-y md:h-[34rem]"
      >
        {products.map((product, index) => {
          let d = index - active;
          if (d > count / 2) d -= count;
          if (d < -count / 2) d += count;
          const ad = Math.min(Math.abs(d), 3);
          const center = d === 0;
          return (
            <div
              key={product.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}`}
              className="cf-slide"
              data-center={center}
              style={{ "--d": d, "--ad": ad } as CSSProperties}
            >
              <div className="cf-card">
                <ProductCard product={product} tone="dark" />
              </div>
            </div>
          );
        })}
      </div>
      </div>

      <div className="max-w-page px-margin relative mx-auto mt-8 flex flex-wrap items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => go(-1)}
          onKeyDown={onKeyDown}
          aria-label="Previous product"
          className="grid size-12 place-items-center rounded-full border border-white/25 text-cream transition-colors hover:bg-white/10"
        >
          <Icon name="chevron-left" size={22} />
        </button>
        <ol className="flex items-center gap-2" aria-label="Choose a product">
          {products.map((product, index) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show ${product.title}`}
                aria-current={index === active ? "true" : undefined}
                className={`block h-2 rounded-full transition-all duration-500 ${index === active ? "bg-peach w-7" : "w-2 bg-white/30 hover:bg-white/60"}`}
              />
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => go(1)}
          onKeyDown={onKeyDown}
          aria-label="Next product"
          className="grid size-12 place-items-center rounded-full border border-white/25 text-cream transition-colors hover:bg-white/10"
        >
          <Icon name="chevron-right" size={22} />
        </button>
      </div>
      <p className="mt-6 text-center">
        <Link to={`/collections/${collection.handle}`} prefetch="intent" className="btn btn-light">
          Shop the whole edit
          <span className="btn-arrow" aria-hidden="true">
            <Icon name="arrow-right" size={16} strokeWidth={2.5} />
          </span>
        </Link>
      </p>
    </section>
  );
}
