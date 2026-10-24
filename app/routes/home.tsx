import { useRouteLoaderData } from "react-router";

import { CategoryStrip } from "~/components/home/CategoryStrip";
import { CollectionRow } from "~/components/home/CollectionRow";
import { HomeHero } from "~/components/home/HomeHero";
import { ProductSpotlight } from "~/components/home/ProductSpotlight";
import { TrustSection } from "~/components/home/TrustSection";
import { BRAND_NAME, BRAND_TAGLINE } from "~/components/Logo";
import { loadHome } from "~/lib/home";
import { storefrontClientContext } from "~/lib/storefront";
import type { loader as rootLoader } from "~/root";

import type { Route } from "./+types/home";

export function meta({ data }: Route.MetaArgs) {
  const title = `${BRAND_NAME} — ${BRAND_TAGLINE}`;
  const description =
    "Useful, good-looking finds for everyday Indian homes: décor, lighting, kitchen helpers, DIY fixes and festive specials.";
  const image = data?.hero.image?.url;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    ...(image ? [{ property: "og:image", content: image }] : []),
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  return loadHome(context.get(storefrontClientContext));
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const site = rootData?.siteContent;
  const { hero, categories, rows, spotlight } = loaderData;

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <HomeHero hero={hero} />
      <CategoryStrip categories={categories} />
      {rows[0] ? <CollectionRow collection={rows[0]} /> : null}
      {spotlight ? <ProductSpotlight spotlight={spotlight} /> : null}
      {rows.slice(1).map((collection) => (
        <CollectionRow key={collection.handle} collection={collection} />
      ))}
      {site ? (
        <TrustSection
          promises={site.storePromises}
          policies={site.policies}
          profile={site.storeProfile}
        />
      ) : null}
    </main>
  );
}
