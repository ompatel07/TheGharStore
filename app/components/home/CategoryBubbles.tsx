import type { CSSProperties } from "react";
import { Link } from "react-router";

import { Icon } from "~/components/ui/Icon";
import type { HomeCollection } from "~/lib/home";
import { shopifyImageUrl } from "~/lib/image";

/**
 * Story-style category bubbles (the row Indian shoppers expect right under the
 * hero). Each bubble has a slowly turning festive ring; hover / focus / tap
 * lifts the photo and spins the ring faster. Transform-only, static under
 * reduced motion.
 */
export function CategoryBubbles({ collections }: { collections: HomeCollection[] }) {
  const items = collections.filter((collection) => collection.image).slice(0, 8);
  if (items.length < 2) return null;

  return (
    <section aria-labelledby="bubbles-title" className="pt-10 pb-4 md:pt-14">
      <h2 id="bubbles-title" className="sr-only">
        Shop by category
      </h2>
      <ul role="list" className="rail !gap-4 md:justify-center md:!gap-8">
        {items.map((collection, index) => (
          <li key={collection.handle}>
            <Link
              to={`/collections/${collection.handle}`}
              prefetch="intent"
              className="bubble group flex w-[5.75rem] flex-col items-center gap-2.5 text-center md:w-[7.5rem]"
              style={{ "--i": index } as CSSProperties}
            >
              <span className="bubble-ring relative grid size-[5.75rem] place-items-center rounded-full md:size-[7.5rem]">
                <span className="bubble-photo relative size-[calc(100%-8px)] overflow-hidden rounded-full border-[3px] border-[var(--color-cream)] bg-[var(--color-cream-deep)]">
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
                </span>
              </span>
              <span className="text-on-surface text-[0.82rem] leading-tight font-bold md:text-sm">
                {collection.label}
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            to="/collections/all"
            prefetch="intent"
            className="bubble group flex w-[5.75rem] flex-col items-center gap-2.5 text-center md:w-[7.5rem]"
          >
            <span className="bubble-ring relative grid size-[5.75rem] place-items-center rounded-full md:size-[7.5rem]">
              <span className="bubble-photo bg-burgundy text-cream grid size-[calc(100%-8px)] place-items-center rounded-full border-[3px] border-[var(--color-cream)]">
                <Icon name="grid" size={30} />
              </span>
            </span>
            <span className="text-on-surface text-[0.82rem] leading-tight font-bold md:text-sm">Shop all</span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
