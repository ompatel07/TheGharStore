import { Link } from "react-router";

import { CollectionCard } from "~/components/CollectionCard";
import { loadCollectionsPage } from "~/lib/collections";
import { storefrontClientContext } from "~/lib/storefront";
import { BRAND_NAME } from "~/components/Logo";
import { Icon } from "~/components/ui/Icon";

import type { Route } from "./+types/collections";

export function meta() {
  return [
    { title: `Shop by category · ${BRAND_NAME}` },
    {
      name: "description",
      content: `Browse every ${BRAND_NAME} category: décor, lighting, kitchen helpers, DIY fixes, garden care and festive specials.`,
    },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const storefrontClient = context.get(storefrontClientContext);
  return loadCollectionsPage({ storefrontClient, request });
}

type CollectionNode =
  Route.ComponentProps["loaderData"]["collections"]["nodes"][number];

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
        name: "Collections",
        item: `${origin}/collections`,
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
          Categories
        </li>
      </ol>
    </nav>
  );
}

function CollectionsGrid({
  collections,
}: {
  collections: readonly CollectionNode[];
}) {
  if (collections.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] bg-white p-10 text-center shadow-[var(--shadow-sm)]">
        <h2 className="type-heading-lg text-on-surface">
          Categories are coming soon
        </h2>
        <p className="text-on-surface-secondary mt-2">
          Meanwhile, search for what you need.
        </p>
        <Link to="/search" className="button-cta mt-6">
          Search the store
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="sr-only">Browse collections</h2>
      <div>
        <ul
          role="list"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {collections
            .filter(
              (collection) => collection.productCountProbe.nodes.length > 0,
            )
            .map((collection, index) => (
              <li key={collection.handle}>
                <CollectionCard
                  collection={collection}
                  priority={index === 0}
                />
              </li>
            ))}
        </ul>
      </div>
    </>
  );
}

export default function CollectionsRoute({ loaderData }: Route.ComponentProps) {
  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <div className="max-w-page px-margin mx-auto w-full py-8 md:py-12">
        <BreadcrumbJsonLd origin={loaderData.origin} />
        <Breadcrumb />
        <header className="mb-8">
          <p className="type-hand text-terracotta-deep text-2xl">
            ghar ke liye sab kuch
          </p>
          <h1 className="type-heading-xl text-on-surface text-[clamp(2rem,1.4rem+2vw,3rem)]">
            Shop by category
          </h1>
          <Link
            to="/collections/all"
            className="text-burgundy mt-2 inline-flex min-h-11 items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
          >
            Or browse all products
            <Icon name="arrow-right" size={18} />
          </Link>
        </header>
        <CollectionsGrid collections={loaderData.collections.nodes} />
      </div>
    </main>
  );
}
