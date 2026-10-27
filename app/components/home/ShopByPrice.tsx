import type { CSSProperties } from "react";
import { Link } from "react-router";

import { Icon } from "~/components/ui/Icon";
import { CountUp } from "~/components/ui/CountUp";
import { Reveal } from "~/components/ui/Reveal";
import { SectionHeading } from "~/components/ui/SectionHeading";
import type { HomeCollection } from "~/lib/home";
import { shopifyImageUrl } from "~/lib/image";

const TONES = [
  "bg-burgundy text-cream",
  "bg-terracotta-deep text-white",
  "bg-chocolate text-cream",
];

/**
 * "Shop by price" tiles backed by real automated collections (under-500 …).
 * Hovering fans out the three product photos.
 */
export function ShopByPrice({
  tiers,
  freeDelivery = false,
}: {
  tiers: (HomeCollection & { max: number })[];
  freeDelivery?: boolean;
}) {
  const items = tiers.filter((tier) => tier.products.length > 0).slice(0, 3);
  if (items.length < 2) return null;
  // Each tile fans out different photos: skip products a cheaper tile already shows.
  const used = new Set<string>();
  const fans = items.map((tier) => {
    const fresh = tier.products.filter((product) => product.featuredImage && !used.has(product.id));
    const picks = (fresh.length >= 3 ? fresh : tier.products).slice(0, 3);
    picks.forEach((product) => used.add(product.id));
    return picks;
  });

  return (
    <section aria-labelledby="price-title" className="py-14 md:py-20">
      <div className="max-w-page px-margin mx-auto">
        <SectionHeading id="price-title" kicker="budget mein best" title="Shop by" accent="price" note="gifts sorted, wallet happy" />
        <Reveal>
        <ul role="list" className="stagger mt-8 grid gap-4 md:gap-6 lg:grid-cols-3">
          {items.map((tier, index) => (
            <li key={tier.handle}>
              <Link
                to={`/collections/${tier.handle}`}
                prefetch="intent"
                data-cursor="Shop"
                className={`price-tile group relative grid h-full grid-cols-[1fr_auto] items-center gap-4 overflow-hidden rounded-[1.75rem] p-6 md:p-7 ${TONES[index % TONES.length]}`}
              >
                <span className="relative z-10 flex h-full flex-col justify-between gap-6">
                  <span>
                    <span className="block text-xs font-bold tracking-[0.2em] uppercase">Under</span>
                    <span className="font-heading block text-[3.1rem] leading-none font-extrabold tracking-tight md:text-[3.7rem] lg:text-[2.9rem] xl:text-[3.3rem]">
                      <span className="sr-only">₹{tier.max.toLocaleString("en-IN")}</span>
                      <span aria-hidden="true">
                        ₹<CountUp value={tier.max} />
                      </span>
                    </span>
                  </span>
                  <span className="text-sm font-semibold">
                    {tier.products.length >= 8 ? "8+" : tier.products.length} finds{freeDelivery ? ", free delivery" : ""}
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-bold">
                    Shop now
                    <span className="grid size-8 place-items-center rounded-full bg-white/15 transition-transform duration-500 group-hover:translate-x-1 group-hover:-rotate-45">
                      <Icon name="arrow-right" size={16} />
                    </span>
                  </span>
                </span>
                <span aria-hidden="true" className="price-fan relative me-3 h-[8.5rem] w-[8.5rem] md:h-[9.5rem] md:w-[9.5rem] lg:h-[7.5rem] lg:w-[7.5rem] xl:h-[8.5rem] xl:w-[8.5rem]">
                  {fans[index].map((product, i) =>
                    product.featuredImage ? (
                      <img
                        key={product.id}
                        src={shopifyImageUrl(product.featuredImage.url, { width: 240 })}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full rounded-2xl border-[3px] border-white/90 object-cover shadow-[0_18px_40px_-18px_rgb(0_0_0/0.6)]"
                        style={{ "--f": i } as CSSProperties}
                      />
                    ) : null,
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        </Reveal>
      </div>
    </section>
  );
}
