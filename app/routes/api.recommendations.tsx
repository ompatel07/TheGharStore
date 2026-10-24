import { Cache, gql } from "@shopify/hydrogen";

import { isSellable, PRODUCT_CARD_FRAGMENT } from "~/components/ProductCard";
import { storefrontClientContext } from "~/lib/storefront";

import type { Route } from "./+types/api.recommendations";

const COMPLEMENTARY_QUERY = gql(
  `
    query CartRecommendations(
      $productId: ID!
      $intent: ProductRecommendationIntent!
      $country: CountryCode
      $language: LanguageCode
    ) @inContext(country: $country, language: $language) {
      productRecommendations(productId: $productId, intent: $intent) {
        ...ProductCard
      }
    }
  `,
  [PRODUCT_CARD_FRAGMENT],
);

/**
 * JSON resource for the cart drawer's "Pairs well with" row: Shopify's
 * complementary products first (set in the Search & Discovery app), then
 * related products. Excludes items already in the cart.
 */
export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  const exclude = new Set(url.searchParams.getAll("exclude"));
  if (!productId?.startsWith("gid://shopify/Product/")) return { products: [] };

  const storefrontClient = context.get(storefrontClientContext);
  const [complementary, related] = await Promise.all(
    (["COMPLEMENTARY", "RELATED"] as const).map((intent) =>
      storefrontClient.graphql(COMPLEMENTARY_QUERY, {
        variables: { productId, intent },
        cache: Cache.short(),
      }),
    ),
  );

  const seen = new Set<string>();
  const products = [
    ...(complementary.data?.productRecommendations ?? []),
    ...(related.data?.productRecommendations ?? []),
  ]
    .filter((product) => {
      if (
        seen.has(product.id) ||
        exclude.has(product.id) ||
        !isSellable(product)
      )
        return false;
      seen.add(product.id);
      return product.availableForSale;
    })
    .slice(0, 4);

  return { products };
}
