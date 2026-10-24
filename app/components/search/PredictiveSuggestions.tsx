import { getPredictiveSearchItemUrl, getSearchResultUrl } from "@shopify/hydrogen";
import type { PredictiveSearchProductItem, PredictiveSearchState } from "@shopify/hydrogen";
import { usePredictiveSearch } from "@shopify/hydrogen/react";
import { Link } from "react-router";

import { Icon } from "~/components/ui/Icon";
import { productImageUrl } from "~/lib/image";
import { formatPrice } from "~/lib/money";
import { describeSuggestions } from "~/lib/predictive-search";
import { routeTemplates } from "~/lib/route-templates";

export const SEARCH_PAGE_PATH = "/search";

type PredictiveSuggestionsProps = {
  id: string;
  onNavigate?: () => void;
  className?: string;
};

/** Live suggestions for the surrounding PredictiveSearchProvider. */
export function PredictiveSuggestions({ id, onNavigate, className = "" }: PredictiveSuggestionsProps) {
  const state = usePredictiveSearch();
  const { status, result, term } = state;

  return (
    <div id={id} className={className} aria-busy={status === "loading"}>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {describeSuggestions(state)}
      </p>
      <SuggestionsBody status={status} result={result} onNavigate={onNavigate} />
      {term.length > 0 ? (
        <Link
          to={getSearchResultUrl({ baseUrl: SEARCH_PAGE_PATH, term })}
          className="text-burgundy mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-sm px-2 text-sm font-semibold"
          onClick={onNavigate}
        >
          See all results for “{term}”
          <Icon name="arrow-right" size={16} />
        </Link>
      ) : null}
    </div>
  );
}

type SuggestionsBodyProps = Pick<PredictiveSearchState, "status" | "result"> & {
  onNavigate?: () => void;
};

function SuggestionsBody({ status, result, onNavigate }: SuggestionsBodyProps) {
  switch (status) {
    case "idle":
      return null;
    case "error":
      return (
        <p role="alert" className="text-critical px-2 text-sm">
          Suggestions are unavailable right now. Press Enter to search instead.
        </p>
      );
    case "loading":
      if (result.items.products.length === 0) return <SuggestionSkeleton />;
      return (
        <SuggestionList
          products={result.items.products}
          term={result.term}
          stale
          onNavigate={onNavigate}
        />
      );
    case "success":
      if (result.items.products.length === 0) {
        return (
          <p className="text-on-surface-secondary px-2 py-3 text-sm">
            No matches for “{result.term}”. Try a simpler word, like “lights” or “diya”.
          </p>
        );
      }
      return (
        <SuggestionList products={result.items.products} term={result.term} onNavigate={onNavigate} />
      );
  }
}

function SuggestionSkeleton() {
  return (
    <ul role="list" className="grid gap-2" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <li key={index} className="flex items-center gap-3 p-2">
          <span className="skeleton size-12 shrink-0" />
          <span className="flex flex-1 flex-col gap-2">
            <span className="skeleton h-3 w-3/4" />
            <span className="skeleton h-3 w-1/4" />
          </span>
        </li>
      ))}
    </ul>
  );
}

type SuggestionListProps = {
  products: readonly PredictiveSearchProductItem[];
  term: string;
  stale?: boolean;
  onNavigate?: () => void;
};

function SuggestionList({ products, term, stale = false, onNavigate }: SuggestionListProps) {
  return (
    <ul role="list" className={`grid gap-1 ${stale ? "opacity-60" : ""}`}>
      {products.map((product) => (
        <li key={product.id}>
          <SuggestionLink product={product} term={term} onNavigate={onNavigate} />
        </li>
      ))}
    </ul>
  );
}

function SuggestionLink({
  product,
  term,
  onNavigate,
}: {
  product: PredictiveSearchProductItem;
  term: string;
  onNavigate?: () => void;
}) {
  const variant = product.selectedOrFirstAvailableVariant;
  const image = variant?.image ?? null;

  return (
    <Link
      to={getPredictiveSearchItemUrl(product, { routes: routeTemplates, term })}
      className="hover:bg-peach-soft flex items-center gap-3 rounded-xl p-2 no-underline motion-safe:transition-colors"
      onClick={onNavigate}
    >
      {image !== null ? (
        <img
          src={productImageUrl(image.url, 96)}
          alt={image.altText || product.title}
          width={48}
          height={48}
          className="bg-cream-deep size-12 shrink-0 rounded-lg object-cover"
          loading="lazy"
        />
      ) : (
        <span className="bg-cream-deep size-12 shrink-0 rounded-lg" aria-hidden="true" />
      )}
      <span className="flex min-w-0 flex-col">
        <span className="text-on-surface line-clamp-2 text-sm font-medium">{product.title}</span>
        {variant !== null ? (
          <span className="text-on-surface-secondary text-sm">{formatPrice(variant.price)}</span>
        ) : null}
      </span>
    </Link>
  );
}
