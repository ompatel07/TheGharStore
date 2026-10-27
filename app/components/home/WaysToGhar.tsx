import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router";

import type { ProductCardData } from "~/components/ProductCard";
import { Icon } from "~/components/ui/Icon";
import { SectionHeading } from "~/components/ui/SectionHeading";
import { Wave } from "~/components/ui/Wave";
import { shopifyImageUrl } from "~/lib/image";
import { formatPrice } from "~/lib/money";

export type Way = { word: string; hint: string; product: ProductCardData };

/**
 * "So many ways to love your ghar": giant verbs on a peach block. Hovering a
 * word (desktop) dims the rest and floats that product's photo after the
 * cursor, tilting with the movement; every word is a plain link to the
 * product. Phones get the same list with a thumbnail beside each word.
 */
export function WaysToGhar({ ways }: { ways: Way[] }) {
  const [active, setActive] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const float = floatRef.current;
    if (!section || !float) return;
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let frame = 0;
    const loop = () => {
      const dx = tx - x;
      x += dx * 0.16;
      y += (ty - y) * 0.16;
      float.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${Math.max(-12, Math.min(12, dx * 0.08)).toFixed(2)}deg)`;
      frame = Math.abs(dx) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      tx = event.clientX - rect.left;
      ty = event.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(loop);
    };
    section.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", onMove);
    };
  }, []);

  if (ways.length < 3) return null;

  return (
    <>
    <Wave className="text-peach -mb-px" />
    <section
      ref={sectionRef}
      aria-labelledby="ways-title"
      className="ways bg-peach relative overflow-hidden py-20 md:py-28"
      data-active={active !== null}
    >
      <div className="max-w-page px-margin relative mx-auto">
        <SectionHeading
          id="ways-title"
          kicker="ek ghar, kayi kaam"
          title="So many ways to love your"
          accent="ghar"
          align="center"
        />
        <ul role="list" className="ways-list mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:mt-14 md:gap-x-10">
          {ways.map((way, index) => (
            <li key={way.word} className="ways-item" data-on={active === index} style={{ "--i": index } as CSSProperties}>
              <Link
                to={`/products/${way.product.handle}`}
                prefetch="intent"
                onPointerEnter={() => setActive(index)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                className="ways-word font-heading text-chocolate flex items-center gap-3 text-[clamp(2.6rem,1.6rem+4.6vw,6.2rem)] leading-[1.02] font-extrabold tracking-tight"
              >
                {way.product.featuredImage ? (
                  <img
                    src={shopifyImageUrl(way.product.featuredImage.url, { width: 140 })}
                    alt=""
                    className="size-12 shrink-0 rounded-xl object-cover md:hidden"
                    loading="lazy"
                  />
                ) : null}
                <span>{way.word}</span>
                <span className="ways-hint type-hand text-burgundy hidden text-xl md:inline">{way.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Cursor-following product card (desktop only, decorative: the words are the links). */}
      <div
        ref={floatRef}
        aria-hidden="true"
        className="ways-float pointer-events-none absolute start-0 top-0 hidden md:block"
      >
        {ways.map((way, index) => (
          <div key={way.word} className="ways-float-card" data-on={active === index}>
            {way.product.featuredImage ? (
              <img
                src={shopifyImageUrl(way.product.featuredImage.url, { width: 420 })}
                alt=""
                className="aspect-square w-full rounded-xl object-cover"
                loading="lazy"
              />
            ) : null}
            <span className="mt-2 flex items-center justify-between gap-2 px-1 text-sm font-bold">
              <span className="truncate">{way.product.title}</span>
              <span className="text-burgundy shrink-0">{formatPrice(way.product.priceRange.minVariantPrice)}</span>
            </span>
          </div>
        ))}
      </div>
      <span aria-hidden="true" className="absolute end-6 bottom-6 hidden items-center gap-2 text-sm font-bold text-chocolate/60 md:flex">
        <Icon name="sparkle" size={16} /> hover a word
      </span>
    </section>
    <Wave flip className="text-peach -mt-px" />
    </>
  );
}
