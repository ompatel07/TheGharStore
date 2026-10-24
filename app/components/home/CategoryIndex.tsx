import { useState } from "react";
import { Link } from "react-router";

import { Icon } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";
import type { HomeCollection } from "~/lib/home";
import { responsiveSrcSet, shopifyImageUrl } from "~/lib/image";

/**
 * "Shop by category" as an editorial index. Desktop: a big serif list where
 * hovering / focusing a row swaps the image stage beside it (clip + fade).
 * Phones: a swipeable rail of tall image cards. Every row is a plain link.
 */
export function CategoryIndex({ collections }: { collections: HomeCollection[] }) {
  const items = collections.filter((collection) => collection.image).slice(0, 6);
  const [active, setActive] = useState(0);
  if (items.length < 2) return null;

  return (
    <section aria-labelledby="categories-title" className="py-20 md:py-28">
      <div className="max-w-page px-margin mx-auto">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-terracotta-deep">Shop by category</p>
            <h2 id="categories-title" className="ed-display ed-lg text-on-surface mt-4">
              Something for <em className="text-burgundy">every corner</em>
            </h2>
          </div>
          <Link to="/collections" className="text-on-surface inline-flex min-h-11 items-center gap-2 font-semibold">
            <span className="link-sweep">All categories</span>
            <Icon name="arrow-right" size={18} />
          </Link>
        </Reveal>
      </div>

      {/* Phones / tablets: tall swipe cards */}
      <ul role="list" className="rail mt-10 lg:hidden">
        {items.map((collection, index) => (
          <li key={collection.handle} className="w-[72vw] max-w-[20rem]">
            <Link
              to={`/collections/${collection.handle}`}
              prefetch="intent"
              className="group relative block aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-[var(--color-cream-deep)]"
            >
              {collection.image ? (
                <img
                  src={shopifyImageUrl(collection.image.url, { width: 640 })}
                  srcSet={responsiveSrcSet(collection.image.url, [360, 540, 720], collection.image.width)}
                  sizes="72vw"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[rgb(31_22_20/0.88)] via-[rgb(31_22_20/0.2)] to-transparent"
              />
              <span className="absolute inset-x-0 bottom-0 p-5 text-white">
                <span className="text-peach block text-xs font-bold tracking-[0.2em]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="ed-display mt-1 block text-[2rem] leading-none">{collection.label}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white/85">
                  Shop now <Icon name="arrow-right" size={16} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: index + stage */}
      <div className="max-w-page px-margin mx-auto mt-14 hidden grid-cols-[1.1fr_1fr] items-start gap-16 lg:grid">
        <ol className="border-border border-t">
          {items.map((collection, index) => (
            <li key={collection.handle} className="border-border border-b">
              <Link
                to={`/collections/${collection.handle}`}
                prefetch="intent"
                data-active={active === index}
                onPointerEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className="cat-row text-on-surface flex items-center gap-6 py-7"
              >
                <span className="text-on-surface-secondary w-8 shrink-0 text-sm font-bold tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="cat-name ed-display block text-[clamp(2.2rem,1.2rem+2vw,3.6rem)] leading-none">
                    {collection.label}
                  </span>
                  {collection.description ? (
                    <span className="text-on-surface-secondary mt-2 line-clamp-1 block max-w-md text-[0.95rem]">
                      {collection.description}
                    </span>
                  ) : null}
                </span>
                <span className="cat-arrow bg-chocolate text-cream grid size-12 shrink-0 place-items-center rounded-full">
                  <Icon name="arrow-right" size={20} />
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="cat-stage sticky top-28 aspect-[4/5] max-h-[78vh] w-full" aria-hidden="true">
          {items.map((collection, index) => (
            <figure key={collection.handle} data-active={active === index} className="overflow-hidden rounded-[2rem]">
              {collection.image ? (
                <img
                  src={shopifyImageUrl(collection.image.url, { width: 900 })}
                  srcSet={responsiveSrcSet(collection.image.url, [600, 900, 1200], collection.image.width)}
                  sizes="40vw"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
              <span className="absolute inset-0 bg-gradient-to-t from-[rgb(31_22_20/0.75)] via-transparent to-transparent" />
              {collection.products.length > 1 ? (
                <figcaption className="absolute inset-x-5 bottom-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 text-white backdrop-blur-md">
                  <span className="flex -space-x-3">
                    {collection.products.slice(0, 3).map((product) =>
                      product.featuredImage ? (
                        <img
                          key={product.id}
                          src={shopifyImageUrl(product.featuredImage.url, { width: 120 })}
                          alt=""
                          className="size-12 rounded-full border-2 border-white/80 object-cover"
                          loading="lazy"
                        />
                      ) : null,
                    )}
                  </span>
                  <span className="text-sm leading-snug">
                    <span className="block font-semibold">{collection.label}</span>
                    <span className="text-white/75">
                      {collection.products.length >= 8 ? "8+" : collection.products.length} finds to explore
                    </span>
                  </span>
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
