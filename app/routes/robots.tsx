import type { Route } from "./+types/robots";

/** /robots.txt — crawl the catalog, skip private and duplicate-content paths. */
export function loader({ request }: Route.LoaderArgs) {
  const origin = new URL(request.url).origin;
  const body = [
    "User-agent: *",
    "Disallow: /cart",
    "Disallow: /account",
    "Disallow: /checkout",
    "Disallow: /search",
    "Disallow: /*?*filter.",
    "Disallow: /*?*sort_by",
    "Disallow: /__shopify/",
    "Disallow: /api/",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
