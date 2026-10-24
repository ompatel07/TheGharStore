import { Link } from "react-router";

import { BeforeAfterSlider } from "~/components/ui/BeforeAfterSlider";
import { Icon, isIconName } from "~/components/ui/Icon";
import {
  CurlyArrow,
  Mandala,
  Spark,
  Squiggle,
} from "~/components/ui/Ornaments";
import type { HeroContent } from "~/lib/home";
import { responsiveSrcSet, shopifyImageUrl } from "~/lib/image";
import { useMagnetic, useParallaxLayers } from "~/lib/interactions";
import { formatPrice } from "~/lib/money";

/** Words that rise from behind a mask, one after another. */
function MaskedWords({ text, offset = 0 }: { text: string; offset?: number }) {
  return (
    <>
      {text.split(/\s+/).map((word, index) => (
        <span key={`${word}-${index}`} className="w">
          <span style={{ "--i": index + offset } as React.CSSProperties}>
            {word}
          </span>
          {" "}
        </span>
      ))}
    </>
  );
}

const DIYAS = [
  { left: "8%", top: "72%", s: "16px", d: "2.4s", delay: "0s" },
  { left: "88%", top: "64%", s: "12px", d: "3.1s", delay: ".6s" },
  { left: "18%", top: "18%", s: "10px", d: "2.8s", delay: "1.1s" },
  { left: "78%", top: "12%", s: "14px", d: "2.2s", delay: ".3s" },
  { left: "50%", top: "92%", s: "11px", d: "3.4s", delay: ".9s" },
];

export function HomeHero({ hero }: { hero: HeroContent }) {
  const sceneRef = useParallaxLayers<HTMLDivElement>(22);
  const ctaRef = useMagnetic<HTMLAnchorElement>(0.3);
  const headlineWords = hero.headline.split(/\s+/).length;
  const product = hero.product;
  const price = product?.priceRange.minVariantPrice;
  const ctaUrl = hero.cta.url;

  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative -mt-12 overflow-hidden pt-12 lg:-mt-16 lg:pt-16"
    >
      {/* Warm sunlit room: layered light, never a flat template background. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_80%_20%,#ffe9d2_0%,transparent_55%),radial-gradient(90%_70%_at_0%_100%,#fbe5db_0%,transparent_60%)]" />
        <div className="absolute top-[8%] -left-24 h-[140%] w-64 rotate-[18deg] bg-gradient-to-b from-white/50 via-white/10 to-transparent blur-2xl" />
        <div className="absolute top-[4%] left-40 h-[140%] w-24 rotate-[18deg] bg-gradient-to-b from-white/40 via-white/5 to-transparent blur-2xl max-lg:hidden" />
        <p className="font-heading text-outline absolute right-[-2rem] bottom-[-3.5rem] text-[clamp(8rem,22vw,22rem)] leading-none font-extrabold tracking-tighter opacity-[0.08] select-none">
          ghar
        </p>
      </div>

      <div
        ref={sceneRef}
        className="max-w-page px-margin relative mx-auto grid min-h-[calc(100svh-7rem)] items-center gap-12 pt-10 pb-20 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pt-6"
      >
        {/* ── Copy ─────────────────────────────────────────── */}
        <div className="relative z-10">
          {hero.eyebrow ? (
            <p className="text-terracotta-deep inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-[0.78rem] font-bold tracking-[0.14em] uppercase shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-terracotta)_45%,transparent)] backdrop-blur">
              <Spark className="size-3.5" />
              {hero.eyebrow}
            </p>
          ) : null}

          <h1
            id="home-hero-title"
            className="display-xl mask-words text-on-surface mt-6"
          >
            <MaskedWords text={hero.headline} />
            {hero.headlineAccent ? (
              <span className="relative mt-1 block">
                <span className="text-terracotta-deep">
                  <MaskedWords
                    text={hero.headlineAccent}
                    offset={headlineWords}
                  />
                </span>
                <Squiggle className="text-gold absolute -bottom-3 left-0 h-4 w-[min(100%,26rem)] md:-bottom-4 md:h-5" />
              </span>
            ) : null}
          </h1>

          {hero.subtext ? (
            <p className="text-on-surface/85 mt-9 max-w-lg text-lg leading-relaxed md:text-xl">
              {hero.subtext}
            </p>
          ) : null}

          {hero.benefits.length > 0 ? (
            <ul role="list" className="mt-7 flex max-w-xl flex-wrap gap-2.5">
              {hero.benefits.slice(0, 4).map((benefit) => (
                <li
                  key={benefit.label}
                  className="inline-flex items-center gap-2 rounded-full bg-white/75 py-1.5 ps-1.5 pe-4 text-sm font-semibold shadow-[var(--shadow-sm)] backdrop-blur"
                >
                  <span className="icon-chip [--chip-size:2rem]">
                    <Icon
                      name={isIconName(benefit.icon) ? benefit.icon : "check"}
                      size={16}
                    />
                  </span>
                  {benefit.label}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              ref={ctaRef}
              to={ctaUrl}
              prefetch="intent"
              className="magnetic button-cta group !px-8 !py-4 text-lg"
            >
              {hero.cta.text || "Shop now"}
              <Icon
                name="arrow-right"
                size={22}
                strokeWidth={2.25}
                className="motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
              />
            </Link>
            <a
              href="#spotlight-title"
              className="text-chocolate inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-[var(--color-gold)] decoration-2 underline-offset-[6px] hover:decoration-[var(--color-terracotta)]"
            >
              See how it works
            </a>
          </div>

          <p className="text-on-surface-secondary mt-8 inline-flex items-center gap-2 text-sm">
            <Icon name="shield" size={16} className="text-success" />
            Secure Shopify checkout
          </p>
        </div>

        {/* ── Art: product in a jharokha arch ───────────────── */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[30rem] lg:max-w-[36rem]">
          <div
            data-depth="0.3"
            className="absolute inset-[-12%] text-[var(--color-gold)]"
          >
            <Mandala className="spin-slow h-full w-full opacity-70" />
          </div>
          <div
            data-depth="0.6"
            aria-hidden="true"
            className="absolute top-[10%] left-1/2 aspect-square w-[78%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#f6a58a,var(--color-terracotta)_45%,var(--color-terracotta-deep)_100%)] shadow-[0_40px_80px_-30px_rgb(192_78_48/0.7)]"
          />
          {DIYAS.map((diya) => (
            <span
              key={diya.left + diya.top}
              aria-hidden="true"
              className="diya-glow"
              style={
                {
                  left: diya.left,
                  top: diya.top,
                  "--s": diya.s,
                  "--d": diya.d,
                  "--delay": diya.delay,
                } as React.CSSProperties
              }
            />
          ))}

          <div
            data-depth="1"
            className="absolute inset-x-[14%] top-[6%] bottom-[8%]"
          >
            <div className="arch-frame h-full">
              <div className="arch relative h-full bg-white">
                {hero.image ? (
                  <img
                    src={shopifyImageUrl(hero.image.url, { width: 900 })}
                    srcSet={responsiveSrcSet(
                      hero.image.url,
                      [480, 720, 900, 1200],
                      hero.image.width,
                    )}
                    sizes="(min-width: 1024px) 34vw, 80vw"
                    alt={hero.image.altText || product?.title || ""}
                    width={hero.image.width ?? 900}
                    height={hero.image.height ?? 900}
                    className={`h-full w-full ${hero.isCutout ? "object-contain p-6" : "origin-left scale-[1.14] object-cover object-left"}`}
                    fetchPriority="high"
                    loading="eager"
                  />
                ) : null}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgb(56_44_42/0.18)] via-transparent to-transparent"
                />
              </div>
            </div>
          </div>

          {product && price ? (
            <Link
              data-depth="1.6"
              to={`/products/${product.handle}`}
              className="surface-card absolute bottom-[2%] -left-2 z-10 flex items-center gap-3 py-2.5 ps-2.5 pe-5 motion-safe:transition-transform motion-safe:hover:-translate-y-1 sm:-left-6"
            >
              <span className="icon-chip bg-peach-soft [--chip-size:2.75rem]">
                <Icon name="sparkle" size={20} />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-on-surface-secondary text-xs font-semibold tracking-wide uppercase">
                  Featured find
                </span>
                <span className="text-on-surface text-xl font-extrabold">
                  {formatPrice(price)}
                </span>
              </span>
            </Link>
          ) : null}

          {hero.note ? (
            <div
              data-depth="1.3"
              aria-hidden="true"
              className="absolute top-[2%] -right-2 z-10 rotate-[-7deg] sm:-right-8"
            >
              <p className="type-hand text-chocolate max-w-[9rem] text-2xl leading-[1.05] md:text-[1.9rem]">
                {hero.note}
              </p>
              <CurlyArrow className="text-burgundy mt-1 ml-4 h-12 w-20" />
            </div>
          ) : null}
        </div>

        {hero.beforeImage && hero.afterImage ? (
          <BeforeAfterSlider
            before={hero.beforeImage}
            after={hero.afterImage}
            className="lg:col-span-2 lg:mx-auto lg:w-[40rem]"
            width={900}
          />
        ) : null}

        <a
          href="#category-strip-title"
          className="scroll-cue text-on-surface-secondary absolute bottom-6 left-[var(--spacing-margin)] hidden items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase lg:inline-flex"
        >
          <span
            className="border-chocolate/30 relative inline-flex h-9 w-5 justify-center rounded-full border-2"
            aria-hidden="true"
          >
            <span className="bg-chocolate/60 mt-1.5 h-2 w-1 rounded-full" />
          </span>
          Scroll
        </a>
      </div>
    </section>
  );
}
