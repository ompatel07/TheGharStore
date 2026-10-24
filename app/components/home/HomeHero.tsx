import { useEffect, useRef } from "react";
import { Link } from "react-router";

import { BeforeAfterSlider } from "~/components/ui/BeforeAfterSlider";
import { Icon, isIconName } from "~/components/ui/Icon";
import type { HeroContent } from "~/lib/home";
import { responsiveSrcSet, shopifyImageUrl } from "~/lib/image";
import { formatPrice } from "~/lib/money";

/** Splits a line into word spans for the CSS word-by-word reveal. */
function Words({ text, offset = 0 }: { text: string; offset?: number }) {
  return (
    <>
      {text.split(/\s+/).map((word, index) => (
        <span key={`${word}-${index}`} style={{ "--i": index + offset } as React.CSSProperties}>
          {word}
          {" "}
        </span>
      ))}
    </>
  );
}

/** Pointer parallax for the product art (desktop, fine pointers, motion allowed). */
function useParallax() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;
        element.style.transform = `translate3d(${x * -10}px, ${y * -8}px, 0)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
  return ref;
}

export function HomeHero({ hero }: { hero: HeroContent }) {
  const parallaxRef = useParallax();
  const headlineWords = hero.headline.split(/\s+/).length;
  const product = hero.product;
  const price = product?.priceRange.minVariantPrice;

  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative -mt-10 overflow-hidden pt-10 lg:-mt-14 lg:pt-14"
    >
      {/* Warm, sunlit backdrop (pure CSS — nothing to download). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 size-[34rem] rounded-full bg-[radial-gradient(closest-side,rgb(255_236_210/0.95),transparent)]" />
        <div className="absolute top-10 right-[-10rem] size-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(233_161_140/0.38),transparent)]" />
        <div className="absolute bottom-0 left-1/3 size-[26rem] rounded-full bg-[radial-gradient(closest-side,rgb(201_167_106/0.18),transparent)]" />
      </div>

      <div className="max-w-page px-margin relative mx-auto grid items-center gap-10 pt-8 pb-14 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pt-14 lg:pb-20">
        <div className="relative z-10 max-w-2xl">
          {hero.eyebrow ? (
            <p className="border-terracotta/60 text-terracotta-deep inline-flex items-center gap-2 rounded-full border bg-white/70 px-4 py-1.5 text-[0.8rem] font-bold tracking-[0.08em] uppercase">
              <Icon name="sparkle" size={16} />
              {hero.eyebrow}
            </p>
          ) : null}

          <h1
            id="home-hero-title"
            className="type-display word-reveal text-on-surface mt-5 text-[clamp(2.6rem,1.6rem+4.4vw,5rem)]"
          >
            <Words text={hero.headline} />
            {hero.headlineAccent ? (
              <span className="text-terracotta-deep block">
                <Words text={hero.headlineAccent} offset={headlineWords} />
              </span>
            ) : null}
          </h1>

          {hero.subtext ? (
            <p className="text-on-surface/90 mt-5 max-w-xl text-lg leading-relaxed md:text-xl">
              {hero.subtext}
            </p>
          ) : null}

          {hero.benefits.length > 0 ? (
            <ul role="list" className="mt-7 grid max-w-xl grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              {hero.benefits.slice(0, 4).map((benefit) => (
                <li key={benefit.label} className="flex items-center gap-2.5">
                  <span className="icon-chip bg-white [--chip-size:2.75rem]">
                    <Icon name={isIconName(benefit.icon) ? benefit.icon : "check"} size={22} />
                  </span>
                  <span className="text-on-surface text-sm leading-tight font-semibold">
                    {benefit.label}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <HeroLink to={hero.cta.url} className="button-cta !px-8 !py-4 text-lg">
              {hero.cta.text || "Shop now"}
              <Icon name="arrow-right" size={22} strokeWidth={2.25} />
            </HeroLink>
            {product && price && hero.cta.url !== `/products/${product.handle}` ? (
              <Link
                to={`/products/${product.handle}`}
                className="text-burgundy inline-flex min-h-11 items-center gap-1 font-semibold underline-offset-4 hover:underline"
              >
                View featured product
              </Link>
            ) : null}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
          <div className="relative aspect-square">
            {/* Terracotta brush swash + gold ring (brand art, decorative). */}
            <svg
              aria-hidden="true"
              viewBox="0 0 400 400"
              className="text-terracotta absolute inset-0 h-full w-full"
            >
              <path
                fill="currentColor"
                opacity="0.9"
                d="M78 128c34-52 108-84 176-74 70 10 116 62 112 130-3 52-30 92-74 120-48 30-118 40-168 14-46-24-76-74-74-124 1-24 12-46 28-66Z"
              />
              <path
                fill="currentColor"
                opacity="0.35"
                d="M60 210c-6-30 10-64 30-78-4 26-2 52 10 74 14 26 40 44 70 52-40 8-102-6-110-48Z"
              />
              <circle
                cx="200"
                cy="200"
                r="186"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="1.2"
                strokeDasharray="2 7"
                opacity="0.9"
              />
            </svg>

            <div ref={parallaxRef} className="absolute inset-0 will-change-transform">
              <div className="float-soft absolute inset-[15%]">
                {hero.image ? (
                  hero.isCutout ? (
                    <img
                      src={shopifyImageUrl(hero.image.url, { width: 900 })}
                      srcSet={responsiveSrcSet(hero.image.url, [480, 720, 900, 1200], hero.image.width)}
                      sizes="(min-width: 1024px) 40vw, 85vw"
                      alt={hero.image.altText || product?.title || ""}
                      width={hero.image.width ?? 900}
                      height={hero.image.height ?? 900}
                      className="h-full w-full object-contain drop-shadow-[0_30px_30px_rgb(56_44_42/0.35)]"
                      fetchPriority="high"
                      loading="eager"
                    />
                  ) : (
                    <div className="h-full w-full rotate-[-3deg] rounded-[2rem] bg-white p-3 shadow-[var(--shadow-xl)]">
                      <img
                        src={shopifyImageUrl(hero.image.url, { width: 720 })}
                        srcSet={responsiveSrcSet(hero.image.url, [360, 520, 720], hero.image.width)}
                        sizes="(min-width: 1024px) 38vw, 80vw"
                        alt={hero.image.altText || product?.title || ""}
                        width={hero.image.width ?? 720}
                        height={hero.image.height ?? 720}
                        className="h-full w-full rounded-[1.5rem] object-cover"
                        fetchPriority="high"
                        loading="eager"
                      />
                    </div>
                  )
                ) : null}
              </div>
            </div>

            {product && price ? (
              <Link
                to={`/products/${product.handle}`}
                className="surface-card absolute -bottom-3 left-2 z-10 flex items-center gap-3 py-2.5 ps-3 pe-4 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 sm:left-6"
              >
                <span className="icon-chip [--chip-size:2.5rem]">
                  <Icon name="sparkle" size={18} />
                </span>
                <span className="flex flex-col">
                  <span className="text-on-surface-secondary text-xs font-medium">Featured find</span>
                  <span className="text-on-surface text-base font-bold">{formatPrice(price)}</span>
                </span>
              </Link>
            ) : null}

            {hero.note ? (
              <p
                aria-hidden="true"
                className="type-hand text-chocolate absolute top-[6%] right-0 max-w-[9rem] rotate-[-6deg] text-2xl leading-tight md:text-3xl"
              >
                {hero.note}
                <svg viewBox="0 0 80 50" className="text-burgundy mt-1 ml-6 h-10 w-16" fill="none">
                  <path
                    d="M70 4C62 26 40 40 10 42m0 0 10-10M10 42l12 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </p>
            ) : null}
          </div>

          {hero.beforeImage && hero.afterImage ? (
            <BeforeAfterSlider
              before={hero.beforeImage}
              after={hero.afterImage}
              className="mt-10 lg:absolute lg:-right-6 lg:bottom-0 lg:mt-0 lg:w-64"
              width={600}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function HeroLink({
  to,
  className,
  children,
}: {
  to: string;
  className: string;
  children: React.ReactNode;
}) {
  if (/^https?:\/\//.test(to)) {
    return (
      <a href={to} className={className} rel="noopener">
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={className} prefetch="intent">
      {children}
    </Link>
  );
}
