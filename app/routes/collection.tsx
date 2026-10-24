import { AnalyticsEvent, getSortByValue } from "@shopify/hydrogen";
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
  COLLECTION_SORT_OPTIONS,
  FacetForm,
  FilterDrawer,
  LoadMore,
  Toolbar,
  useLoadMore,
} from "~/components/CollectionBrowse";
import { collectionIcon } from "~/components/home/CategoryStrip";
import { BRAND_NAME } from "~/components/Logo";
import { ProductCard } from "~/components/ProductCard";
import { Icon } from "~/components/ui/Icon";
import { Mandala } from "~/components/ui/Ornaments";
import { shopifyImageUrl } from "~/lib/image";
import { loadCollectionPage } from "~/lib/collection";
import { storefrontClientContext } from "~/lib/storefront";

import type { Route } from "./+types/collection";

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: `Collection not found · ${BRAND_NAME}` }];
  const { collection, origin } = data;
  const description =
    collection.description ||
    `Shop ${collection.title} at ${BRAND_NAME} — useful finds for Indian homes.`;
  return [
    { title: `${collection.title} · ${BRAND_NAME}` },
    { name: "description", content: description },
    {
      tagName: "link",
      rel: "canonical",
      href: `${origin}/collections/${collection.handle}`,
    },
    { property: "og:title", content: `${collection.title} · ${BRAND_NAME}` },
    { property: "og:description", content: description },
    ...(collection.image
      ? [{ property: "og:image", content: collection.image.url }]
      : []),
  ];
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const handle = params.handle;
  if (!handle) throw new Response("Not Found", { status: 404 });

  const storefrontClient = context.get(storefrontClientContext);
  return loadCollectionPage({ storefrontClient, handle, request });
}

type CollectionData = Route.ComponentProps["loaderData"]["collection"];
type ProductNode = Route.ComponentProps["loaderData"]["products"][number];

function CollectionViewedTracker({
  collection,
}: {
  collection: CollectionData;
}) {
  useEffect(() => {
    window.Shopify?.analytics?.publish(AnalyticsEvent.COLLECTION_VIEWED, {
      collection: {
        id: collection.id,
        handle: collection.handle,
      },
    });
  }, [collection.id, collection.handle]);

  return null;
}

function BreadcrumbJsonLd({
  collection,
  origin,
}: {
  collection: CollectionData;
  origin: string;
}) {
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
        name: collection.title,
        item: `${origin}/collections/${collection.handle}`,
      },
    ],
  };

  return <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>;
}

function Breadcrumb({ collection }: { collection: CollectionData }) {
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
        <li>
          <Link to="/collections" className="hover:text-burgundy">
            Categories
          </Link>
        </li>
        <li aria-hidden="true">
          <Icon name="chevron-right" size={14} />
        </li>
        <li aria-current="page" className="text-on-surface font-medium">
          {collection.title}
        </li>
      </ol>
    </nav>
  );
}

function CollectionHeader({
  collection,
  products,
}: {
  collection: CollectionData;
  products: readonly ProductNode[];
}) {
  // Collage: the collection image if set, then distinct product photos.
  const images = [
    ...(collection.image ? [collection.image] : []),
    ...products.flatMap((product) =>
      product.featuredImage ? [product.featuredImage] : [],
    ),
  ]
    .filter(
      (image, index, all) =>
        all.findIndex((other) => other.url === image.url) === index,
    )
    .slice(0, 3);

  return (
    <header className="bg-chocolate text-cream curve-bottom relative mb-10 overflow-hidden rounded-t-[var(--radius-xl)] px-6 pt-10 pb-16 md:px-12 md:pt-14 md:pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 size-[30rem] text-[var(--color-gold)] opacity-15"
      >
        <Mandala className="spin-slow h-full w-full" />
      </div>
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="type-hand text-peach inline-flex items-center gap-2 text-2xl md:text-3xl">
            <Icon
              name={collectionIcon({ handle: collection.handle, icon: null })}
              size={26}
            />
            the collection
          </p>
          <h1 className="display-xl mt-2">{collection.title}</h1>
          {collection.description ? (
            <p className="text-cream/80 mt-5 max-w-xl text-lg md:text-xl">
              {collection.description}
            </p>
          ) : null}
        </div>
        {images.length > 0 ? (
          <div
            aria-hidden="true"
            className="relative mx-auto flex h-56 w-full max-w-md items-end justify-center md:h-72"
          >
            {images.map((image, index) => (
              <div
                key={image.url}
                className={`arch-frame absolute w-[42%] ${
                  index === 0
                    ? "left-1/2 z-10 h-full -translate-x-1/2"
                    : index === 1
                      ? "left-[4%] h-[78%] -rotate-6"
                      : "right-[4%] h-[78%] rotate-6"
                }`}
              >
                <div className="arch h-full bg-white">
                  <img
                    src={shopifyImageUrl(image.url, { width: 400 })}
                    alt=""
                    className="h-full w-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function ProductGrid({ products }: { products: readonly ProductNode[] }) {
  if (products.length === 0) return null;

  return (
    <div className="px-1 contain-paint">
      <ul
        id="product-grid"
        data-testid="product-grid"
        role="list"
        className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-3"
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

function EmptyState({ collectionPath }: { collectionPath: string }) {
  return (
    <div className="rounded-[var(--radius-xl)] bg-white p-10 text-center shadow-[var(--shadow-sm)]">
      <span className="icon-chip mx-auto [--chip-size:4rem]">
        <Icon name="search" size={28} />
      </span>
      <h2 className="type-heading-lg text-on-surface mt-4">
        Nothing matches those filters
      </h2>
      <p className="text-on-surface-secondary mt-2">
        Try removing a filter or two.
      </p>
      <Link to={collectionPath} preventScrollReset className="button-cta mt-6">
        Clear all filters
      </Link>
    </div>
  );
}

function CollectionResults({
  loaderData,
}: {
  loaderData: Route.ComponentProps["loaderData"];
}) {
  const location = useLocation();
  const navigation = useNavigation();
  const isUpdating =
    navigation.state === "loading" &&
    navigation.location?.pathname === location.pathname &&
    navigation.location.search !== location.search;
  const collectionPath = `/collections/${loaderData.collection.handle}`;
  const { nodes, pageInfo, isLoading, loadMore } = useLoadMore(
    loaderData.products,
    loaderData.pageInfo,
    loaderData.dataSearch,
  );
  const countText = `Showing ${nodes.length}`;
  const defaultSortValue = getSortByValue("COLLECTION_DEFAULT", false);

  return (
    <>
      <Toolbar
        countText={countText}
        sortOptions={COLLECTION_SORT_OPTIONS}
        defaultSortValue={defaultSortValue}
        showFilters={loaderData.availableFilters.length > 0}
      />
      <ActiveFilterChips
        basePath={collectionPath}
        clearAllTo={collectionPath}
        currencyCode={loaderData.currencyCode}
      />
      <h2 className="sr-only">Products</h2>
      <div
        aria-busy={isUpdating}
        className={`motion-safe:transition-opacity motion-safe:duration-150 ${isUpdating ? "opacity-60" : "opacity-100"}`}
      >
        {nodes.length > 0 ? (
          <ProductGrid products={nodes} />
        ) : (
          <EmptyState collectionPath={collectionPath} />
        )}
      </div>
      <LoadMore
        pageInfo={pageInfo}
        loadedCount={nodes.length}
        countLabel={`Showing ${nodes.length} products`}
        isLoading={isLoading}
        onLoad={loadMore}
      />
      <FilterDrawer
        availableFilters={loaderData.availableFilters}
        currencyCode={loaderData.currencyCode}
      />
    </>
  );
}

export default function CollectionRoute({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  return (
    <CollectionProvider
      data={{
        handle: loaderData.collection.handle,
        dataSearch: loaderData.dataSearch,
      }}
      urlSearch={searchParams.toString()}
      onChange={(search) => {
        const nextParams = new URLSearchParams(
          search.startsWith("?") ? search.slice(1) : search,
        );
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
      <CollectionViewedTracker collection={loaderData.collection} />
      <main className="flex-1" id="main-content" tabIndex={-1}>
        <div className="max-w-page px-margin mx-auto w-full py-6 md:py-10">
          <BreadcrumbJsonLd
            collection={loaderData.collection}
            origin={loaderData.origin}
          />
          <Breadcrumb collection={loaderData.collection} />
          <CollectionHeader
            collection={loaderData.collection}
            products={loaderData.products}
          />
          <div
            className={
              loaderData.availableFilters.length > 0
                ? "lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10"
                : ""
            }
          >
            <aside
              className={
                loaderData.availableFilters.length > 0
                  ? "hidden lg:block"
                  : "hidden"
              }
              aria-label="Filters"
            >
              <div className="sticky top-20 rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-sm)]">
                <h2 className="type-heading-md text-on-surface mb-3 flex items-center gap-2">
                  <Icon name="filter" size={20} />
                  Filters
                </h2>
                <FacetForm
                  availableFilters={loaderData.availableFilters}
                  currencyCode={loaderData.currencyCode}
                />
              </div>
            </aside>
            <div>
              <CollectionResults loaderData={loaderData} />
            </div>
          </div>
        </div>
      </main>
    </CollectionProvider>
  );
}
