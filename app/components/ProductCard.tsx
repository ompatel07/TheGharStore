import { canAddToCart, gql, type StorefrontApi } from "@shopify/hydrogen";
import { createProductComponents } from "@shopify/hydrogen/react";
import { useRef } from "react";
import { Link } from "react-router";

import { Icon } from "~/components/ui/Icon";
import { playAddedToCart } from "~/lib/fly-to-cart";
import { responsiveSrcSet, shopifyImageUrl } from "~/lib/image";
import { compareMoney, formatPrice, salePercent } from "~/lib/money";

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

const { ProductProvider: CardProductProvider, useProductForm: useCardProductForm } =
  createProductComponents<ProductCardData>();

/**
 * Sellable = has a real price and at least one image. Supplier placeholders
 * (₹0, no photos) never reach listings.
 */
export function isSellable(product: Pick<ProductCardData, "priceRange" | "featuredImage" | "images">) {
  const price = Number.parseFloat(product.priceRange.minVariantPrice.amount);
  const hasImage = Boolean(product.featuredImage ?? product.images.nodes[0]);
  return Number.isFinite(price) && price > 0 && hasImage;
}

/** True when the product has a single purchasable choice (no real options). */
function isSingleChoice(product: ProductCardData) {
  return product.options.every((option) => option.optionValues.length <= 1);
}

const CARD_WIDTHS = [240, 320, 400, 520, 640];
const CARD_SIZES = "(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw";

type ProductCardProps = {
  product: ProductCardData;
  priority?: boolean;
  /** Layout hint for the quick-add control size. */
  compact?: boolean;
};

export function ProductCard({ product, priority = false, compact = false }: ProductCardProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const primaryImage = product.featuredImage ?? product.images.nodes[0] ?? null;
  const hoverImage =
    product.images.nodes.find((image) => image.url !== primaryImage?.url) ?? null;
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange.minVariantPrice;
  const onSale = compareMoney(compareAt, price) > 0;
  const percent = onSale ? salePercent(price, compareAt) : null;
  const href = `/products/${product.handle}`;
  const altText = primaryImage?.altText?.trim() || product.title;

  return (
    <article
      className="group card surface-card flex h-full flex-col overflow-hidden motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[var(--shadow-lg)]"
      aria-label={product.title}
      data-testid="product-card"
    >
      <div className="bg-cream-deep relative aspect-square overflow-hidden">
        {primaryImage ? (
          <img
            ref={imageRef}
            src={shopifyImageUrl(primaryImage.url, { width: 520 })}
            srcSet={responsiveSrcSet(primaryImage.url, CARD_WIDTHS, primaryImage.width)}
            sizes={CARD_SIZES}
            alt={altText}
            width={primaryImage.width ?? 520}
            height={primaryImage.height ?? 520}
            className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-[900ms] motion-safe:ease-out motion-safe:group-hover:scale-[1.06]"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
          />
        ) : null}
        {hoverImage ? (
          <img
            src={shopifyImageUrl(hoverImage.url, { width: 520 })}
            srcSet={responsiveSrcSet(hoverImage.url, CARD_WIDTHS, hoverImage.width)}
            sizes={CARD_SIZES}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 max-md:hidden motion-safe:transition-opacity motion-safe:duration-500 motion-safe:group-hover:opacity-100 motion-reduce:hidden"
            loading="lazy"
          />
        ) : null}

        <div className="absolute start-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {!product.availableForSale ? (
            <span className="bg-chocolate text-cream rounded-full px-2.5 py-1 text-xs font-bold">
              Sold out
            </span>
          ) : percent ? (
            <span className="bg-burgundy rounded-full px-2.5 py-1 text-xs font-bold text-white">
              {percent}% off
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 md:p-4">
        <h3 className="text-on-surface line-clamp-2 text-[0.95rem] leading-snug font-semibold">
          <Link to={href} className="card-link" prefetch="intent">
            {product.title}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2">
          <p className="flex flex-wrap items-baseline gap-x-2">
            {onSale ? (
              <>
                <span className="text-on-surface text-lg font-bold">
                  <span className="sr-only">Sale price </span>
                  {formatPrice(price)}
                </span>
                <s className="text-compare text-sm">
                  <span className="sr-only">Regular price </span>
                  {formatPrice(compareAt)}
                </s>
              </>
            ) : (
              <span className="text-on-surface text-lg font-bold">
                <span className="sr-only">Price </span>
                {formatPrice(price)}
              </span>
            )}
          </p>
          {product.availableForSale && isSingleChoice(product) ? (
            <CardProductProvider product={product}>
              <QuickAdd product={product} imageRef={imageRef} compact={compact} />
            </CardProductProvider>
          ) : product.availableForSale ? (
            <Link
              to={href}
              className="border-burgundy text-burgundy hover:bg-peach-soft relative z-10 inline-flex h-10 shrink-0 items-center rounded-full border-2 px-3 text-sm font-bold"
              aria-label={`Choose options for ${product.title}`}
            >
              Choose
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function QuickAdd({
  product,
  imageRef,
  compact,
}: {
  product: ProductCardData;
  imageRef: React.RefObject<HTMLImageElement | null>;
  compact: boolean;
}) {
  const { formProps, register, options, pending } = useCardProductForm();
  const title = product.title;
  const addable = canAddToCart(product, options);

  return (
    <form
      {...formProps({ afterSubmit: () => void playAddedToCart(imageRef.current) })}
      className="relative z-10 shrink-0"
    >
      <input type="hidden" {...register("merchandiseId", {})} />
      <input type="hidden" {...register("quantity", { value: 1 })} />
      <button
        {...register("addToCart", {})}
        disabled={!addable || pending}
        aria-label={`Add ${title} to cart`}
        className={`bg-cta hover:bg-cta-hover text-cta-text inline-flex items-center justify-center gap-1 rounded-full font-bold shadow-[0_8px_18px_-10px_rgb(192_78_48/0.8)] disabled:opacity-60 motion-safe:transition-[background-color,transform] motion-safe:active:scale-95 ${
          compact ? "size-10" : "h-10 px-3.5 text-sm"
        }`}
      >
        <Icon name="plus" size={18} strokeWidth={2.5} />
        {compact ? null : <span>Add</span>}
      </button>
    </form>
  );
}
