import type { CSSProperties } from "react";
import { Link } from "react-router";

import type { ProductCardData } from "~/components/ProductCard";
import { Spark } from "~/components/ui/Ornaments";
import { shopifyImageUrl } from "~/lib/image";
import { formatPrice } from "~/lib/money";

/**
 * Two tilted rows of real product photos gliding in opposite directions on a
 * burgundy band, with the brand line in the middle. Each tile links to its
 * product; hovering pauses the band. Static under reduced motion.
 */
export function ProductRibbon({ products, title = "Smart finds. Better homes." }: { products: ProductCardData[]; title?: string }) {
  const items = products.flatMap((product) =>
    product.featuredImage ? [{ ...product, image: product.featuredImage }] : [],
  );
  if (items.length < 6) return null;
  const half = Math.ceil(items.length / 2);
  // Second row starts halfway through the catalogue (wrapping) so rows differ.
  const rows = [items.slice(0, half), [...items.slice(half), ...items].slice(0, half)];

  return (
    <section aria-label="Browse the store" className="ribbon bg-burgundy relative overflow-hidden py-14 md:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_50%,rgb(239_119_86/0.35),transparent_70%)]"
      />
      <div className="-rotate-3 scale-[1.06]">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={`overflow-hidden ${rowIndex === 1 ? "mt-4" : ""}`}>
            <ul
              role="list"
              className="ribbon-row"
              data-dir={rowIndex === 1 ? "right" : "left"}
              style={{ "--dur": `${rowIndex === 1 ? 70 : 60}s` } as CSSProperties}
            >
              {[...row, ...row].map((product, index) => (
                <li key={`${product.id}-${index}`} aria-hidden={index >= row.length || undefined}>
                  <Link
                    to={`/products/${product.handle}`}
                    tabIndex={index >= row.length ? -1 : undefined}
                    className="ribbon-item group bg-cream flex w-[15rem] items-center gap-3 rounded-2xl p-2 pe-4 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)] md:w-[18rem]"
                  >
                    <img
                      src={shopifyImageUrl(product.image.url, { width: 200 })}
                      alt=""
                      width={80}
                      height={80}
                      loading="lazy"
                      className="size-16 shrink-0 rounded-xl object-cover md:size-20"
                    />
                    <span className="min-w-0">
                      <span className="text-on-surface line-clamp-2 text-sm leading-snug font-semibold">{product.title}</span>
                      <span className="text-burgundy mt-0.5 block font-bold">
                        {formatPrice(product.priceRange.minVariantPrice)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="font-heading text-cream relative mt-12 flex items-center justify-center gap-4 px-4 text-center text-3xl font-extrabold tracking-tight md:text-5xl">
        <Spark className="text-gold sh-spark size-6 shrink-0" />
        {title}
        <Spark className="text-gold sh-spark size-6 shrink-0" />
      </p>
    </section>
  );
}
