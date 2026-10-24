import { Cache, gql } from "@shopify/hydrogen";

import type { RequestStorefrontClient } from "~/lib/storefront";

export const POLICIES_QUERY = gql(`
  query ShopPolicies($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        id
        title
        handle
        body
      }
      refundPolicy {
        id
        title
        handle
        body
      }
      shippingPolicy {
        id
        title
        handle
        body
      }
      termsOfService {
        id
        title
        handle
        body
      }
    }
  }
`);

export type Policy = {
  id: string;
  title: string;
  handle: string;
  body: string;
};

/** Published shop policies (Settings → Policies in Shopify admin). */
export async function loadPolicies(
  storefrontClient: RequestStorefrontClient,
): Promise<Policy[]> {
  const { data } = await storefrontClient.graphql(POLICIES_QUERY, {
    cache: Cache.long(),
  });
  const shop = data?.shop;
  if (!shop) return [];
  return [
    shop.shippingPolicy,
    shop.refundPolicy,
    shop.privacyPolicy,
    shop.termsOfService,
  ].filter((policy): policy is Policy =>
    Boolean(policy?.handle && policy.body.trim()),
  );
}
