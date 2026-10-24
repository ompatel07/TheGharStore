import { useRouteLoaderData } from "react-router";

import { CategoryIndex } from "~/components/home/CategoryIndex";
import { CollectionRow } from "~/components/home/CollectionRow";
import { EditScroller } from "~/components/home/EditScroller";
import { HomeHero } from "~/components/home/HomeHero";
import { MarqueeBand } from "~/components/home/MarqueeBand";
import { ProblemFix } from "~/components/home/ProblemFix";
import { ProductRail } from "~/components/home/ProductRail";
import { ProductSpotlight } from "~/components/home/ProductSpotlight";
import { Statement } from "~/components/home/Statement";
import { buildTrustItems, TrustSection } from "~/components/home/TrustSection";
import { BRAND_NAME, BRAND_TAGLINE } from "~/components/Logo";
import { loadHome } from "~/lib/home";
import { storefrontClientContext } from "~/lib/storefront";
import type { loader as rootLoader } from "~/root";

import type { Route } from "./+types/home";

export function meta({ data }: Route.MetaArgs) {
  const title = `${BRAND_NAME} — ${BRAND_TAGLINE}`;
  const description =
    "Useful, good-looking finds for everyday Indian homes: décor, lighting, kitchen helpers, DIY fixes and festive specials.";
  const image = data?.hero.background?.url ?? data?.hero.image?.url;
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
  const { hero, categories, rows, spotlight, problems, bestsellers } = loaderData;

  // The festive collection gets the pinned night "edit"; other rows stay grids.
  const festive = rows.find((row) => /diwali|festive/.test(row.handle)) ?? null;
  const gridRows = rows.filter((row) => row !== festive);
  const trust = site ? buildTrustItems(site.storePromises, site.policies, site.storeProfile) : [];
  const picks = bestsellers.length >= 4 ? bestsellers : (rows[0]?.products ?? []);

  const marqueeItems = categories.flatMap((collection, index) => [
    { label: collection.label, to: `/collections/${collection.handle}` },
    ...(index % 2 === 0 ? [{ label: index === 0 ? "smart finds" : "better homes", hand: true }] : []),
  ]);

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <HomeHero hero={hero} trust={trust} />
      <CategoryIndex collections={categories} />
      <ProductRail
        id="picks-title"
        eyebrow="Hand-picked"
        title={
          <>
            Finds we <em className="text-terracotta-deep">love</em>
          </>
        }
        products={picks}
        viewAll={{ to: "/collections/all", label: "Shop all" }}
      />
      {festive ? (
        <EditScroller collection={festive} kicker="Roshni ka tyohaar" title="The Diwali" accent="Edit" />
      ) : null}
      <ProblemFix pairs={problems} />
      {spotlight ? <ProductSpotlight spotlight={spotlight} /> : null}
      <MarqueeBand items={marqueeItems} tone="light" duration={60} />
      <Statement
        text="We look for *small,* *smart* things that make everyday home life a little easier — and a lot nicer to look at. Picked for Indian homes, *one* *find* *at* *a* *time.*"
        signature="The Ghar Store"
      />
      {gridRows.map((collection) => (
        <CollectionRow key={collection.handle} collection={collection} />
      ))}
      {site ? (
        <TrustSection promises={site.storePromises} policies={site.policies} profile={site.storeProfile} />
      ) : null}
    </main>
  );
}
