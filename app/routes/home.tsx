import { useRouteLoaderData } from "react-router";

import { BestsellerTabs } from "~/components/home/BestsellerTabs";
import { CategoryBubbles } from "~/components/home/CategoryBubbles";
import { FestiveCarousel } from "~/components/home/FestiveCarousel";
import { FeatureBanners } from "~/components/home/FeatureBanners";
import { FlipTheSwitch } from "~/components/home/FlipTheSwitch";
import { HomeFaq } from "~/components/home/HomeFaq";
import { HERO_MOBILE_QUERY, heroImageSources, HomeHero } from "~/components/home/HomeHero";
import { ProblemFix } from "~/components/home/ProblemFix";
import { ProductRibbon } from "~/components/home/ProductRibbon";
import { ProductSpotlight } from "~/components/home/ProductSpotlight";
import { ShopByPrice } from "~/components/home/ShopByPrice";
import { TrustSection } from "~/components/home/TrustSection";
import { TrustStrip } from "~/components/home/TrustStrip";
import { WaysToGhar, type Way } from "~/components/home/WaysToGhar";
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
  const heroImage = data?.hero.background ?? data?.hero.image ?? null;
  const sources = heroImage ? heroImageSources(heroImage) : null;
  return [
    ...(sources
      ? [
          { tagName: "link", rel: "preload", as: "image", fetchPriority: "high", media: HERO_MOBILE_QUERY, imageSrcSet: sources.mobile.srcSet, imageSizes: sources.mobile.sizes },
          { tagName: "link", rel: "preload", as: "image", fetchPriority: "high", media: "(min-width: 1024px)", imageSrcSet: sources.desktop.srcSet, imageSizes: sources.desktop.sizes },
        ]
      : []),
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

/** Verb → product (matched by handle prefix); missing products simply drop out. */
const WAYS: [string, string, string][] = [
  ["Light it", "for the pooja corner", "flameless-lotus"],
  ["Fix it", "for wall marks", "wall-repair-roller"],
  ["Clean it", "for wet floors", "magic-broom-sweeper"],
  ["Polish it", "for wooden furniture", "floor-essential-wax"],
  ["Gift it", "for Diwali rangoli", "magic-rangoli-kit"],
  ["Grow it", "for the garden", "360-degree-sprayer"],
  ["Move it", "for heavy furniture", "furniture-lifter"],
];

export default function Home({ loaderData }: Route.ComponentProps) {
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const site = rootData?.siteContent;
  const { hero, categories, rows, spotlight, problems, bestsellers, priceTiers, features } = loaderData;

  // The festive collection gets the pinned night "edit".
  const festive = rows.find((row) => /diwali|festive/.test(row.handle)) ?? null;
  const badges = site ? trustBadges(site.storePromises, site.policies, site.storeProfile) : [];
  const faqs = site ? storeFaqs(site.storePromises, site.policies, site.storeProfile) : [];
  const all = bestsellers.length >= 4 ? bestsellers : (rows[0]?.products ?? []);
  const isFestive = Boolean(site?.festiveMode);
  const find = (prefix: string) => all.find((product) => product.handle.startsWith(prefix));
  const ways = WAYS.flatMap(([word, hint, prefix]): Way[] => {
    const product = find(prefix);
    return product ? [{ word, hint, product }] : [];
  });
  const lighting = all.filter((product) => /lotus|string-lights|diya/.test(product.handle));

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <HomeHero hero={hero} trust={badges} festive={isFestive} />
      <div className="max-w-page px-margin mx-auto mt-5 lg:hidden">
        <TrustStrip badges={badges} />
      </div>
      <CategoryBubbles collections={categories} priceTiers={priceTiers} />
      <BestsellerTabs all={all} categories={categories} />
      <WaysToGhar ways={ways} freeDelivery={site?.storePromises.freeShippingAll ?? false} />
      <ShopByPrice tiers={priceTiers} freeDelivery={site?.storePromises.freeShippingAll ?? false} />
      <FeatureBanners features={features} />
      <ProductRibbon products={all} />
      <FlipTheSwitch image={hero.background} products={lighting} festive={isFestive} />
      {festive ? (
        <FestiveCarousel collection={festive} festive={isFestive} />
      ) : null}
      <ProblemFix pairs={problems} />
      {spotlight ? <ProductSpotlight spotlight={spotlight} /> : null}
      <HomeFaq faqs={faqs} profile={site?.storeProfile ?? null} />
      {site ? <TrustSection badges={badges} policies={site.policies} profile={site.storeProfile} /> : null}
    </main>
  );
}
