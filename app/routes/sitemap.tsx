import { Cache, gql } from "@shopify/hydrogen";

import { loadPolicies } from "~/lib/policies";
import { storefrontClientContext } from "~/lib/storefront";

import type { Route } from "./+types/sitemap";

const SITEMAP_QUERY = gql(`
  query Sitemap($type: SitemapType!, $page: Int!) {
    sitemap(type: $type) {
      resources(page: $page) {
        hasNextPage
        items {
          handle
          updatedAt
        }
      }
    }
  }
`);

const TYPES = [
  { type: "PRODUCT", path: "/products/" },
  { type: "COLLECTION", path: "/collections/" },
  { type: "PAGE", path: "/pages/" },
] as const;

const MAX_PAGES_PER_TYPE = 20;

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`);
}

/** /sitemap.xml built from the Storefront API sitemap resources. */
export async function loader({ context, request }: Route.LoaderArgs) {
  const storefrontClient = context.get(storefrontClientContext);
  const origin = new URL(request.url).origin;
  const urls: { loc: string; lastmod?: string }[] = [
    { loc: `${origin}/` },
    { loc: `${origin}/collections` },
    { loc: `${origin}/policies` },
  ];

  for (const { type, path } of TYPES) {
    for (let page = 1; page <= MAX_PAGES_PER_TYPE; page += 1) {
      const { data } = await storefrontClient.graphql(SITEMAP_QUERY, {
        variables: { type, page },
        cache: Cache.long(),
      });
      const resources = data?.sitemap.resources;
      if (!resources) break;
      for (const item of resources.items) {
        urls.push({
          loc: `${origin}${path}${item.handle}`,
          lastmod: item.updatedAt,
        });
      }
      if (!resources.hasNextPage) break;
    }
  }

  for (const policy of await loadPolicies(storefrontClient)) {
    urls.push({ loc: `${origin}/policies/${policy.handle}` });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) =>
      `  <url><loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}</url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
