import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Link } from "react-router";

import { ProductCard, type ProductCardData } from "~/components/ProductCard";
import { Icon } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";
import { SectionHeading } from "~/components/ui/SectionHeading";
import type { HomeCollection } from "~/lib/home";

type Tab = { id: string; label: string; to: string; products: ProductCardData[] };

/**
 * "Bestsellers" with category tabs (ARIA tabs, arrow-key navigation). The grid
 * re-mounts per tab so cards rise in with a short stagger.
 */
export function BestsellerTabs({
  all,
  categories,
}: {
  all: ProductCardData[];
  categories: HomeCollection[];
}) {
  const tabs: Tab[] = [
    { id: "all", label: "All", to: "/collections/all", products: all },
    ...categories
      .filter((collection) => collection.products.length >= 2)
      .slice(0, 4)
      .map((collection) => ({
        id: collection.handle,
        label: collection.label,
        to: `/collections/${collection.handle}`,
        products: collection.products,
      })),
  ].filter((tab) => tab.products.length > 0);

  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  if (tabs.length === 0 || all.length < 4) return null;
  const current = tabs[active] ?? tabs[0];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (active + delta + tabs.length) % tabs.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section aria-labelledby="best-title" className="py-14 md:py-20">
      <div className="max-w-page px-margin mx-auto">
        <SectionHeading
          id="best-title"
          kicker="sabse pyaare"
          title="Our"
          accent="bestsellers"
          note="free delivery on every one!"
          aside={
            <Link to={current.to} prefetch="intent" className="btn btn-outline">
              View all {current.id === "all" ? "products" : current.label}
              <Icon name="arrow-right" size={18} />
            </Link>
          }
        />

        <div
          role="tablist"
          aria-label="Bestseller categories"
          className="scrollbar-none -mx-[var(--spacing-margin)] mt-7 flex gap-2 overflow-x-auto px-[var(--spacing-margin)] pb-1"
        >
          {tabs.map((tab, index) => {
            const selected = index === active;
            return (
              <button
                key={tab.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={onKeyDown}
                className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-5 text-sm font-bold whitespace-nowrap transition-[background-color,color,border-color] duration-300 ${
                  selected
                    ? "bg-chocolate border-chocolate text-cream"
                    : "border-chocolate/20 text-on-surface hover:border-chocolate/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <Reveal key={current.id} className="mt-8">
        <ul
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${current.id}`}
          className="stagger grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4"
        >
          {current.products.slice(0, 8).map((product, index) => (
            <li
              key={product.id}
              className={`stagger-in ${index >= 6 ? "max-lg:hidden" : ""} ${index >= 4 ? "max-md:hidden" : ""}`}
              style={{ "--i": index } as CSSProperties}
            >
              <ProductCard product={product} compact />
            </li>
          ))}
        </ul>
        </Reveal>
      </div>
    </section>
  );
}
