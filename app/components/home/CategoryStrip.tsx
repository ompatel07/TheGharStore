import { Link } from "react-router";

import { Icon, isIconName, type IconName } from "~/components/ui/Icon";
import type { HomeCollection } from "~/lib/home";

/**
 * Default icon per collection until the collection's `custom.icon` metafield is set.
 * Matched on handle keywords so renamed titles keep their icon.
 */
const ICON_BY_KEYWORD: [RegExp, IconName][] = [
  [/jugaad|diy|improve|repair|tool/, "roller"],
  [/sajavat|decor|décor/, "vase"],
  [/rasoi|kitchen|dining/, "kadhai"],
  [/sambhal|clean|care-essential|home-care/, "spray"],
  [/roshan|light|lamp/, "bulb"],
  [/paudha|garden|plant/, "plant"],
  [/diwali|festive|festival/, "diya"],
  [/storage|organi/, "box"],
  [/gift/, "gift"],
];

export function collectionIcon(
  collection: Pick<HomeCollection, "handle" | "icon">,
): IconName {
  if (isIconName(collection.icon)) return collection.icon;
  const match = ICON_BY_KEYWORD.find(([pattern]) =>
    pattern.test(collection.handle),
  );
  return match?.[1] ?? "grid";
}

export function CategoryStrip({
  categories,
}: {
  categories: HomeCollection[];
}) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="category-strip-title" className="relative z-10">
      <div className="max-w-page px-margin mx-auto">
        <div className="curve-top bg-white/80 px-3 pt-8 pb-6 shadow-[0_-18px_40px_-30px_rgb(56_44_42/0.4)] backdrop-blur-sm md:px-8">
          <h2 id="category-strip-title" className="sr-only">
            Shop by category
          </h2>
          <ul
            role="list"
            className="scrollbar-none -mx-3 flex snap-x gap-2 overflow-x-auto px-3 md:mx-0 md:justify-between md:gap-0 md:overflow-visible md:px-0"
          >
            {categories.map((category, index) => (
              <li
                key={category.handle}
                className="flex shrink-0 snap-start md:flex-1 md:justify-center md:[&+&]:border-s md:[&+&]:border-[color-mix(in_oklab,var(--color-gold)_45%,transparent)]"
              >
                <Link
                  to={`/collections/${category.handle}`}
                  prefetch="intent"
                  className="category-link group hover:bg-peach-soft/60 flex w-24 flex-col items-center gap-2 rounded-3xl px-2 py-2 text-center md:w-auto md:flex-row md:gap-3 md:px-4 md:text-start"
                >
                  <span className="icon-chip bg-peach-soft [--chip-size:3.75rem] md:[--chip-size:4.25rem]">
                    <Icon
                      name={collectionIcon(category)}
                      size={30}
                      strokeWidth={1.6}
                      className={`category-icon category-icon-${index % 3}`}
                    />
                  </span>
                  <span className="text-on-surface text-[0.85rem] leading-tight font-semibold md:max-w-[8rem] md:text-[0.95rem]">
                    {category.label}
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
