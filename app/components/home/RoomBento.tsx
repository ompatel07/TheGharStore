import { Link } from "react-router";

import { collectionIcon } from "~/components/home/CategoryStrip";
import { Icon } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";
import type { HomeCollection } from "~/lib/home";
import { shopifyImageUrl } from "~/lib/image";

// Asymmetric bento: the first tile is the hero tile; the rest flow around it.
const SPANS = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-1",
  "md:col-span-2 md:row-span-1",
];

/** "Shop by room" — collections as arch-windowed bento tiles. */
export function RoomBento({ collections }: { collections: HomeCollection[] }) {
  const tiles = collections
    .filter((collection) => collection.image)
    .slice(0, 6);
  if (tiles.length < 3) return null;

  return (
    <section
      aria-labelledby="rooms-title"
      className="max-w-page px-margin mx-auto py-20 md:py-28"
    >
      <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="type-hand text-terracotta-deep text-2xl md:text-3xl">
            ghar ke har kone ke liye
          </p>
          <h2 id="rooms-title" className="display-lg text-on-surface mt-1">
            Shop by <span className="text-outline">room</span>
          </h2>
        </div>
        <Link
          to="/collections"
          className="text-burgundy hover:bg-peach-soft inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-bold"
        >
          All categories <Icon name="arrow-right" size={18} />
        </Link>
      </Reveal>

      <ul
        role="list"
        className="grid auto-rows-[15rem] grid-cols-2 gap-3 md:auto-rows-[17rem] md:grid-cols-4 md:gap-5"
      >
        {tiles.map((collection, index) => (
          <Reveal
            as="li"
            key={collection.handle}
            delay={index * 70}
            className={`${SPANS[index] ?? ""} ${index === 0 ? "col-span-2 row-span-2" : ""}`}
          >
            <Link
              to={`/collections/${collection.handle}`}
              prefetch="intent"
              className="bento-tile group bg-cream-deep relative flex h-full flex-col justify-end overflow-hidden rounded-[var(--radius-xl)] p-4 shadow-[var(--shadow)] md:p-6"
            >
              {collection.image ? (
                <img
                  src={shopifyImageUrl(collection.image.url, {
                    width: index === 0 ? 1000 : 600,
                  })}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[rgb(56_44_42/0.85)] via-[rgb(56_44_42/0.25)] to-transparent"
              />
              <span className="relative flex items-end justify-between gap-3">
                <span>
                  <span className="icon-chip mb-3 bg-white/90 [--chip-size:2.75rem]">
                    <Icon name={collectionIcon(collection)} size={22} />
                  </span>
                  <span
                    className={`font-heading block leading-none font-extrabold tracking-tight text-white ${
                      index === 0
                        ? "text-4xl md:text-6xl"
                        : "text-2xl md:text-3xl"
                    }`}
                  >
                    {collection.label}
                  </span>
                  {collection.description ? (
                    <span className="mt-1.5 block text-sm text-white/80 md:text-base">
                      {collection.description}
                    </span>
                  ) : null}
                </span>
                <span className="bento-arrow bg-cream text-chocolate inline-grid size-11 shrink-0 place-items-center rounded-full">
                  <Icon name="arrow-right" size={20} strokeWidth={2.25} />
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
