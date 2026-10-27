import type { CSSProperties } from "react";
import { Link } from "react-router";

import { Icon } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";
import { SectionHeading } from "~/components/ui/SectionHeading";
import type { HomeCollection } from "~/lib/home";
import { shopifyImageUrl } from "~/lib/image";

const PRICE_TONES = ["bg-burgundy", "bg-terracotta-deep", "bg-chocolate"];

/**
 * Story-style category bubbles on a dotted band: categories, then price
 * shortcuts, then "Shop all". Each bubble has a slowly turning festive ring;
 * hover / focus / tap lifts the photo. The row pops in one bubble at a time.
 */
export function CategoryBubbles({
  collections,
  priceTiers = [],
}: {
  collections: HomeCollection[];
  priceTiers?: (HomeCollection & { max: number })[];
}) {
  const items = collections.filter((collection) => collection.image).slice(0, 7);
  if (items.length < 2) return null;

  return (
    <section aria-labelledby="bubbles-title" className="bg-cream-deep dot-pattern relative py-12 md:py-16">
      <div className="max-w-page px-margin mx-auto">
        <SectionHeading
          id="bubbles-title"
          kicker="ghar ke har kone ke liye"
          title="Shop by"
          accent="category"
          size="md"
          align="center"
        />
      </div>
      <Reveal className="mt-8">
        <ul role="list" className="stagger rail !gap-4 lg:justify-center lg:!gap-7">
          {items.map((collection, index) => (
            <li key={collection.handle}>
              <Bubble to={`/collections/${collection.handle}`} label={collection.label} index={index}>
                {collection.image ? (
                  <img
                    src={shopifyImageUrl(collection.image.url, { width: 260 })}
                    alt=""
                    width={120}
                    height={120}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </Bubble>
            </li>
          ))}
          {priceTiers.slice(0, 2).map((tier, index) => (
            <li key={tier.handle}>
              <Bubble to={`/collections/${tier.handle}`} label={`Under ₹${tier.max.toLocaleString("en-IN")}`} index={items.length + index}>
                <span className={`text-cream grid h-full w-full place-items-center ${PRICE_TONES[index % PRICE_TONES.length]}`}>
                  <span className="font-heading text-center leading-none font-extrabold">
                    <span className="block text-[0.6rem] tracking-[0.18em] uppercase opacity-80">under</span>
                    <span className="text-xl md:text-2xl">₹{tier.max}</span>
                  </span>
                </span>
              </Bubble>
            </li>
          ))}
          <li>
            <Bubble to="/collections/all" label="Shop all" index={items.length + 2}>
              <span className="bg-chocolate text-cream grid h-full w-full place-items-center">
                <Icon name="grid" size={30} />
              </span>
            </Bubble>
          </li>
        </ul>
      </Reveal>
    </section>
  );
}

function Bubble({
  to,
  label,
  index,
  children,
}: {
  to: string;
  label: string;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      prefetch="intent"
      className="bubble group flex w-[5.75rem] flex-col items-center gap-2.5 text-center md:w-[7.25rem]"
      style={{ "--i": index } as CSSProperties}
    >
      <span className="bubble-ring relative grid size-[5.75rem] place-items-center rounded-full md:size-[7.25rem]">
        <span className="bubble-photo relative size-[calc(100%-8px)] overflow-hidden rounded-full border-[3px] border-[var(--color-cream)] bg-[var(--color-cream)]">
          {children}
        </span>
      </span>
      <span className="text-on-surface text-[0.82rem] leading-tight font-bold md:text-sm">{label}</span>
    </Link>
  );
}
