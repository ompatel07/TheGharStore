import { canAddToCart, gql, type StorefrontApi } from "@shopify/hydrogen";
import { createProductComponents } from "@shopify/hydrogen/react";
import { useRef, useState } from "react";
import { Link, useRouteLoaderData, useViewTransitionState } from "react-router";

import { Icon } from "~/components/ui/Icon";
import { parseRating, Rating } from "~/components/ui/Rating";
import {
  beginAddedToCart,
  finishAddedToCart,
  preloadAddToCartMotion,
} from "~/lib/fly-to-cart";
import { responsiveSrcSet, shopifyImageUrl } from "~/lib/image";
import { compareMoney, formatPrice, salePercent } from "~/lib/money";
import type { loader as rootLoader } from "~/root";

const CARD_VARIANT_FRAGMENT = gql(`
  fragment CardVariant on ProductVariant {
    id
    title
    availableForSale
    selectedOptions {
      name
      value
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    image {
      url
      altText
      width
      height
    }
    product {
      title
      handle
    }
  }
`);

export const PRODUCT_CARD_FRAGMENT = gql(
  `
    fragment ProductCard on Product {
      id
      handle
      title
      availableForSale
      requiresSellingPlan
      rating: metafield(namespace: "reviews", key: "rating") {
        value
      }
      ratingCount: metafield(namespace: "reviews", key: "rating_count") {
        value
      }
      encodedVariantExistence
      encodedVariantAvailability
      featuredImage {
        url
        altText
        width
        height
      }
      images(first: 2) {
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
      options {
        name
        optionValues {
          name
          firstSelectableVariant {
            ...CardVariant
          }
        }
      }
      selectedOrFirstAvailableVariant(ignoreUnknownOptions: true) {
        ...CardVariant
      }
      adjacentVariants(ignoreUnknownOptions: true) {
        ...CardVariant
      }
    }
  `,
  [CARD_VARIANT_FRAGMENT],
);

const _PRODUCT_CARD_SHAPE_QUERY = gql(
  `query ProductCardShape { products(first: 1) { nodes { ...ProductCard } } }`,
  [PRODUCT_CARD_FRAGMENT],
);

export type ProductCardData = StorefrontApi.ResultOf<
  typeof _PRODUCT_CARD_SHAPE_QUERY
>["products"]["nodes"][number];

const {
  ProductProvider: CardProductProvider,
  useProductForm: useCardProductForm,
} = createProductComponents<ProductCardData>();

/**
 * Sellable = has a real price and at least one image. Supplier placeholders
 * (₹0, no photos) never reach listings.
 */
export function isSellable(
  product: Pick<ProductCardData, "priceRange" | "featuredImage" | "images">,
) {
  const price = Number.parseFloat(product.priceRange.minVariantPrice.amount);
  const hasImage = Boolean(product.featuredImage ?? product.images.nodes[0]);
  return Number.isFinite(price) && price > 0 && hasImage;
}

/** True when the product has a single purchasable choice (no real options). */
function isSingleChoice(product: ProductCardData) {
  return product.options.every((option) => option.optionValues.length <= 1);
}

/** Square-ish photos fill the tile; anything else is shown whole. */
function isNearSquare(image: { width?: number | null; height?: number | null } | null) {
  if (!image?.width || !image.height) return false;
  const ratio = image.width / image.height;
  return ratio > 0.93 && ratio < 1.07;
}

const CARD_WIDTHS = [240, 320, 400, 520, 640, 800];
const CARD_SIZES = "(min-width: 1024px) 24vw, (min-width: 640px) 34vw, 52vw";

type ProductCardProps = {
  product: ProductCardData;
  priority?: boolean;
  /** Smaller type for dense grids and drawers. */
  compact?: boolean;
  /** Text colour scheme: "dark" for cards placed on night sections. */
  tone?: "light" | "dark";
};

/**
 * Editorial product card: a tall image tile (photo contained over a soft blurred
 * copy of itself, so infographics are never cropped), second photo on hover,
 * quick add that rises from the image, then title and price on the page colour.
 */
export function ProductCard({
  product,
  priority = false,
  compact = false,
  tone = "light",
}: ProductCardProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const primaryImage = product.featuredImage ?? product.images.nodes[0] ?? null;
  const hoverImage =
    product.images.nodes.find((image) => image.url !== primaryImage?.url) ??
    null;
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange.minVariantPrice;
  const onSale = compareMoney(compareAt, price) > 0;
  const percent = onSale ? salePercent(price, compareAt) : null;
  const href = `/products/${product.handle}`;
  const altText = primaryImage?.altText?.trim() || product.title;
  const rating = parseRating(product.rating, product.ratingCount);
  const dark = tone === "dark";
  // Morph this card's photo into the product page gallery on navigation.
  // Only the card that was clicked claims the name (the same product can be on screen twice).
  const [picked, setPicked] = useState(false);
  const transitioning = useViewTransitionState(href) && picked;
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const freeDelivery = rootData?.siteContent.storePromises.freeShippingAll ?? false;
  const fit = (image: { width?: number | null; height?: number | null } | null) =>
    isNearSquare(image) ? " is-cover" : "";

  return (
    <article
      className="pcard group relative flex h-full flex-col"
      data-cursor="View"
      aria-label={product.title}
      data-testid="product-card"
    >
      <div className="pcard-media">
        {primaryImage ? (
          <>
            {/* Blurred fill only for photos that don't fill the square tile. */}
            {isNearSquare(primaryImage) ? null : (
              <img
                src={shopifyImageUrl(primaryImage.url, { width: 60 })}
                alt=""
                aria-hidden="true"
                className="pcard-backdrop"
                loading="lazy"
              />
            )}
            <img
              ref={imageRef}
              src={shopifyImageUrl(primaryImage.url, { width: 520 })}
              srcSet={responsiveSrcSet(
                primaryImage.url,
                CARD_WIDTHS,
                primaryImage.width,
              )}
              sizes={CARD_SIZES}
              alt={altText}
              width={primaryImage.width ?? 520}
              height={primaryImage.height ?? 520}
              className={`pcard-img pcard-img-main${fit(primaryImage)}`}
              style={transitioning ? { viewTransitionName: "product-hero" } : undefined}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
            />
          </>
        ) : null}
        {hoverImage ? (
          <img
            src={shopifyImageUrl(hoverImage.url, { width: 520 })}
            srcSet={responsiveSrcSet(
              hoverImage.url,
              CARD_WIDTHS,
              hoverImage.width,
            )}
            sizes={CARD_SIZES}
            alt=""
            aria-hidden="true"
            className={`pcard-img pcard-img-alt pointer-events-none bg-[var(--color-cream-deep)] max-md:hidden motion-reduce:hidden${fit(hoverImage)}`}
            loading="lazy"
          />
        ) : null}

        <div className="absolute start-3 top-3 z-[2] flex flex-col items-start gap-1.5">
          {!product.availableForSale ? (
            <span className="bg-chocolate text-cream rounded-full px-3 py-1 text-[0.7rem] font-bold tracking-wider uppercase">
              Sold out
            </span>
          ) : percent ? (
            <span className="bg-burgundy rounded-full px-3 py-1 text-[0.7rem] font-bold tracking-wider text-white uppercase">
              {percent}% off
            </span>
          ) : null}
        </div>

        {product.availableForSale ? (
          <div className="pcard-add">
            {isSingleChoice(product) ? (
              <CardProductProvider product={product}>
                <QuickAdd product={product} imageRef={imageRef} />
              </CardProductProvider>
            ) : (
              <Link
                to={href}
                className="bg-cream/95 text-chocolate relative z-10 inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold shadow-[0_10px_24px_-12px_rgb(0_0_0/0.5)] backdrop-blur md:w-full"
                aria-label={`Choose options for ${product.title}`}
              >
                Choose options
              </Link>
            )}
          </div>
        ) : null}
      </div>

      <div className={`flex flex-1 flex-col gap-1.5 px-0.5 ${compact ? "pt-3" : "pt-4"}`}>
        <h3
          className={`line-clamp-2 leading-snug font-semibold ${compact ? "text-[0.92rem]" : "text-[1rem] md:text-[1.05rem]"} ${dark ? "text-cream" : "text-on-surface"}`}
        >
          <Link to={href} className="card-link" prefetch="intent" viewTransition onClick={() => setPicked(true)}>
            {product.title}
          </Link>
        </h3>
        {rating ? <Rating rating={rating} /> : null}
        <p className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-0.5">
          {onSale ? (
            <>
              <span className={`font-bold ${compact ? "text-base" : "text-lg"} ${dark ? "text-cream" : "text-on-surface"}`}>
                <span className="sr-only">Sale price </span>
                {formatPrice(price)}
              </span>
              <s className={`text-sm ${dark ? "text-cream/60" : "text-compare"}`}>
                <span className="sr-only">Regular price </span>
                {formatPrice(compareAt)}
              </s>
            </>
          ) : (
            <span className={`font-bold ${compact ? "text-base" : "text-lg"} ${dark ? "text-cream" : "text-on-surface"}`}>
              <span className="sr-only">Price </span>
              {formatPrice(price)}
            </span>
          )}
        </p>
        {freeDelivery && product.availableForSale ? (
          <p className={`flex items-center gap-1.5 text-[0.75rem] font-semibold ${dark ? "text-cream/70" : "text-success"}`}>
            <Icon name="truck" size={14} />
            Free delivery
          </p>
        ) : null}
      </div>
    </article>
  );
}

function QuickAdd({
  product,
  imageRef,
}: {
  product: ProductCardData;
  imageRef: React.RefObject<HTMLImageElement | null>;
}) {
  const { formProps, register, options, pending } = useCardProductForm();
  const title = product.title;
  const addable = canAddToCart(product, options);

  return (
    <form
      {...formProps({
        beforeSubmit: () => beginAddedToCart(imageRef.current),
        afterSubmit: () => void finishAddedToCart(),
      })}
      onPointerEnter={preloadAddToCartMotion}
      onTouchStart={preloadAddToCartMotion}
      onFocus={preloadAddToCartMotion}
      className="relative z-10"
    >
      <input type="hidden" {...register("merchandiseId", {})} />
      <input type="hidden" {...register("quantity", { value: 1 })} />
      <button
        {...register("addToCart", {})}
        disabled={!addable || pending}
        aria-label={`Add ${title} to cart`}
        className="bg-chocolate text-cream hover:bg-burgundy inline-flex size-11 items-center justify-center gap-2 rounded-full text-sm font-bold shadow-[0_12px_28px_-12px_rgb(0_0_0/0.6)] disabled:opacity-60 motion-safe:transition-[background-color,transform] motion-safe:active:scale-95 md:h-11 md:w-full"
      >
        <Icon name="plus" size={18} strokeWidth={2.5} />
        <span className="max-md:sr-only">{pending ? "Adding…" : "Add to cart"}</span>
      </button>
    </form>
  );
}
