import { useRouteLoaderData } from "react-router";

import { BestsellerTabs } from "~/components/home/BestsellerTabs";
import { CategoryBubbles } from "~/components/home/CategoryBubbles";
import { EditScroller } from "~/components/home/EditScroller";
import { FeatureBanners } from "~/components/home/FeatureBanners";
import { HomeFaq } from "~/components/home/HomeFaq";
import { HomeHero } from "~/components/home/HomeHero";
import { ProblemFix } from "~/components/home/ProblemFix";
import { ProductRibbon } from "~/components/home/ProductRibbon";
import { ProductSpotlight } from "~/components/home/ProductSpotlight";
import { ShopByPrice } from "~/components/home/ShopByPrice";
import { TrustSection } from "~/components/home/TrustSection";
import { TrustStrip } from "~/components/home/TrustStrip";
import { BRAND_NAME, BRAND_TAGLINE } from "~/components/Logo";
import { loadHome } from "~/lib/home";
import { storeFaqs, trustBadges } from "~/lib/promises";
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
  const { hero, categories, rows, spotlight, problems, bestsellers, priceTiers, features } = loaderData;

  // The festive collection gets the pinned night "edit".
  const festive = rows.find((row) => /diwali|festive/.test(row.handle)) ?? null;
  const badges = site ? trustBadges(site.storePromises, site.policies, site.storeProfile) : [];
  const faqs = site ? storeFaqs(site.storePromises, site.policies, site.storeProfile) : [];
  const all = bestsellers.length >= 4 ? bestsellers : (rows[0]?.products ?? []);

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <HomeHero hero={hero} trust={badges} />
      <div className="max-w-page px-margin mx-auto mt-5 lg:hidden">
        <TrustStrip badges={badges} />
      </div>
      <CategoryBubbles collections={categories} priceTiers={priceTiers} />
      <BestsellerTabs all={all} categories={categories} />
      <ShopByPrice tiers={priceTiers} />
      <FeatureBanners features={features} />
      <ProductRibbon products={all} />
      {festive ? (
        <EditScroller collection={festive} kicker="Roshni ka tyohaar" title="The Diwali" accent="Edit" />
      ) : null}
      <ProblemFix pairs={problems} />
      {spotlight ? <ProductSpotlight spotlight={spotlight} /> : null}
      <HomeFaq faqs={faqs} badges={badges} />
      {site ? <TrustSection badges={badges} policies={site.policies} profile={site.storeProfile} /> : null}
    </main>
  );
}
