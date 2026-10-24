import {
  gql,
  parseCollectionParams,
  type StorefrontApi,
} from "@shopify/hydrogen";
import type { ProductFilter as StorefrontApiProductFilter } from "@shopify/hydrogen/storefront-api-types";

import { isSellable, PRODUCT_CARD_FRAGMENT } from "~/components/ProductCard";
import type { RequestStorefrontClient } from "~/lib/storefront";

export const COLLECTION_PAGE_SIZE = 12;

export const COLLECTION_QUERY = gql(
  `
    query CollectionPage(
      $handle: String!
      $first: Int!
      $after: String
      $sortKey: ProductCollectionSortKeys
      $reverse: Boolean
      $filters: [ProductFilter!]
      $country: CountryCode
      $language: LanguageCode
    ) @inContext(country: $country, language: $language) {
      shop {
        paymentSettings {
          currencyCode
        }
      }
      collection(handle: $handle) {
        id
        handle
        title
        description
        image {
          url
          altText
          width
          height
        }
        products(
          first: $first
          after: $after
          sortKey: $sortKey
          reverse: $reverse
          filters: $filters
        ) {
          filters {
            id
            label
            type
            presentation
            values {
              id
              label
              count
              input
              swatch {
                color
                image {
                  previewImage {
                    url
                    altText
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            ...ProductCard
          }
        }
      }
    }
  `,
  [PRODUCT_CARD_FRAGMENT],
);

type CollectionQueryVariables = StorefrontApi.VariablesOf<
  typeof COLLECTION_QUERY
>;

// `/collections/all` before an "All Products" collection exists in Shopify:
// list every product (no facets — those come with the real collection).
export const ALL_PRODUCTS_QUERY = gql(
  `
    query AllProducts(
      $first: Int!
      $after: String
      $sortKey: ProductSortKeys
      $reverse: Boolean
      $country: CountryCode
      $language: LanguageCode
    ) @inContext(country: $country, language: $language) {
      shop {
        paymentSettings {
          currencyCode
        }
      }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...ProductCard
        }
      }
    }
  `,
  [PRODUCT_CARD_FRAGMENT],
);

const COLLECTION_TO_PRODUCT_SORT = {
  BEST_SELLING: "BEST_SELLING",
  CREATED: "CREATED_AT",
  PRICE: "PRICE",
  TITLE: "TITLE",
  RELEVANCE: "RELEVANCE",
  ID: "ID",
  COLLECTION_DEFAULT: "BEST_SELLING",
  MANUAL: "BEST_SELLING",
} as const;

export async function loadCollectionPage({
  storefrontClient,
  handle,
  request,
}: {
  storefrontClient: RequestStorefrontClient;
  handle: string;
  request: Request;
}) {
  const url = new URL(request.url);
  const browse = parseCollectionParams(url.searchParams);
  const after = url.searchParams.get("after") || undefined;

  const variables: CollectionQueryVariables = {
    handle,
    first: COLLECTION_PAGE_SIZE,
    after,
    filters:
      browse.filters.length > 0
        ? (browse.filters as StorefrontApiProductFilter[])
        : undefined,
    sortKey: browse.sortKey,
    reverse: browse.reverse || undefined,
  };

  const { data } = await storefrontClient.graphql(COLLECTION_QUERY, {
    variables,
  });

  if (!data?.collection && handle === "all") {
    const sortKey =
      COLLECTION_TO_PRODUCT_SORT[
        (browse.sortKey ??
          "BEST_SELLING") as keyof typeof COLLECTION_TO_PRODUCT_SORT
      ] ?? "BEST_SELLING";
    const { data: allData } = await storefrontClient.graphql(
      ALL_PRODUCTS_QUERY,
      {
        variables: {
          first: COLLECTION_PAGE_SIZE,
          after,
          sortKey,
          reverse: browse.reverse || undefined,
        },
      },
    );
    if (!allData) throw new Response("Collection not found", { status: 404 });
    return {
      collection: {
        id: "all",
        handle: "all",
        title: "All products",
        description: "Everything in the store, in one place.",
        image: null,
        products: {
          filters: [],
          pageInfo: allData.products.pageInfo,
          nodes: allData.products.nodes,
        },
      },
      products: allData.products.nodes.filter(isSellable),
      availableFilters: [],
      pageInfo: allData.products.pageInfo,
      currencyCode: allData.shop.paymentSettings.currencyCode,
      dataSearch: url.searchParams.toString(),
      origin: url.origin,
    };
  }

  if (!data?.collection)
    throw new Response("Collection not found", { status: 404 });

  return {
    collection: data.collection,
    products: data.collection.products.nodes.filter(isSellable),
    availableFilters: data.collection.products.filters,
    pageInfo: data.collection.products.pageInfo,
    currencyCode: data.shop.paymentSettings.currencyCode,
    dataSearch: url.searchParams.toString(),
    origin: url.origin,
  };
}
