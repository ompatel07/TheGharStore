import {
  AnalyticsEvent,
  canAddToCart,
  Cache,
  getSelectedProductOptions,
} from "@shopify/hydrogen";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useRouteLoaderData,
} from "react-router";

import { BRAND_NAME } from "~/components/Logo";
import {
  AddToCartForm,
  PriceBlock,
  StickyBuyBar,
  StockStatus,
} from "~/components/product/BuyBox";
import {
  ProductGallery,
  STAGE_SIZES,
  STAGE_WIDTHS,
  type GalleryImage,
  type GalleryItem,
} from "~/components/product/ProductGallery";
import { BuyTogether, DeliveryCard, ShareRow } from "~/components/product/PdpExtras";
import { RecentlyViewed, SectionTabs, WhyLoveIt } from "~/components/product/PdpPlus";
import { Reviews } from "~/components/product/Reviews";
import { TrustStrip } from "~/components/home/TrustStrip";
import { ProductStory, StoryNav } from "~/components/product/ProductStory";
import { ProductRail } from "~/components/home/ProductRail";
import {
  hasRealOptions,
  VariantOptions,
  variantUrl,
} from "~/components/product/VariantOptions";
import { isSellable } from "~/components/ProductCard";
import { Icon } from "~/components/ui/Icon";
import { parseRating, Rating } from "~/components/ui/Rating";
import { text } from "~/lib/metaobject";
import { responsiveSrcSet } from "~/lib/image";
import { formatPrice } from "~/lib/money";
import { trustBadges } from "~/lib/promises";
import { soldLabel } from "~/lib/sold";
import {
  ProductProvider,
  useProductForm,
  type ProductVariantData,
} from "~/lib/product";
import {
  normalizeProductContent,
  PRODUCT_CONTENT_QUERY,
  PRODUCT_QUERY,
  RECOMMENDATIONS_QUERY,
  variantMrp,
} from "~/lib/product-page";
import { storefrontClientContext } from "~/lib/storefront";
import type { loader as rootLoader } from "~/root";

import type { Route } from "./+types/product";

function plainDescription(description: string, max = 158) {
  const clean = description.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export function meta({ data, location }: Route.MetaArgs) {
  if (!data) return [{ title: `Product not found · ${BRAND_NAME}` }];
  const { product } = data;
  // The gallery opens on the selected variant's photo (else the featured one).
  const leadImage = product.selectedOrFirstAvailableVariant?.image ?? product.featuredImage;
  const preload = leadImage
    ? [
        {
          tagName: "link",
          rel: "preload",
          as: "image",
          fetchPriority: "high",
          imageSrcSet: responsiveSrcSet(leadImage.url, STAGE_WIDTHS, leadImage.width),
          imageSizes: STAGE_SIZES,
        },
      ]
    : [];
  const title = `${text(product.seo.title) ?? product.title} · ${BRAND_NAME}`;
  const description =
    text(product.seo.description) ??
    (product.description
      ? plainDescription(product.description)
      : `Shop ${product.title} at ${BRAND_NAME}.`);
  const image = product.featuredImage?.url;
  return [
    ...preload,
    { title },
    { name: "description", content: description },
    {
      tagName: "link",
      rel: "canonical",
      href: `${data.origin}/products/${product.handle}`,
    },
    { property: "og:type", content: "product" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: `${data.origin}${location.pathname}` },
    ...(image ? [{ property: "og:image", content: image }] : []),
    {
      property: "product:price:amount",
      content: product.priceRange.minVariantPrice.amount,
    },
    {
      property: "product:price:currency",
      content: product.priceRange.minVariantPrice.currencyCode,
    },
  ];
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const handle = params.handle;
  if (!handle) throw new Response("Not Found", { status: 404 });

  const storefrontClient = context.get(storefrontClientContext);
  const url = new URL(request.url);
  const selectedOptions = getSelectedProductOptions({
    searchParams: url.searchParams,
  });

  const [{ data }, { data: contentData }] = await Promise.all([
    storefrontClient.graphql(PRODUCT_QUERY, {
      variables: { handle, selectedOptions },
    }),
    storefrontClient.graphql(PRODUCT_CONTENT_QUERY, {
      variables: { handle },
      cache: Cache.short(),
    }),
  ]);

  const product = data?.product;
  // ₹0 supplier placeholders are not for sale here.
  if (
    !product ||
    Number.parseFloat(product.priceRange.minVariantPrice.amount) <= 0
  ) {
    throw new Response("Not Found", { status: 404 });
  }

  const { data: recommendationData } = await storefrontClient.graphql(
    RECOMMENDATIONS_QUERY,
    {
      variables: { productId: product.id },
      cache: Cache.short(),
    },
  );

  return {
    product,
    content: normalizeProductContent(contentData?.product ?? {}),
    related: (recommendationData?.productRecommendations ?? [])
      .filter((item) => item.handle !== product.handle && isSellable(item))
      .slice(0, 8),
    origin: url.origin,
  };
}

type ProductData = Route.ComponentProps["loaderData"]["product"];

function useGalleryItems(
  product: ProductData,
  variant: ProductVariantData | null,
): GalleryItem[] {
  return useMemo(() => {
    const items: GalleryItem[] = [];
    const seen = new Set<string>();
    const pushImage = (image: GalleryImage | null | undefined) => {
      if (!image?.url) return;
      const key = image.url.split("?")[0];
      if (seen.has(key)) return;
      seen.add(key);
      items.push({ kind: "image", key, image });
    };

    pushImage(variant?.image ?? product.featuredImage);
    for (const media of product.media.nodes) {
      if (
        media.__typename === "MediaImage" ||
        media.mediaContentType === "IMAGE"
      ) {
        pushImage(media.previewImage);
      } else if (media.__typename === "Video") {
        items.push({
          kind: "video",
          key: media.id,
          poster: media.previewImage ?? null,
          sources: media.sources
            .filter((source) => source.mimeType.startsWith("video/"))
            .sort((a, b) => (a.height ?? 0) - (b.height ?? 0))
            .map((source) => ({ url: source.url, mimeType: source.mimeType })),
          alt: media.alt ?? null,
        });
      } else if (media.__typename === "ExternalVideo") {
        items.push({
          kind: "external",
          key: media.id,
          poster: media.previewImage ?? null,
          embedUrl: media.embedUrl,
          alt: media.alt ?? null,
        });
      }
    }
    if (items.length === 0)
      for (const image of product.images.nodes) pushImage(image);
    return items;
  }, [product, variant]);
}

function ProductViewedTracker({
  product,
  variant,
}: {
  product: ProductData;
  variant: ProductVariantData | null;
}) {
  useEffect(() => {
    window.Shopify?.analytics?.publish(AnalyticsEvent.PRODUCT_VIEWED, {
      products: [
        {
          id: product.id,
          title: product.title,
          price: variant?.price ?? product.priceRange.minVariantPrice,
          // Supplier vendor IDs are never exposed; analytics gets the brand.
          vendor: BRAND_NAME,
          variantId: variant?.id ?? product.id,
          variantTitle: variant?.title ?? product.title,
          quantity: 1,
        },
      ],
    });
    // Fire once per product view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);
  return null;
}

function ProductJsonLd({
  product,
  variant,
  origin,
}: {
  product: ProductData;
  variant: ProductVariantData | null;
  origin: string;
}) {
  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const url = `${origin}/products/${product.handle}`;
  const rating = parseRating(product.rating, product.ratingCount);
  const collection = product.collections.nodes[0];
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: product.description || undefined,
      image: product.images.nodes.map((image) => image.url).slice(0, 6),
      url,
      offers: {
        "@type": "Offer",
        url,
        price: price.amount,
        priceCurrency: price.currencyCode,
        availability: variant?.availableForSale
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: BRAND_NAME },
      },
      // Only from a connected reviews app's real data.
      ...(rating
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: rating.value,
              bestRating: rating.max,
              reviewCount: rating.count,
            },
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
        ...(collection
          ? [
              {
                "@type": "ListItem",
                position: 2,
                name: collection.title,
                item: `${origin}/collections/${collection.handle}`,
              },
            ]
          : []),
        {
          "@type": "ListItem",
          position: collection ? 3 : 2,
          name: product.title,
          item: url,
        },
      ],
    },
  ];
  return (
    <script
      type="application/ld+json"
      // JSON-LD from real product data only (no ratings until a reviews app is connected).
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

function ProductPage({
  loaderData,
}: {
  loaderData: Route.ComponentProps["loaderData"];
}) {
  const { product, content, related, origin } = loaderData;
  const { selectedVariant, options } = useProductForm();
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const site = rootData?.siteContent;
  const galleryItems = useGalleryItems(product, selectedVariant);
  const galleryImages = useMemo(
    () => galleryItems.flatMap((item) => (item.kind === "image" ? [item.image] : [])),
    [galleryItems],
  );
  const badges = site ? trustBadges(site.storePromises, site.policies, site.storeProfile) : [];
  const seen = useMemo(
    () => ({
      handle: product.handle,
      title: product.title,
      image: product.featuredImage?.url ?? null,
      price: product.priceRange.minVariantPrice,
    }),
    [product.handle, product.title, product.featuredImage?.url, product.priceRange.minVariantPrice],
  );
  const [buttonInView, setButtonInView] = useState(true);
  const onButtonVisibility = useCallback(
    (visible: boolean) => setButtonInView(visible),
    [],
  );
  const collection = product.collections.nodes[0];
  const mrp = variantMrp(selectedVariant);
  const netQuantity = text(selectedVariant?.netQuantity?.value);
  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const rating = parseRating(product.rating, product.ratingCount);

  return (
    <main className="flex-1 pb-24 lg:pb-0" id="main-content" tabIndex={-1}>
      <ProductViewedTracker product={product} variant={selectedVariant} />
      <ProductJsonLd
        product={product}
        variant={selectedVariant}
        origin={origin}
      />

      <div className="max-w-page px-margin mx-auto pt-6 lg:pt-8">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="text-on-surface-secondary flex flex-wrap items-center gap-1.5 text-sm">
            <li>
              <Link to="/" className="hover:text-burgundy">
                Home
              </Link>
            </li>
            {collection ? (
              <>
                <li aria-hidden="true">
                  <Icon name="chevron-right" size={14} />
                </li>
                <li>
                  <Link
                    to={`/collections/${collection.handle}`}
                    className="hover:text-burgundy"
                  >
                    {collection.title}
                  </Link>
                </li>
              </>
            ) : null}
            <li aria-hidden="true">
              <Icon name="chevron-right" size={14} />
            </li>
            <li
              aria-current="page"
              className="text-on-surface line-clamp-1 max-w-[16rem] font-medium"
            >
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <ProductGallery title={product.title} items={galleryItems} />
          </div>

          <div className="pdp-in flex flex-col gap-5">
            <div>
              {collection ? (
                <Link
                  to={`/collections/${collection.handle}`}
                  className="type-hand text-terracotta-deep text-2xl hover:underline"
                >
                  {collection.title}
                </Link>
              ) : null}
              <h1 className="ed-display text-on-surface mt-2 text-[clamp(2.1rem,1.4rem+2.2vw,3.4rem)] leading-[1.02]">
                {product.title}
              </h1>
              {soldLabel(product.unitsSold?.value) ? (
                <p className="bg-peach-soft text-chocolate mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold">
                  <Icon name="diya" size={16} className="text-terracotta-deep" />
                  {soldLabel(product.unitsSold?.value)}
                </p>
              ) : null}
              {rating ? (
                <a href="#reviews" className="mt-2 inline-block">
                  <Rating rating={rating} size="md" />
                </a>
              ) : null}
            </div>

            {content.highlights.length > 0 ? (
              <ul role="list" className="flex flex-wrap gap-2">
                {content.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="bg-peach-soft text-chocolate inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
                  >
                    <Icon
                      name="check"
                      size={15}
                      strokeWidth={2.5}
                      className="text-terracotta-deep"
                    />
                    {highlight}
                  </li>
                ))}
              </ul>
            ) : null}

            <PriceBlock product={product} variant={selectedVariant} mrp={mrp} />
            <StockStatus variant={selectedVariant} />

            {hasRealOptions(product) ? (
              <VariantOptions product={product} />
            ) : null}

            <AddToCartForm
              product={product}
              variant={selectedVariant}
              onButtonVisibility={onButtonVisibility}
            />

            {site ? (
              <DeliveryCard promises={site.storePromises} badges={badges} />
            ) : null}

            <ShareRow title={product.title} url={`${origin}/products/${product.handle}`} />

            <StoryNav
              content={content}
              hasDescription={
                product.descriptionHtml.replace(/<[^>]*>/g, "").trim().length > 0
              }
            />
          </div>
        </div>
      </div>

      {selectedVariant?.availableForSale && related.length > 0 ? (
        <div className="max-w-page px-margin mx-auto mt-14">
          <BuyTogether
            main={{
              key: product.id,
              merchandiseId: selectedVariant.id,
              title: product.title,
              handle: product.handle,
              image: selectedVariant.image ?? product.featuredImage ?? null,
              price: selectedVariant.price,
            }}
            related={related}
          />
        </div>
      ) : null}

      <WhyLoveIt highlights={content.highlights} images={galleryImages.slice(1)} title={product.title} />

      <ProductStory
        title={product.title}
        descriptionHtml={product.descriptionHtml}
        content={content}
        policies={site?.policies ?? []}
        profile={site?.storeProfile ?? null}
        mrp={mrp}
        netQuantity={netQuantity}
        collection={collection ?? null}
      />

      <Reviews
        productId={product.id}
        productHandle={product.handle}
        title={product.title}
        rating={rating}
        supportEmail={site?.storeProfile?.supportEmail ?? null}
      />

      {badges.length > 0 ? (
        <div className="max-w-page px-margin mx-auto mt-10">
          <TrustStrip badges={badges} />
        </div>
      ) : null}

      {related.length >= 3 ? (
        <ProductRail
          id="related-title"
          eyebrow="More to love"
          title="You may also like"
          products={related.slice(0, 10)}
          viewAll={collection ? { to: `/collections/${collection.handle}`, label: `More from ${collection.title}` } : undefined}
        />
      ) : null}

      <RecentlyViewed current={seen} />

      <SectionTabs
        visible={!buttonInView}
        title={product.title}
        image={product.featuredImage ?? null}
        price={price}
        addable={canAddToCart(product, options)}
        sections={[
          ...(content.highlights.length > 0 && galleryImages.length > 2 ? [{ id: "overview", label: "Overview" }] : []),
          ...(product.descriptionHtml.replace(/<[^>]*>/g, "").trim() ? [{ id: "story", label: "The story" }] : []),
          ...(content.howToUse.length > 0 ? [{ id: "how-to-use", label: "How to use" }] : []),
          ...(content.specifications.length > 0 || content.inTheBox.length > 0 || content.care ? [{ id: "details", label: "Details" }] : []),
          { id: "reviews", label: "Reviews" },
          ...(content.faqs.length > 0 ? [{ id: "faqs", label: "FAQs" }] : []),
        ]}
      />

      <StickyBuyBar
        visible={!buttonInView}
        title={product.title}
        image={product.featuredImage}
        price={formatPrice(price)}
        addable={canAddToCart(product, options)}
      />
    </main>
  );
}

export default function ProductRoute({ loaderData }: Route.ComponentProps) {
  const { product } = loaderData;
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ProductProvider
      product={product}
      onSelect={(result) => {
        void navigate(
          variantUrl(
            product,
            result.selectedOptions,
            result.selectedVariant?.product?.handle,
            new URLSearchParams(location.search),
          ),
          {
            replace: true,
            preventScrollReset: true,
            ...(result.status === "resolved"
              ? { defaultShouldRevalidate: false }
              : {}),
          },
        );
      }}
    >
      <ProductPage loaderData={loaderData} />
    </ProductProvider>
  );
}
