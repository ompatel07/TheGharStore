import { useState, type CSSProperties } from "react";
import { Link } from "react-router";

import type { ProductCardData } from "~/components/ProductCard";
import { Icon } from "~/components/ui/Icon";
import { SectionHeading } from "~/components/ui/SectionHeading";
import { Wave } from "~/components/ui/Wave";
import { shopifyImageUrl } from "~/lib/image";
import { formatPrice } from "~/lib/money";

export type Way = { word: string; hint: string; product: ProductCardData };

/**
 * "So many ways to love your ghar": giant verbs on a peach block beside a
 * framed preview. Hovering / focusing a verb dims the others and swaps the
 * preview (photo crossfade + tilt). Every verb is a plain link to its product.
 * Phones: the verbs with a thumbnail beside each, no preview panel.
 */
export function WaysToGhar({ ways, freeDelivery = false }: { ways: Way[]; freeDelivery?: boolean }) {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  if (ways.length < 3) return null;
  const current = ways[active] ?? ways[0];

  return (
    <>
      <Wave className="text-peach -mb-px" />
      <section aria-labelledby="ways-title" className="ways bg-peach relative overflow-hidden py-16 md:py-24" data-active={hovering}>
        <div className="max-w-page px-margin relative mx-auto">
          <SectionHeading id="ways-title" kicker="ek ghar, kayi kaam" title="So many ways to love your" accent="ghar" />

          <div className="mt-10 grid items-center gap-10 md:mt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <ul role="list" className="ways-list grid gap-1" onPointerLeave={() => setHovering(false)}>
              {ways.map((way, index) => (
                <li key={way.word} className="ways-item" data-on={active === index} style={{ "--i": index } as CSSProperties}>
                  <Link
                    to={`/products/${way.product.handle}`}
                    prefetch="intent"
                    data-cursor="View"
                    onPointerEnter={() => {
                      setActive(index);
                      setHovering(true);
                    }}
                    onFocus={() => {
                      setActive(index);
                      setHovering(true);
                    }}
                    onBlur={() => setHovering(false)}
                    className="ways-word font-heading text-chocolate flex items-center gap-4 py-1 text-[clamp(2.4rem,1.5rem+3.6vw,5rem)] leading-[1.02] font-extrabold tracking-tight"
                  >
                    {way.product.featuredImage ? (
                      <img
                        src={shopifyImageUrl(way.product.featuredImage.url, { width: 140 })}
                        alt=""
                        className="size-12 shrink-0 rounded-xl object-cover lg:hidden"
                        loading="lazy"
                      />
                    ) : null}
                    <span>{way.word}</span>
                    <span className="ways-hint type-hand text-burgundy hidden text-xl md:inline">{way.hint}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div aria-hidden="true" className="ways-preview relative hidden lg:block">
              <div className="ways-frame bg-cream relative rounded-[2rem] p-4 pb-5 shadow-[0_40px_80px_-30px_rgb(56_44_42/0.55)]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem] bg-[var(--color-cream-deep)]">
                  {ways.map((way, index) =>
                    way.product.featuredImage ? (
                      <img
                        key={way.word}
                        src={shopifyImageUrl(way.product.featuredImage.url, { width: 760 })}
                        alt=""
                        loading="lazy"
                        data-on={active === index}
                        className="ways-photo absolute inset-0 h-full w-full object-cover"
                      />
                    ) : null,
                  )}
                </div>
                <div className="mt-4 flex items-end justify-between gap-4 px-1">
                  <div className="min-w-0">
                    <p key={current.word} className="type-hand text-terracotta-deep stagger-in text-xl">
                      {current.word.toLowerCase()}, {current.hint}
                    </p>
                    <p className="text-on-surface mt-0.5 truncate font-bold">{current.product.title}</p>
                  </div>
                  <p className="font-heading text-on-surface shrink-0 text-2xl font-extrabold">
                    {formatPrice(current.product.priceRange.minVariantPrice)}
                  </p>
                </div>
              </div>
              {freeDelivery ? (
              <span className="bg-chocolate text-cream absolute -top-4 -right-4 grid size-20 rotate-12 place-items-center rounded-full text-center text-xs leading-tight font-bold shadow-[var(--shadow-lg)]">
                <span>
                  <Icon name="truck" size={18} className="mx-auto mb-0.5" />
                  free
                  <br />
                  delivery
                </span>
              </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <Wave flip className="text-peach -mt-px" />
    </>
  );
}
