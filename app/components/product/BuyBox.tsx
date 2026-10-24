import { canAddToCart, type MoneyV2 } from "@shopify/hydrogen";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { Icon, type IconName } from "~/components/ui/Icon";
import { playAddedToCart } from "~/lib/fly-to-cart";
import { shopifyImageUrl } from "~/lib/image";
import type { MoneyValue } from "~/lib/metaobject";
import { formatPrice, salePercent } from "~/lib/money";
import { useProductForm, type ProductVariantData } from "~/lib/product";
import type { PolicyLink, StorePromises } from "~/lib/site-content";

export const PRODUCT_FORM_ID = "product-form";

function gallerySource(): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    '[data-testid="product-gallery"] img',
  );
}

/** gid://shopify/ProductVariant/123 → 123 (for /cart/{id}:{qty} buy-now permalinks). */
function numericId(gid: string) {
  return gid.split("/").pop() ?? "";
}

type BuyBoxProduct = Parameters<typeof canAddToCart>[0] & {
  title: string;
  priceRange: { minVariantPrice: MoneyV2 };
};

export function PriceBlock({
  product,
  variant,
  mrp,
}: {
  product: BuyBoxProduct;
  variant: ProductVariantData | null;
  mrp: MoneyValue | null;
}) {
  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = variant?.compareAtPrice ?? null;
  const percent = salePercent(price, compareAt);
  // MRP shows only when it's real and not below the selling price.
  const showMrp =
    mrp && Number.parseFloat(mrp.amount) >= Number.parseFloat(price.amount);
  const unitPrice = variant?.unitPrice;
  const unitMeasure = variant?.unitPriceMeasurement;

  return (
    <div className="flex flex-col gap-1" data-product-price>
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-on-surface text-3xl font-bold tracking-tight">
          <span className="sr-only">Price </span>
          {formatPrice(price)}
        </span>
        {compareAt && percent ? (
          <>
            <s className="text-compare text-lg">
              <span className="sr-only">Was </span>
              {formatPrice(compareAt)}
            </s>
            <span className="bg-burgundy rounded-full px-2.5 py-0.5 text-sm font-bold text-white">
              {percent}% off
            </span>
          </>
        ) : null}
      </p>
      {showMrp ? (
        <p className="text-on-surface-secondary text-sm">
          MRP{" "}
          {Number.parseFloat(mrp.amount) > Number.parseFloat(price.amount) ? (
            <s>{formatPrice(mrp)}</s>
          ) : (
            formatPrice(mrp)
          )}{" "}
          <span>(inclusive of all taxes)</span>
        </p>
      ) : null}
      {unitPrice && unitMeasure?.referenceUnit ? (
        <p className="text-on-surface-secondary text-sm">
          {formatPrice(unitPrice)} /{" "}
          {unitMeasure.referenceValue === 1 ? "" : unitMeasure.referenceValue}
          {unitMeasure.referenceUnit.toLowerCase()}
        </p>
      ) : null}
    </div>
  );
}

export function StockStatus({
  variant,
}: {
  variant: ProductVariantData | null;
}) {
  if (!variant) return null;
  const inStock = variant.availableForSale;
  return (
    <p
      className={`inline-flex items-center gap-2 text-sm font-semibold ${inStock ? "text-success" : "text-critical"}`}
      data-product-inventory
    >
      <span
        aria-hidden="true"
        className={`size-2.5 rounded-full ${inStock ? "bg-success shadow-[0_0_0_4px_rgb(46_107_63/0.15)]" : "bg-critical"}`}
      />
      {inStock ? "In stock" : "Sold out"}
    </p>
  );
}

function QuantityStepper({
  quantity,
  setQuantity,
}: {
  quantity: number;
  setQuantity: (quantity: number) => void;
}) {
  const { register } = useProductForm();
  const clamp = (value: number) => Math.min(99, Math.max(1, value));

  return (
    <div className="border-border inline-flex h-14 items-center rounded-full border-2 bg-white">
      <button
        type="button"
        className="hover:bg-peach-soft inline-flex size-12 items-center justify-center rounded-full disabled:opacity-40"
        aria-label="Decrease quantity"
        onClick={() => setQuantity(clamp(quantity - 1))}
        disabled={quantity <= 1}
      >
        <Icon name="minus" size={18} strokeWidth={2.25} />
      </button>
      <label htmlFor="pdp-quantity" className="sr-only">
        Quantity
      </label>
      <input
        id="pdp-quantity"
        type="number"
        {...register("quantity", { value: quantity })}
        min={1}
        max={99}
        step={1}
        className="number-reset !w-10 !rounded-none !border-0 !bg-transparent !p-0 text-center text-lg font-bold"
        onChange={(event) =>
          setQuantity(
            clamp(Number.parseInt(event.currentTarget.value, 10) || 1),
          )
        }
      />
      <button
        type="button"
        className="hover:bg-peach-soft inline-flex size-12 items-center justify-center rounded-full disabled:opacity-40"
        aria-label="Increase quantity"
        onClick={() => setQuantity(clamp(quantity + 1))}
        disabled={quantity >= 99}
      >
        <Icon name="plus" size={18} strokeWidth={2.25} />
      </button>
    </div>
  );
}

export function AddToCartForm({
  product,
  variant,
  onButtonVisibility,
}: {
  product: BuyBoxProduct;
  variant: ProductVariantData | null;
  onButtonVisibility?: (visible: boolean) => void;
}) {
  const { options, register, formProps, errors, pending } = useProductForm();
  const [quantity, setQuantity] = useState(1);
  const addable = canAddToCart(product, options);
  // Observe a wrapper: register("addToCart") supplies its own ref for the button.
  const buttonRef = useRef<HTMLDivElement>(null);
  const buttonText = addable
    ? "Add to cart"
    : variant
      ? "Sold out"
      : "Select an option";

  useEffect(() => {
    const button = buttonRef.current;
    if (
      !button ||
      !onButtonVisibility ||
      typeof IntersectionObserver === "undefined"
    )
      return;
    const observer = new IntersectionObserver(([entry]) =>
      onButtonVisibility(
        entry.isIntersecting || entry.boundingClientRect.top > 0,
      ),
    );
    observer.observe(button);
    return () => observer.disconnect();
  }, [onButtonVisibility]);

  const allErrors = [
    ...errors.userErrors,
    ...errors.warnings,
    ...errors.networkErrors,
  ];

  return (
    <div>
      <form
        id={PRODUCT_FORM_ID}
        {...formProps({
          afterSubmit: () => void playAddedToCart(gallerySource()),
        })}
      >
        <input type="hidden" {...register("merchandiseId", {})} />
        <div className="flex flex-wrap items-center gap-3">
          <QuantityStepper quantity={quantity} setQuantity={setQuantity} />
          <div ref={buttonRef} className="flex min-w-[12rem] flex-1">
            <button
              {...register("addToCart", {})}
              className="button-cta h-14 flex-1 !text-lg disabled:cursor-not-allowed"
              disabled={!addable || pending}
              aria-disabled={!addable || pending}
              data-testid="add-to-cart"
            >
              <Icon name="cart" size={22} strokeWidth={2} />
              {pending ? "Adding…" : buttonText}
            </button>
          </div>
        </div>
      </form>
      {addable && variant ? (
        <a
          href={`/cart/${numericId(variant.id)}:${quantity}`}
          className="border-burgundy text-burgundy hover:bg-burgundy mt-3 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border-2 text-lg font-bold hover:text-white motion-safe:transition-colors"
        >
          Buy now
        </a>
      ) : null}
      {allErrors.length > 0 ? (
        <div className="mt-3 grid gap-1 text-sm" role="alert">
          {allErrors.map((error) => (
            <p key={error.message} className="text-critical">
              {error.message}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Trust row under the buttons. Secure Shopify checkout is always true; returns,
 * COD and dispatch appear only when set in the `store_promises` metaobject, each
 * linking to the full policy when one is published.
 */
export function TrustRow({
  promises,
  policies,
}: {
  promises: StorePromises;
  policies: PolicyLink[];
}) {
  const policy = (match: RegExp) => policies.find((p) => match.test(p.handle));
  const refund = policy(/refund|return/);
  const shipping = policy(/shipping/);

  const items: { icon: IconName; label: string; to?: string }[] = [
    { icon: "shield", label: "Secure Shopify checkout" },
  ];
  if (promises.dispatchNote) {
    items.push({
      icon: "truck",
      label: promises.dispatchNote,
      to: shipping && `/policies/${shipping.handle}`,
    });
  } else if (promises.freeShippingThreshold) {
    items.push({
      icon: "truck",
      label: `Free shipping over ${formatPrice(promises.freeShippingThreshold)}`,
      to: shipping && `/policies/${shipping.handle}`,
    });
  }
  if (promises.codAvailable) {
    items.push({
      icon: "cod",
      label: promises.codNote ?? "Cash on delivery available",
    });
  }
  if (promises.returnsWindowDays) {
    items.push({
      icon: "refund",
      label: `${promises.returnsWindowDays}-day returns`,
      to: refund && `/policies/${refund.handle}`,
    });
  }

  return (
    <ul
      role="list"
      className={`grid gap-2 rounded-[var(--radius-lg)] bg-white p-3 shadow-[var(--shadow-sm)] ${
        items.length > 1 ? "grid-cols-2" : ""
      }`}
    >
      {items.map((item) => {
        const body = (
          <>
            <span className="icon-chip [--chip-size:2.25rem]">
              <Icon name={item.icon} size={18} />
            </span>
            <span className="text-on-surface text-[0.82rem] leading-tight font-semibold">
              {item.label}
            </span>
          </>
        );
        return (
          <li key={item.label}>
            {item.to ? (
              <Link
                to={item.to}
                className="hover:bg-peach-soft/60 flex min-h-11 items-center gap-2.5 rounded-xl p-1.5"
              >
                {body}
              </Link>
            ) : (
              <span className="flex min-h-11 items-center gap-2.5 p-1.5">
                {body}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Mobile sticky bar, shown once the main Add to cart button scrolls away. */
export function StickyBuyBar({
  visible,
  title,
  image,
  price,
  addable,
}: {
  visible: boolean;
  title: string;
  image: { url: string } | null;
  price: string;
  addable: boolean;
}) {
  const { register, pending } = useProductForm();
  return (
    <div
      className={`bg-surface/95 fixed inset-x-0 bottom-0 z-30 border-t border-[color-mix(in_oklab,var(--color-gold)_45%,transparent)] px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-12px_30px_-20px_rgb(56_44_42/0.5)] backdrop-blur-md lg:hidden motion-safe:transition-transform motion-safe:duration-300 ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      inert={!visible}
    >
      <div className="flex items-center gap-3">
        {image ? (
          <img
            src={shopifyImageUrl(image.url, { width: 96 })}
            alt=""
            className="size-11 shrink-0 rounded-lg object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-on-surface truncate text-sm font-semibold">
            {title}
          </p>
          <p className="text-on-surface text-base font-bold">{price}</p>
        </div>
        <button
          {...register("addToCart", {})}
          form={PRODUCT_FORM_ID}
          disabled={!addable || pending}
          className="button-cta h-12 shrink-0 !px-5"
        >
          <Icon name="plus" size={18} strokeWidth={2.5} />
          {addable ? "Add" : "Sold out"}
        </button>
      </div>
    </div>
  );
}
