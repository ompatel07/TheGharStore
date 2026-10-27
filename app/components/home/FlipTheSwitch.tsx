import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { StringLights } from "~/components/festive/Toran";
import type { ProductCardData } from "~/components/ProductCard";
import { Icon } from "~/components/ui/Icon";
import { SectionHeading } from "~/components/ui/SectionHeading";
import type { HomeImage } from "~/lib/home";
import { responsiveSrcSet, shopifyImageUrl } from "~/lib/image";
import { formatPrice } from "~/lib/money";

/**
 * "Flip the switch": a room photo sits in the dark until the visitor presses a
 * modular wall switch (the kind every Indian home has) — then the lights
 * flicker on and the lighting products slide in. It switches itself on once
 * when scrolled into view; the visitor can toggle it any time. Reduced motion
 * starts lit with no flicker.
 */
export function FlipTheSwitch({
  image,
  products,
  festive,
}: {
  image: HomeImage | null;
  products: ProductCardData[];
  festive: boolean;
}) {
  const [on, setOn] = useState(false);
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = window.setTimeout(() => setOn((current) => (touched ? current : true)), 1100);
      },
      { threshold: 0.45 },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [touched]);

  if (!image || products.length === 0) return null;

  return (
    <section
      ref={ref}
      aria-labelledby="switch-title"
      className="bg-night text-cream relative overflow-hidden py-20 md:py-28"
      data-lit={on}
    >
      {festive ? <StringLights className="opacity-80" /> : null}
      <div className="max-w-page px-margin relative mx-auto grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div className="switch-room relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)]">
          <img
            src={shopifyImageUrl(image.url, { width: 1100 })}
            srcSet={responsiveSrcSet(image.url, [600, 900, 1254], image.width)}
            sizes="(min-width: 1024px) 55vw, 100vw"
            alt={image.altText ?? "Floating lotus lights glowing in a bowl"}
            className="switch-photo absolute inset-0 h-full w-full object-cover object-[50%_75%]"
            loading="lazy"
          />
          <span aria-hidden="true" className="switch-glow absolute inset-0" />
          <span aria-hidden="true" className="switch-dark absolute inset-0" />
        </div>

        <div className="min-w-0">
          <SectionHeading
            id="switch-title"
            tone="dark"
            kicker={on ? "ab hui na baat!" : "thoda andhera hai…"}
            title="Flip the"
            accent="switch"
            note="go on, press it"
          />
          <p className="text-cream/75 mt-5 max-w-md text-lg">
            Flameless lotus diyas, little house lanterns and warm string lights. Soft glow for every corner, no oil, no
            smoke.
          </p>

          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label="Room lights"
            onClick={() => {
              setTouched(true);
              setOn((current) => !current);
            }}
            className="wall-switch mt-8"
          >
            <span className="wall-switch-plate">
              <span className="wall-switch-rocker">
                <span className="wall-switch-led" />
              </span>
            </span>
            <span className="text-cream/80 text-sm font-bold tracking-[0.16em] uppercase">{on ? "Lights on" : "Lights off"}</span>
          </button>

          <ul role="list" className="switch-products mt-9 grid grid-cols-[minmax(0,1fr)] gap-3">
            {products.slice(0, 3).map((product, index) => (
              <li key={product.id} style={{ "--i": index } as React.CSSProperties}>
                <Link
                  to={`/products/${product.handle}`}
                  prefetch="intent"
                  data-cursor="View"
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-2.5 pe-4 transition-colors hover:bg-white/10"
                >
                  {product.featuredImage ? (
                    <img
                      src={shopifyImageUrl(product.featuredImage.url, { width: 160 })}
                      alt=""
                      className="size-16 shrink-0 rounded-xl object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{product.title}</span>
                    <span className="text-peach font-bold">{formatPrice(product.priceRange.minVariantPrice)}</span>
                  </span>
                  <span className="bg-cream text-chocolate grid size-10 shrink-0 place-items-center rounded-full transition-transform duration-500 group-hover:-rotate-45">
                    <Icon name="arrow-right" size={18} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
