import {
  AnalyticsEvent,
  createPredictiveSearchFormRegister,
  getSortByValue,
} from "@shopify/hydrogen";
import { CollectionProvider } from "@shopify/hydrogen/react";
import { useEffect } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "react-router";

import {
  ActiveFilterChips,
  FacetForm,
  FilterDrawer,
  LoadMore,
  SEARCH_SORT_OPTIONS,
  Toolbar,
  useLoadMore,
} from "~/components/CollectionBrowse";
import { ProductCard } from "~/components/ProductCard";
import { loadSearchPage, type SearchPageData } from "~/lib/search";
import { storefrontClientContext } from "~/lib/storefront";
import { BRAND_NAME } from "~/components/Logo";
import { Icon } from "~/components/ui/Icon";

import type { Route } from "./+types/search";

export function meta({ data }: Route.MetaArgs) {
  const term = data?.searchTerm;
  return [
    {
      title: term
        ? `“${term}” — search · ${BRAND_NAME}`
        : `Search · ${BRAND_NAME}`,
    },
    {
      name: "description",
      content: `Search décor, lighting, kitchen helpers and more at ${BRAND_NAME}.`,
    },
    { name: "robots", content: "noindex, follow" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const storefrontClient = context.get(storefrontClientContext);
  return loadSearchPage({ storefrontClient, request });
}

type PerformedSearchData = Extract<SearchPageData, { performed: true }>;
type ProductNode = PerformedSearchData["products"][number];

function SearchViewedTracker({
  searchTerm,
  totalCount,
}: {
  searchTerm: string;
  totalCount: number;
}) {
  useEffect(() => {
    if (!searchTerm) return;

    window.Shopify?.analytics?.publish(AnalyticsEvent.SEARCH_VIEWED, {
      searchTerm,
      searchResults: { totalCount },
    });
  }, [searchTerm, totalCount]);

  return null;
}

function BreadcrumbJsonLd({ origin }: { origin: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${origin}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Search",
        item: `${origin}/search`,
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />;
}

function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="text-on-surface-secondary flex items-center gap-1.5 text-sm">
        <li>
          <Link to="/" className="hover:text-burgundy">
            Home
          </Link>
        </li>
        <li aria-hidden="true">
          <Icon name="chevron-right" size={14} />
        </li>
        <li aria-current="page" className="text-on-surface font-medium">
          Search
        </li>
      </ol>
    </nav>
  );
}

const registerSearchForm = createPredictiveSearchFormRegister();

function SearchHeader({ term }: { term: string }) {
  return (
    <div className="bg-cream-deep curve-bottom mb-8 rounded-t-[var(--radius-xl)] px-6 pt-8 pb-12 md:px-10">
      <h1 className="type-heading-xl text-on-surface mb-5 text-[clamp(1.8rem,1.3rem+1.6vw,2.6rem)]">
        {term ? (
          <>
            Results for <span className="text-terracotta-deep">“{term}”</span>
          </>
        ) : (
          "What are you looking for?"
        )}
      </h1>
      <form
        action="/search"
        method="get"
        role="search"
        aria-label="Search"
        className="max-w-xl"
      >
        <label htmlFor="search-q" className="sr-only">
          Search products
        </label>
        <div className="relative">
          <span
            className="text-on-surface-secondary pointer-events-none absolute start-4 top-1/2 inline-flex -translate-y-1/2"
            aria-hidden="true"
          >
            <Icon name="search" size={20} />
          </span>
          <input
            key={term}
            {...registerSearchForm("query")}
            id="search-q"
            defaultValue={term}
            placeholder="Try “diya”, “lights” or “kitchen”"
            className="peer h-13 w-full bg-white ps-12 pe-28 text-base shadow-sm"
          />
          <button
            type="submit"
            className="bg-cta hover:bg-cta-hover text-cta-text absolute end-1.5 top-1/2 inline-flex h-10 -translate-y-1/2 items-center rounded-full px-5 font-bold"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}

function searchTermHiddenInput(term: string) {
  return <input type="hidden" name="q" value={term} />;
}

function ProductGrid({ products }: { products: readonly ProductNode[] }) {
  return (
    <div className="px-1 contain-paint">
      <ul
        id="product-grid"
        data-testid="product-grid"
        role="list"
        className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3"
      >
        {products.map((product, index) => (
          <li key={`${product.handle}-${index}`}>
            <ProductCard product={product} priority={index < 2} compact />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NoResults({ term }: { term: string }) {
  return (
    <div
      aria-live="polite"
      className="rounded-[var(--radius-xl)] bg-white p-10 text-center shadow-[var(--shadow-sm)]"
    >
      <span className="icon-chip mx-auto [--chip-size:4rem]">
        <Icon name="search" size={28} />
      </span>
      <h2 className="type-heading-lg text-on-surface mt-4">
        No matches for “{term}”
      </h2>
      <p className="text-on-surface-secondary mt-2">
        Check the spelling or try a simpler word, like “lights”, “diya” or
        “cleaner”.
      </p>
      <Link to="/collections" className="button-cta mt-6">
        Browse categories
      </Link>
    </div>
  );
}

function SearchResults({ loaderData }: { loaderData: PerformedSearchData }) {
  const location = useLocation();
  const navigation = useNavigation();
  const isUpdating =
    navigation.state === "loading" &&
    navigation.location?.pathname === location.pathname &&
    navigation.location.search !== location.search;
  const { nodes, pageInfo, isLoading, loadMore } = useLoadMore(
    loaderData.products,
    loaderData.pageInfo,
    loaderData.dataSearch,
  );
  const defaultSortValue = getSortByValue("RELEVANCE", false);
  const countText = `${nodes.length} results found for “${loaderData.searchTerm}”`;
  const searchPath = `/search?q=${encodeURIComponent(loaderData.searchTerm)}`;
  const hiddenQuery = searchTermHiddenInput(loaderData.searchTerm);

  if (nodes.length === 0) return <NoResults term={loaderData.searchTerm} />;

  return (
    <>
      <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-8">
            <h2 className="type-heading-sm text-on-surface mb-2">Filters</h2>
            <FacetForm
              availableFilters={loaderData.availableFilters}
              currencyCode={loaderData.currencyCode}
              extraHiddenInputs={searchTermHiddenInput(loaderData.searchTerm)}
            />
          </div>
        </aside>
        <div>
          <Toolbar
            countText={countText}
            sortOptions={SEARCH_SORT_OPTIONS}
            defaultSortValue={defaultSortValue}
            extraHiddenInputs={hiddenQuery}
          />
          <ActiveFilterChips
            basePath={searchPath}
            clearAllTo={searchPath}
            currencyCode={loaderData.currencyCode}
          />
          <h2 className="sr-only">Search results</h2>
          <div
            aria-busy={isUpdating}
            className={`motion-safe:transition-opacity motion-safe:duration-150 ${isUpdating ? "opacity-60" : "opacity-100"}`}
          >
            <ProductGrid products={nodes} />
          </div>
          <LoadMore
            pageInfo={pageInfo}
            loadedCount={nodes.length}
            countLabel={`Showing ${nodes.length} of ${loaderData.totalCount} results`}
            isLoading={isLoading}
            onLoad={loadMore}
          />
        </div>
      </div>
      <FilterDrawer
        availableFilters={loaderData.availableFilters}
        currencyCode={loaderData.currencyCode}
        extraHiddenInputs={searchTermHiddenInput(loaderData.searchTerm)}
      />
    </>
  );
}

export default function SearchRoute({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <CollectionProvider
      data={{
        handle: `search:${loaderData.searchTerm}`,
        dataSearch: loaderData.dataSearch,
      }}
      urlSearch={searchParams.toString()}
      onChange={(search) => {
        const nextParams = new URLSearchParams(
          search.startsWith("?") ? search.slice(1) : search,
        );
        if (loaderData.searchTerm && !nextParams.has("q"))
          nextParams.set("q", loaderData.searchTerm);
        nextParams.delete("after");
        const nextSearch = nextParams.toString();
        void navigate(
          { search: nextSearch ? `?${nextSearch}` : "" },
          {
            replace: searchParams.size > 0,
            preventScrollReset: true,
          },
        );
      }}
    >
      {loaderData.performed ? (
        <SearchViewedTracker
          searchTerm={loaderData.searchTerm}
          totalCount={loaderData.totalCount}
        />
      ) : null}
      <main className="flex-1" id="main-content" tabIndex={-1}>
        <div className="max-w-page px-margin mx-auto w-full py-8 md:py-12">
          <BreadcrumbJsonLd origin={loaderData.origin} />
          <Breadcrumb />
          <SearchHeader term={loaderData.searchTerm} />
          {loaderData.performed ? (
            <SearchResults loaderData={loaderData} />
          ) : null}
        </div>
      </main>
    </CollectionProvider>
  );
}
