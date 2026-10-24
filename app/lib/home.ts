// Homepage data: `home_hero` + `home_page` metaobjects, collections for the category
// strip and product rows, and the spotlight product. When a metaobject is empty the
// page falls back to real store data (never invented copy or claims).

import { Cache, gql, type StorefrontApi } from "@shopify/hydrogen";

import { isSellable, PRODUCT_CARD_FRAGMENT, type ProductCardData } from "~/components/ProductCard";
import { fieldMap, link, list, text, type LinkValue } from "~/lib/metaobject";
import { PROBLEMS, type Problem } from "~/lib/problems";
import type { RequestStorefrontClient } from "~/lib/storefront";

/** Default spotlight until `home_page.spotlight_product` is set in Shopify. */
export const DEFAULT_SPOTLIGHT_HANDLE =
  "wall-repair-roller-paint-white-wall-repair-painting-solution-d7foign37jks73d5755g";

const SPOTLIGHT_PRODUCT_FRAGMENT = gql(
  `
    fragment SpotlightProduct on Product {
      id
      handle
      title
      description
      availableForSale
      featuredImage {
        url
        altText
        width
        height
      }
      images(first: 6) {
        nodes {
          url
          altText
          width
          height
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      highlights: metafield(namespace: "custom", key: "highlights") {
        value
      }
      howToUse: metafield(namespace: "custom", key: "how_to_use") {
        references(first: 8) {
          nodes {
            ... on Metaobject {
              handle
              fields {
                key
                value
                reference {
                  ... on MediaImage {
                    image {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
      }
      beforeImage: metafield(namespace: "custom", key: "before_image") {
        reference {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
      afterImage: metafield(namespace: "custom", key: "after_image") {
        reference {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
      beforeAfterCaption: metafield(namespace: "custom", key: "before_after_caption") {
        value
      }
    }
  `,
  [],
);

const HOME_COLLECTION_FRAGMENT = gql(
  `
    fragment HomeCollection on Collection {
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
      icon: metafield(namespace: "custom", key: "icon") {
        value
      }
      shortLabel: metafield(namespace: "custom", key: "short_label") {
        value
      }
      products(first: 8) {
        nodes {
          ...ProductCard
        }
      }
    }
  `,
  [PRODUCT_CARD_FRAGMENT],
);

// Shallow on purpose: products and collections are referenced by handle and
// resolved from the collections list / a second query (keeps types tractable).
const META_FIELD_FRAGMENT = gql(
  `
    fragment HomeMetaField on MetaobjectField {
      key
      value
      reference {
        __typename
        ... on MediaImage {
          image {
            url
            altText
            width
            height
          }
        }
        ... on Product {
          handle
        }
      }
      references(first: 12) {
        nodes {
          __typename
          ... on Collection {
            handle
          }
          ... on Metaobject {
            handle
            fields {
              key
              value
            }
          }
        }
      }
    }
  `,
  [],
);

export const HOME_QUERY = gql(
  `
    query HomePage($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
      homeHero: metaobject(handle: { type: "home_hero", handle: "home-hero" }) {
        fields {
          ...HomeMetaField
        }
      }
      homePage: metaobject(handle: { type: "home_page", handle: "home" }) {
        fields {
          ...HomeMetaField
        }
      }
      collections(first: 20, sortKey: UPDATED_AT, reverse: true) {
        nodes {
          ...HomeCollection
        }
      }
    }
  `,
  [META_FIELD_FRAGMENT, HOME_COLLECTION_FRAGMENT],
);

export const PRODUCTS_BY_HANDLE_QUERY = gql(
  `
    query ProductsByHandle($query: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
      products(first: 20, query: $query) {
        nodes {
          ...ProductCard
        }
      }
    }
  `,
  [PRODUCT_CARD_FRAGMENT],
);

export const BESTSELLERS_QUERY = gql(
  `
    query HomeBestsellers($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
      products(first: 16, sortKey: BEST_SELLING) {
        nodes {
          ...ProductCard
        }
      }
    }
  `,
  [PRODUCT_CARD_FRAGMENT],
);

export const SPOTLIGHT_QUERY = gql(
  `
    query HomeSpotlight($handle: String!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
      product(handle: $handle) {
        ...SpotlightProduct
      }
    }
  `,
  [SPOTLIGHT_PRODUCT_FRAGMENT],
);

type HomeQueryResult = StorefrontApi.ResultOf<typeof HOME_QUERY>;
type MetaFields = NonNullable<HomeQueryResult["homeHero"]>["fields"];
type MetaField = MetaFields[number];
type RawCollection = HomeQueryResult["collections"]["nodes"][number];
export type SpotlightProductData = NonNullable<
  StorefrontApi.ResultOf<typeof SPOTLIGHT_QUERY>["product"]
>;

export type HomeImage = { url: string; altText: string | null; width: number | null; height: number | null };

export type HomeCollection = {
  id: string;
  handle: string;
  title: string;
  label: string;
  description: string | null;
  icon: string | null;
  image: HomeImage | null;
  products: ProductCardData[];
};

export type Benefit = { label: string; icon: string | null };

export type HeroHotspot = {
  x: number;
  y: number;
  label: string | null;
  product: ProductCardData;
};

export type HeroContent = {
  eyebrow: string | null;
  headline: string;
  headlineAccent: string | null;
  subtext: string | null;
  benefits: Benefit[];
  cta: LinkValue;
  image: HomeImage | null;
  /** True when the image is a merchant-supplied cutout (transparent PNG). */
  isCutout: boolean;
  beforeImage: HomeImage | null;
  afterImage: HomeImage | null;
  note: string | null;
  product: SpotlightProductData | null;
  /** Full-bleed lifestyle photo behind the hero copy. */
  background: HomeImage | null;
  hotspots: HeroHotspot[];
  fromShopify: boolean;
};

export type HowToStep = { title: string; body: string | null; image: HomeImage | null };

export type Spotlight = {
  product: SpotlightProductData;
  heading: string | null;
  intro: string | null;
  steps: HowToStep[];
  highlights: string[];
  beforeImage: HomeImage | null;
  afterImage: HomeImage | null;
  caption: string | null;
};

export type HomeData = {
  hero: HeroContent;
  categories: HomeCollection[];
  rows: HomeCollection[];
  spotlight: Spotlight | null;
  problems: { problem: Problem; product: ProductCardData }[];
  bestsellers: ProductCardData[];
};

type RawHotspot = { handle: string; x: number; y: number; label: string | null };

/** `home_hero.hotspots` JSON → validated list (bad entries are dropped). */
function parseHotspots(value: string | null | undefined): RawHotspot[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry: unknown) => {
      if (!entry || typeof entry !== "object") return [];
      const { handle, x, y, label } = entry as Record<string, unknown>;
      const nx = Number(x);
      const ny = Number(y);
      if (typeof handle !== "string" || !Number.isFinite(nx) || !Number.isFinite(ny)) return [];
      if (nx < 0 || nx > 100 || ny < 0 || ny > 100) return [];
      return [{ handle, x: nx, y: ny, label: typeof label === "string" && label.trim() ? label.trim() : null }];
    });
  } catch {
    return [];
  }
}

function byKey(fields: MetaFields | undefined | null) {
  const map = new Map<string, MetaField>();
  for (const field of fields ?? []) map.set(field.key, field);
  return map;
}

function imageOf(field: MetaField | undefined): HomeImage | null {
  const reference = field?.reference;
  if (reference?.__typename === "MediaImage" && reference.image) return reference.image;
  return null;
}

function productHandleOf(field: MetaField | undefined): string | null {
  const reference = field?.reference;
  return reference?.__typename === "Product" ? reference.handle : null;
}

function collectionHandlesOf(field: MetaField | undefined): string[] {
  return (field?.references?.nodes ?? []).flatMap((node) =>
    node.__typename === "Collection" ? [node.handle] : [],
  );
}

function metaobjectsOf(field: MetaField | undefined) {
  return (field?.references?.nodes ?? []).flatMap((node) =>
    node.__typename === "Metaobject" ? [fieldMap(node.fields)] : [],
  );
}

/**
 * Collections without their own image borrow a product photo; make sure two tiles
 * never borrow the same one.
 */
function withDistinctImages(collections: HomeCollection[]): HomeCollection[] {
  const used = new Set<string>();
  return collections.map((collection) => {
    const own = collection.image && !collection.products.some((p) => p.featuredImage?.url === collection.image?.url);
    if (own && collection.image) {
      used.add(collection.image.url);
      return collection;
    }
    const candidate =
      collection.products.find((p) => p.featuredImage && !used.has(p.featuredImage.url))?.featuredImage ??
      collection.image;
    if (candidate) used.add(candidate.url);
    return { ...collection, image: candidate ?? null };
  });
}

function pick(collections: HomeCollection[], handles: string[]) {
  return handles.flatMap((handle) => collections.filter((collection) => collection.handle === handle));
}

function normalizeCollection(collection: RawCollection): HomeCollection {
  const products = collection.products.nodes.filter(isSellable);
  return {
    id: collection.id,
    handle: collection.handle,
    title: collection.title,
    label: text(collection.shortLabel?.value) ?? collection.title,
    description: text(collection.description),
    icon: text(collection.icon?.value),
    image: collection.image ?? products[0]?.featuredImage ?? null,
    products,
  };
}

function normalizeSpotlight(
  product: SpotlightProductData | null,
  heading: string | null,
  intro: string | null,
): Spotlight | null {
  if (!product) return null;
  const price = Number.parseFloat(product.priceRange.minVariantPrice.amount);
  if (!Number.isFinite(price) || price <= 0) return null;

  const steps: HowToStep[] = (product.howToUse?.references?.nodes ?? []).flatMap((node) => {
    if (!("fields" in node)) return [];
    const f = byKey(node.fields as MetaFields);
    const title = text(f.get("title")?.value);
    if (!title) return [];
    return [{ title, body: text(f.get("body")?.value), image: imageOf(f.get("image")) }];
  });

  const beforeRef = product.beforeImage?.reference;
  const afterRef = product.afterImage?.reference;
  const beforeImage = beforeRef && "image" in beforeRef ? (beforeRef.image ?? null) : null;
  const afterImage = afterRef && "image" in afterRef ? (afterRef.image ?? null) : null;

  return {
    product,
    heading,
    intro,
    steps,
    highlights: list(product.highlights?.value),
    beforeImage: beforeImage && afterImage ? beforeImage : null,
    afterImage: beforeImage && afterImage ? afterImage : null,
    caption: text(product.beforeAfterCaption?.value),
  };
}

export async function loadHome(storefrontClient: RequestStorefrontClient): Promise<HomeData> {
  const { data, errors } = await storefrontClient.graphql(HOME_QUERY, { cache: Cache.short() });

  if (errors) {
    console.error(`Home query failed: ${errors.map(({ message }) => message).join("\n")}`);
  }

  const heroFields = byKey(data?.homeHero?.fields);
  const pageFields = byKey(data?.homePage?.fields);

  const allCollections: HomeCollection[] = (data?.collections.nodes ?? [])
    .filter((collection: RawCollection) => collection.handle !== "all")
    .map(normalizeCollection);

  // Category strip: curated list, else every collection that has products.
  const curatedStrip = pick(allCollections, collectionHandlesOf(pageFields.get("category_strip")));
  const categories = withDistinctImages(
    (curatedStrip.length > 0 ? curatedStrip : allCollections).filter(
      (collection) => collection.products.length > 0,
    ),
  );

  // Product rows: curated list, else the fullest collections (3+ products).
  const curatedRows = pick(allCollections, collectionHandlesOf(pageFields.get("featured_collections")));
  const rows = (
    curatedRows.length > 0
      ? curatedRows
      : [...allCollections].sort((a, b) => b.products.length - a.products.length)
  )
    .filter((collection) => collection.products.length >= 3)
    .slice(0, 3);

  const spotlightHandle =
    productHandleOf(pageFields.get("spotlight_product")) ??
    productHandleOf(heroFields.get("product")) ??
    DEFAULT_SPOTLIGHT_HANDLE;
  const rawHotspots = parseHotspots(heroFields.get("hotspots")?.value);
  const handles = [...new Set([...PROBLEMS.map((p) => p.handle), ...rawHotspots.map((h) => h.handle)])];
  const [{ data: spotlightData }, { data: problemData }, { data: bestsellerData }] = await Promise.all([
    storefrontClient.graphql(SPOTLIGHT_QUERY, {
      variables: { handle: spotlightHandle },
      cache: Cache.short(),
    }),
    storefrontClient.graphql(PRODUCTS_BY_HANDLE_QUERY, {
      variables: { query: handles.map((handle) => `handle:${handle}`).join(" OR ") },
      cache: Cache.short(),
    }),
    storefrontClient.graphql(BESTSELLERS_QUERY, { cache: Cache.short() }),
  ]);
  const bestsellers = (bestsellerData?.products.nodes ?? []).filter(
    (product) => isSellable(product) && product.availableForSale,
  );
  const problemProducts = (problemData?.products.nodes ?? []).filter(isSellable);
  const problems = PROBLEMS.flatMap((problem) => {
    const product = problemProducts.find((p) => p.handle === problem.handle && p.availableForSale);
    return product ? [{ problem, product }] : [];
  });
  const spotlightProduct = spotlightData?.product ?? null;

  const spotlight = normalizeSpotlight(
    spotlightProduct,
    text(pageFields.get("spotlight_heading")?.value),
    text(pageFields.get("spotlight_intro")?.value),
  );

  const heroHeadline = text(heroFields.get("headline")?.value);
  const heroImage = imageOf(heroFields.get("image"));
  const heroBackground = imageOf(heroFields.get("background_image"));
  const hotspots: HeroHotspot[] = rawHotspots.flatMap((spot) => {
    const product = problemProducts.find((p) => p.handle === spot.handle && p.availableForSale);
    return product ? [{ x: spot.x, y: spot.y, label: spot.label, product }] : [];
  });
  const heroProduct = spotlight?.product ?? null;
  const beforeImage = imageOf(heroFields.get("before_image"));
  const afterImage = imageOf(heroFields.get("after_image"));

  const hero: HeroContent = heroHeadline
    ? {
        eyebrow: text(heroFields.get("eyebrow")?.value),
        headline: heroHeadline,
        headlineAccent: text(heroFields.get("headline_accent")?.value),
        subtext: text(heroFields.get("subtext")?.value),
        benefits: metaobjectsOf(heroFields.get("benefits"))
          .map((f): Benefit => ({ label: text(f.label) ?? "", icon: text(f.icon) }))
          .filter((benefit: Benefit) => benefit.label),
        cta: link(heroFields.get("cta")?.value) ?? {
          text: "Shop now",
          url: heroProduct ? `/products/${heroProduct.handle}` : "/collections",
        },
        image: heroImage ?? heroProduct?.featuredImage ?? null,
        isCutout: Boolean(heroImage),
        beforeImage: beforeImage && afterImage ? beforeImage : null,
        afterImage: beforeImage && afterImage ? afterImage : null,
        note: text(heroFields.get("note")?.value),
        product: heroProduct,
        background: heroBackground,
        hotspots,
        fromShopify: true,
      }
    : {
        // Brand fallback until the `home_hero` entry exists: tagline + real product.
        eyebrow: null,
        headline: "Smart finds",
        headlineAccent: "for better homes",
        subtext: "Useful, good-looking finds for everyday Indian homes.",
        benefits: [],
        cta: { text: "Shop all categories", url: "/collections" },
        image: heroProduct?.featuredImage ?? null,
        isCutout: false,
        beforeImage: null,
        afterImage: null,
        note: null,
        product: heroProduct,
        background: null,
        hotspots: [],
        fromShopify: false,
      };

  return { hero, categories, rows, spotlight, problems, bestsellers };
}
