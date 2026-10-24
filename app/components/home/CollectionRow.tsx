import { Link } from "react-router";

import { ProductCard } from "~/components/ProductCard";
import { Icon } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";
import type { HomeCollection } from "~/lib/home";

export function CollectionRow({ collection }: { collection: HomeCollection }) {
  const headingId = `row-${collection.handle}`;

  return (
    <Reveal as="section" aria-labelledby={headingId} className="py-10 md:py-14">
      <div className="max-w-page px-margin mx-auto">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 id={headingId} className="type-heading-xl text-on-surface">
              {collection.title}
            </h2>
            {collection.description ? (
              <p className="text-on-surface-secondary mt-1.5 max-w-xl">
                {collection.description}
              </p>
            ) : null}
          </div>
          <Link
            to={`/collections/${collection.handle}`}
            prefetch="intent"
            className="text-burgundy hover:bg-peach-soft inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 font-semibold"
          >
            View all
            <span className="sr-only"> {collection.title}</span>
            <Icon name="arrow-right" size={18} />
          </Link>
        </div>
        <ul
          role="list"
          className="scrollbar-none -mx-[var(--spacing-margin)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--spacing-margin)] pt-1 pb-6 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-4"
        >
          {collection.products.slice(0, 8).map((product, index) => (
            <li
              key={product.id}
              className={`w-[46%] shrink-0 snap-start md:w-auto ${index >= 4 ? "lg:hidden" : ""} ${index >= 3 ? "md:max-lg:hidden" : ""}`}
            >
              <ProductCard product={product} compact />
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
