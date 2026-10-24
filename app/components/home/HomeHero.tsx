import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router";

import type { TrustItem } from "~/components/home/TrustSection";
import { Icon } from "~/components/ui/Icon";
import type { HeroContent, HeroHotspot, HomeImage } from "~/lib/home";
import { responsiveSrcSet, shopifyImageUrl } from "~/lib/image";
import { formatPrice } from "~/lib/money";

/**
 * Cinematic, shoppable hero. A full-bleed lifestyle photo (set in Shopify:
 * `home_hero.background_image`) with product hotspots pinned to the photo
 * (`home_hero.hotspots`). The photo is the LCP element: server-rendered,
 * high priority, never lazy. Copy rises in with CSS; pointer and scroll
 * parallax are transform-only and skip touch / reduced-motion.
 */
export function HomeHero({ hero, trust }: { hero: HeroContent; trust: TrustItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [openSpot, setOpenSpot] = useState<number | null>(null);
  const background = hero.background ?? hero.image;
  const ratio = background?.width && background?.height ? background.width / background.height : 16 / 9;
  const stageStyle = { "--ar": ratio.toFixed(4) } as CSSProperties;
  const words = hero.headline.split(/\s+/).filter(Boolean);

  useHeroParallax(sectionRef);

  // Close an open hotspot when tapping elsewhere.
  useEffect(() => {
    if (openSpot === null) return;
    const close = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest(".hotspot")) setOpenSpot(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [openSpot]);

  return (
    <section ref={sectionRef} aria-labelledby="hero-title" className="hero-cine flex flex-col">
      {background ? (
        <div className="hero-media">
          <div className="hero-parallax" data-parallax>
            <div className="hero-stage" style={stageStyle}>
              <HeroImage image={background} />
            </div>
          </div>
        </div>
      ) : null}
      <div className="hero-scrim" />
      <Motes />

      {/* Hotspots sit above the scrim on an identical stage, so they track the photo. */}
      {background && hero.hotspots.length > 0 ? (
        <div className="hero-media pointer-events-none !z-[1] max-lg:hidden">
          <div className="hero-parallax" data-parallax>
            <div className="hero-stage" style={stageStyle}>
              {hero.hotspots.map((spot, index) => (
                <Hotspot
                  key={spot.product.id}
                  spot={spot}
                  index={index}
                  open={openSpot === index}
                  onToggle={() => setOpenSpot(openSpot === index ? null : index)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="max-w-page px-margin pointer-events-none relative z-[2] mx-auto flex w-full flex-1 flex-col justify-end pt-20 pb-6 lg:justify-center lg:py-14">
        <div className="pointer-events-auto max-w-[40rem]">
          {hero.eyebrow ? (
            <p className="eyebrow hero-in text-peach" style={{ "--delay": "200ms" } as CSSProperties}>
              {hero.eyebrow}
            </p>
          ) : null}
          <h1 id="hero-title" className="ed-display ed-xl mask-words mt-5 text-[#fff8ef]">
            {words.map((word, index) => (
              <span key={`${word}-${index}`} className="w">
                <span style={{ "--i": index } as CSSProperties}>{word}&nbsp;</span>
              </span>
            ))}
            {hero.headlineAccent ? (
              <>
                <br />
                <span className="w">
                  <span style={{ "--i": words.length } as CSSProperties}>
                    <em className="ed-italic text-sheen pe-[0.08em]">{hero.headlineAccent}</em>
                  </span>
                </span>
              </>
            ) : null}
          </h1>
          {hero.subtext ? (
            <p
              className="hero-in text-cream/85 mt-6 max-w-md text-base leading-relaxed md:text-lg"
              style={{ "--delay": "750ms" } as CSSProperties}
            >
              {hero.subtext}
            </p>
          ) : null}
          <div className="hero-in mt-8 flex flex-wrap gap-3" style={{ "--delay": "900ms" } as CSSProperties}>
            <Link to={hero.cta.url} className="btn btn-light" prefetch="intent">
              {hero.cta.text}
              <span className="btn-arrow" aria-hidden="true">
                <Icon name="arrow-right" size={16} strokeWidth={2.5} />
              </span>
            </Link>
            <Link to="/collections" className="btn btn-ghost-light max-sm:hidden" prefetch="intent">
              Browse categories
            </Link>
          </div>
        </div>
      </div>

      {hero.hotspots.length > 0 ? <SceneStrip hotspots={hero.hotspots} /> : null}

      {trust.length > 0 ? (
        <div
          className="hero-in relative z-[2] border-t border-white/12"
          style={{ "--delay": "1.1s" } as CSSProperties}
        >
          <ul
            role="list"
            className="max-w-page px-margin scrollbar-none mx-auto flex items-center gap-x-8 gap-y-2 overflow-x-auto py-4 text-sm whitespace-nowrap text-white/85"
          >
            {trust.map((item) => (
              <li key={item.title} className="flex shrink-0 items-center gap-2.5">
                <Icon name={item.icon} size={20} className="text-peach" />
                <span className="font-semibold">{item.title}</span>
              </li>
            ))}
            {hero.hotspots.length > 0 ? (
              <li className="ms-auto hidden items-center gap-2 text-white/60 lg:flex">
                <span className="relative inline-flex size-2.5">
                  <span className="bg-peach absolute inset-0 animate-ping rounded-full opacity-70 motion-reduce:animate-none" />
                  <span className="bg-peach relative size-2.5 rounded-full" />
                </span>
                Hover the dots to shop this scene
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function HeroImage({ image }: { image: HomeImage }) {
  return (
    <img
      src={shopifyImageUrl(image.url, { width: 1600 })}
      srcSet={responsiveSrcSet(image.url, [720, 1080, 1440, 1672, 2048], image.width)}
      // On portrait screens the stage is ~1.8× the viewport height wide.
      sizes="(max-aspect-ratio: 16/9) 178vh, 100vw"
      alt={image.altText ?? ""}
      width={image.width ?? 1672}
      height={image.height ?? 941}
      fetchPriority="high"
      loading="eager"
      decoding="async"
    />
  );
}

function Hotspot({
  spot,
  index,
  open,
  onToggle,
}: {
  spot: HeroHotspot;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const { product } = spot;
  const image = product.featuredImage ?? product.images.nodes[0] ?? null;
  const align = spot.x > 72 ? "end" : spot.y < 32 ? "below" : "center";
  const label = spot.label ?? product.title;

  return (
    <div
      className="hotspot pointer-events-auto"
      data-open={open}
      data-align={align === "center" ? undefined : align}
      style={
        {
          left: `${spot.x}%`,
          top: `${spot.y}%`,
          "--delay": `${1400 + index * 140}ms`,
        } as CSSProperties
      }
    >
      <button
        type="button"
        className="hotspot-dot"
        aria-expanded={open}
        aria-label={`${label}: show product`}
        onClick={onToggle}
      >
        <Icon name="plus" size={18} strokeWidth={2.5} />
      </button>
      <div className="hotspot-card">
        <Link
          to={`/products/${product.handle}`}
          prefetch="intent"
          className="group bg-cream text-chocolate flex items-center gap-3 rounded-2xl p-2.5 pe-4 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.7)]"
        >
          {image ? (
            <img
              src={shopifyImageUrl(image.url, { width: 160 })}
              alt=""
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-xl object-cover"
              loading="lazy"
            />
          ) : null}
          <span className="min-w-0 flex-1">
            <span className="text-chocolate-muted block text-[0.7rem] font-bold tracking-[0.16em] uppercase">
              {label}
            </span>
            <span className="mt-0.5 line-clamp-2 text-sm leading-snug font-semibold">{product.title}</span>
            <span className="mt-1 flex items-center justify-between gap-2">
              <span className="font-bold">{formatPrice(product.priceRange.minVariantPrice)}</span>
              <span className="text-burgundy inline-flex items-center gap-1 text-xs font-bold">
                View
                <Icon
                  name="arrow-right"
                  size={14}
                  className="motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
                />
              </span>
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}

/** Phones and tablets: the hotspot products as a swipeable strip. */
function SceneStrip({ hotspots }: { hotspots: HeroHotspot[] }) {
  return (
    <div className="hero-in relative z-[2] pb-4 lg:hidden" style={{ "--delay": "1s" } as CSSProperties}>
      <p className="px-margin mb-2.5 text-[0.7rem] font-bold tracking-[0.2em] text-white/70 uppercase">
        Shop this scene
      </p>
      <ul role="list" className="rail !gap-2.5">
        {hotspots.map((spot) => {
          const image = spot.product.featuredImage ?? spot.product.images.nodes[0] ?? null;
          return (
            <li key={spot.product.id} className="w-[15.5rem]">
              <Link
                to={`/products/${spot.product.handle}`}
                className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-2 pe-3 text-white backdrop-blur-md"
              >
                {image ? (
                  <img
                    src={shopifyImageUrl(image.url, { width: 120 })}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 shrink-0 rounded-xl object-cover"
                    loading="lazy"
                  />
                ) : null}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{spot.label ?? spot.product.title}</span>
                  <span className="text-peach text-sm font-bold">
                    {formatPrice(spot.product.priceRange.minVariantPrice)}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Fixed positions (no Math.random → no hydration mismatch).
const MOTES = [
  [8, 78, 5, 9, 0, 0.7, 10],
  [14, 40, 4, 11, 2.2, 0.55, -8],
  [22, 64, 7, 8, 4.1, 0.8, 14],
  [31, 28, 3, 12, 1.1, 0.5, 6],
  [38, 84, 6, 10, 3.3, 0.75, -12],
  [46, 52, 4, 9, 5.6, 0.6, 10],
  [53, 18, 5, 13, 0.6, 0.55, -6],
  [58, 70, 8, 9.5, 2.8, 0.85, 16],
  [64, 36, 3, 11, 6.2, 0.5, 8],
  [70, 58, 5, 8.5, 1.7, 0.8, -10],
  [76, 22, 6, 12, 4.6, 0.6, 12],
  [82, 80, 4, 10, 0.3, 0.7, -14],
  [88, 48, 7, 9, 3.9, 0.8, 6],
  [94, 30, 3, 11.5, 2.4, 0.5, -8],
  [18, 90, 5, 10, 5.1, 0.65, 10],
  [66, 90, 4, 12, 6.8, 0.6, -10],
] as const;

function Motes() {
  return (
    <div className="motes z-[1]" aria-hidden="true">
      {MOTES.map(([left, top, size, duration, delay, opacity, dx]) => (
        <i
          key={`${left}-${top}`}
          style={
            {
              left: `${left}%`,
              top: `${top}%`,
              "--s": `${size}px`,
              "--d": `${duration}s`,
              "--delay": `${delay}s`,
              "--o": opacity,
              "--dx": `${dx}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/**
 * Pointer drift (desktop) + scroll drift, written straight to `translate` on
 * the parallax layers inside one rAF. Off for coarse pointers / reduced motion.
 */
function useHeroParallax(sectionRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layers = Array.from(section.querySelectorAll<HTMLElement>("[data-parallax]"));
    if (layers.length === 0) return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let px = 0;
    let py = 0;
    let sy = 0;
    let frame = 0;
    let visible = true;

    const apply = () => {
      frame = 0;
      const value = `${px.toFixed(1)}px ${(py + sy).toFixed(1)}px`;
      for (const layer of layers) layer.style.translate = value;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onPointer = (event: PointerEvent) => {
      if (!visible) return;
      const rect = section.getBoundingClientRect();
      px = -((event.clientX - rect.left) / rect.width - 0.5) * 18;
      py = -((event.clientY - rect.top) / rect.height - 0.5) * 12;
      schedule();
    };
    const onScroll = () => {
      if (!visible) return;
      sy = Math.min(window.scrollY, section.offsetHeight) * 0.18;
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(section);
    if (finePointer) section.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      section.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [sectionRef]);
}
