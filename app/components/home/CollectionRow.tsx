import { Link } from "react-router";

import { ProductCard } from "~/components/ProductCard";
import { Icon } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";
import type { HomeCollection } from "~/lib/home";

export function CollectionRow({ collection }: { collection: HomeCollection }) {
  const headingId = `row-${collection.handle}`;

  return (
    <Reveal as="section" aria-labelledby={headingId} className="py-14 md:py-20">
      <div className="max-w-page px-margin mx-auto">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-terracotta-deep">Collection</p>
            <h2 id={headingId} className="ed-display ed-md text-on-surface mt-3">
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
            className="text-on-surface inline-flex min-h-11 shrink-0 items-center gap-1.5 font-semibold"
          >
            <span className="link-sweep">View all</span>
            <span className="sr-only"> {collection.title}</span>
            <Icon name="arrow-right" size={18} />
          </Link>
        </div>
        <ul
          role="list"
          className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4"
        >
          {collection.products.slice(0, 8).map((product, index) => (
            <li
              key={product.id}
              className={`${index >= 4 ? "max-md:hidden lg:hidden" : ""} ${index >= 3 ? "md:max-lg:hidden" : ""}`}
            >
              <ProductCard product={product} compact />
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
