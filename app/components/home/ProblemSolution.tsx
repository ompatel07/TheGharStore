import { useState } from "react";
import { Link } from "react-router";

import type { ProductCardData } from "~/components/ProductCard";
import { Icon } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";
import { shopifyImageUrl } from "~/lib/image";
import { formatPrice } from "~/lib/money";
import type { Problem } from "~/lib/problems";

type Pair = { problem: Problem; product: ProductCardData };

/**
 * Flip cards: a household problem on the front, the product that helps on the
 * back. Flips on hover / keyboard focus (desktop) or a tap (touch). Both faces
 * are always in the DOM, so screen readers get the problem and the solution.
 */
export function ProblemSolution({ pairs }: { pairs: Pair[] }) {
  if (pairs.length < 4) return null;

  return (
    <section
      aria-labelledby="jugaad-title"
      className="bg-cream-deep curve-top curve-bottom relative overflow-hidden py-20 md:py-28"
    >
      <div className="max-w-page px-margin mx-auto">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center">
          <p className="type-hand text-terracotta-deep text-2xl md:text-3xl">
            har ghar ki kahani
          </p>
          <h2 id="jugaad-title" className="display-lg text-on-surface mt-1">
            Chhoti problems,{" "}
            <span className="text-terracotta-deep">smart jugaad</span>
          </h2>
          <p className="text-on-surface-secondary mt-4 text-lg">
            Tap a card to see the fix.
          </p>
        </Reveal>
        <ul
          role="list"
          className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4"
        >
          {pairs.map((pair, index) => (
            <Reveal
              as="li"
              key={pair.product.id}
              delay={(index % 4) * 80}
              className="h-[19rem] md:h-[22rem]"
            >
              <FlipCard pair={pair} index={index} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

const FRONTS = [
  {
    card: "bg-white",
    text: "text-on-surface",
    hint: "text-terracotta-deep",
    chip: "",
    num: "text-outline",
  },
  {
    card: "bg-peach",
    text: "text-chocolate",
    hint: "text-burgundy",
    chip: "bg-white",
    num: "text-outline",
  },
  {
    card: "bg-chocolate",
    text: "text-cream",
    hint: "text-peach",
    chip: "bg-cream/10 text-peach",
    num: "text-outline-cream",
  },
  {
    card: "bg-terracotta-deep",
    text: "text-white",
    hint: "text-cream",
    chip: "bg-white/15 text-white",
    num: "text-outline-cream",
  },
];

function FlipCard({ pair, index }: { pair: Pair; index: number }) {
  // Palette order with no vertical or horizontal repeats on 2- or 4-column grids.
  const ORDER = [0, 1, 2, 3, 3, 2, 1, 0];
  const style = FRONTS[ORDER[index % ORDER.length]];
  const [flipped, setFlipped] = useState(false);
  const { problem, product } = pair;
  const image = product.featuredImage ?? product.images.nodes[0] ?? null;

  return (
    <div className={`flip h-full ${flipped ? "is-flipped" : ""}`}>
      <div className="flip-inner">
        <button
          type="button"
          onClick={() => setFlipped(true)}
          className={`flip-face flex flex-col justify-between p-5 text-start shadow-[var(--shadow)] md:p-7 ${style.card}`}
          aria-label={`${problem.problem} Show the fix`}
        >
          <span className="flex items-start justify-between">
            <span
              className={`icon-chip [--chip-size:3.5rem] md:[--chip-size:4rem] ${style.chip}`}
            >
              <Icon name={problem.icon} size={28} />
            </span>
            <span
              aria-hidden="true"
              className={`font-heading text-5xl leading-none font-extrabold md:text-6xl ${style.num}`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </span>
          <span
            className={`font-heading text-xl leading-tight font-extrabold tracking-tight md:text-[1.7rem] ${style.text}`}
          >
            {problem.problem}
          </span>
          <span
            className={`type-hand inline-flex items-center gap-1.5 text-lg ${style.hint}`}
          >
            <span className="md:hidden">tap to flip</span>
            <span className="max-md:hidden">flip for the jugaad</span>
            <Icon name="arrow-right" size={16} />
          </span>
        </button>

        <div className="flip-face flip-back bg-chocolate text-cream flex flex-col">
          <div className="relative h-[55%] bg-white">
            {image ? (
              <img
                src={shopifyImageUrl(image.url, { width: 480 })}
                alt={image.altText || product.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : null}
            <button
              type="button"
              onClick={() => setFlipped(false)}
              className="bg-chocolate/80 absolute end-2 top-2 inline-grid size-9 place-items-center rounded-full text-white md:hidden"
              aria-label="Show the problem again"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
          <div className="flex flex-1 flex-col justify-between gap-2 p-4 md:p-5">
            <p className="text-cream/85 text-sm leading-snug md:text-[0.95rem]">
              {problem.fix}
            </p>
            <div className="flex items-end justify-between gap-2">
              <Link
                to={`/products/${product.handle}`}
                className="text-cream line-clamp-2 text-sm font-bold underline-offset-4 hover:underline md:text-base"
              >
                {product.title}
              </Link>
              <span className="text-peach shrink-0 text-lg font-extrabold">
                {formatPrice(product.priceRange.minVariantPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
