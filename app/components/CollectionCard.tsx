import { gql, type StorefrontApi } from "@shopify/hydrogen";
import { Link } from "react-router";

import { collectionIcon } from "~/components/home/CategoryStrip";
import { Icon } from "~/components/ui/Icon";
import { responsiveSrcSet, shopifyImageUrl } from "~/lib/image";

export const COLLECTION_CARD_FRAGMENT = gql(`
  fragment CollectionCard on Collection {
    handle
    title
    description
    image {
      url
      altText
      width
      height
    }
    icon: metafield(namespace: "custom", key: "icon") {
      value
    }
    products(first: 1) {
      nodes {
        featuredImage {
          url
          altText
          width
          height
        }
      }
    }
    productCountProbe: products(first: 100) {
      nodes {
        id
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`);

const _COLLECTION_CARD_SHAPE_QUERY = gql(
  `query CollectionCardShape { collections(first: 1) { nodes { ...CollectionCard } } }`,
  [COLLECTION_CARD_FRAGMENT],
);

export type CollectionCardData = StorefrontApi.ResultOf<
  typeof _COLLECTION_CARD_SHAPE_QUERY
>["collections"]["nodes"][number];

export function CollectionCard({
  collection,
  priority = false,
}: {
  collection: CollectionCardData;
  priority?: boolean;
}) {
  const image = collection.image ?? collection.products.nodes[0]?.featuredImage ?? null;
  const count = collection.productCountProbe.nodes.length;
  const countLabel = collection.productCountProbe.pageInfo.hasNextPage
    ? "100+ products"
    : `${count} ${count === 1 ? "product" : "products"}`;

  return (
    <article className="group card surface-card flex h-full flex-col overflow-hidden motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[var(--shadow-lg)]">
      <div className="bg-cream-deep relative aspect-[4/3] overflow-hidden">
        {image ? (
          <img
            src={shopifyImageUrl(image.url, { width: 640 })}
            srcSet={responsiveSrcSet(image.url, [360, 520, 720, 960], image.width)}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            alt=""
            className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-[900ms] motion-safe:group-hover:scale-[1.05]"
            loading={priority ? "eager" : "lazy"}
          />
        ) : null}
      </div>
      <div className="flex items-center gap-3 p-4">
        <span className="icon-chip [--chip-size:3rem]">
          <Icon name={collectionIcon({ handle: collection.handle, icon: collection.icon?.value ?? null })} size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-on-surface text-lg font-bold">
            <Link to={`/collections/${collection.handle}`} className="card-link" prefetch="intent">
              {collection.title}
            </Link>
          </h3>
          <p className="text-on-surface-secondary truncate text-sm">
            {collection.description || countLabel}
          </p>
        </div>
        <Icon
          name="arrow-right"
          size={22}
          className="text-burgundy shrink-0 motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
        />
      </div>
    </article>
  );
}
