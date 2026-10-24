import { AnimatePresence, LazyMotion, m } from "motion/react";
import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Link, useRouteLoaderData } from "react-router";

import { Icon } from "~/components/ui/Icon";
import { useCart, useCartForm } from "~/lib/cart";
import { shopifyImageUrl } from "~/lib/image";
import { formatPrice } from "~/lib/money";
import type { loader as rootLoader } from "~/root";

// Animation features load on demand, keeping motion out of the main bundle.
const loadMotionFeatures = () =>
  import("motion/react").then((mod) => mod.domAnimation);

export function hasPendingCost(pending: {
  cost?: boolean;
  discountCodes: Set<string>;
  lines: Set<string>;
}): boolean {
  return (
    pending.cost ?? (pending.lines.size > 0 || pending.discountCodes.size > 0)
  );
}

export function CartErrorBanner() {
  const errors = useCart((state) => state.errors);
  const [dismissedAt, setDismissedAt] = useState(0);
  const messages = useMemo(() => {
    const lines = [...errors.lines.values()].flatMap(
      (group) => group.userErrors,
    );
    return [...errors.network, ...errors.cart.userErrors, ...lines].map(
      (error) => error.message,
    );
  }, [errors]);

  if (messages.length === 0 || errors.lastUpdatedAt <= dismissedAt) return null;

  return (
    <div
      className="bg-peach-soft mx-4 mb-2 rounded-2xl p-3 text-sm"
      role="alert"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          {messages.map((message) => (
            <p key={message} className="text-critical">
              {message}
            </p>
          ))}
        </div>
        <button
          type="button"
          className="text-chocolate rounded-full px-2 py-1 text-xs font-semibold hover:bg-white"
          onClick={() => setDismissedAt(errors.lastUpdatedAt)}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

type CartLineView = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    compareAtAmountPerQuantity?: {
      amount: string;
      currencyCode: string;
    } | null;
  };
  attributes?: Array<{ key: string; value: string | null }>;
  merchandise?: {
    title?: string | null;
    selectedOptions?: Array<{ name: string; value: string }> | null;
    image?: { url: string; altText?: string | null } | null;
    product?: { title?: string | null; handle?: string | null } | null;
  } | null;
};

export function CartLineItem({
  line,
  emptyCartFocusId,
  onNavigate,
}: {
  line: CartLineView;
  emptyCartFocusId: string;
  onNavigate?: () => void;
}) {
  const { formProps, register } = useCartForm();
  const pendingLines = useCart((state) => state.pending.lines);
  const lineError = useCart((state) => state.errors.lines.get(line.id));
  const merchandise = line.merchandise;
  const product = merchandise?.product;
  const pending = pendingLines.has(line.id);
  const title = product?.title ?? merchandise?.title ?? "Product";
  const optionText = merchandise?.selectedOptions
    ?.filter((option) => option.value !== "Default Title")
    .map((option) => option.value)
    .join(" / ");
  const errorId = `cart-line-error-${line.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  // Removing a line unmounts the focused control; move focus first.
  const moveFocusBeforeRemoval = (event: SubmitEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (!form.contains(document.activeElement)) return;
    const intent = event.nativeEvent.submitter?.getAttribute("value");
    const quantity = new FormData(form).get("quantity");
    const removesLine =
      intent === "remove" ||
      (intent === "decrease" && line.quantity <= 1) ||
      (intent === "set" && Number(quantity) <= 0);
    if (!removesLine) return;
    const item = form.closest("li");
    const neighbour = item?.nextElementSibling ?? item?.previousElementSibling;
    const selector =
      intent === "set" ? 'input[name="quantity"]' : `button[value="${intent}"]`;
    const target =
      neighbour?.querySelector<HTMLElement>(selector) ??
      document.getElementById(emptyCartFocusId);
    target?.focus();
  };

  return (
    <div
      className={`flex gap-3 py-4 motion-safe:transition-opacity ${pending ? "opacity-60" : ""}`}
      data-testid="cart-line"
      {...(pending ? { "aria-busy": "true" } : {})}
    >
      <div className="bg-cream-deep size-20 shrink-0 overflow-hidden rounded-2xl">
        {merchandise?.image ? (
          <img
            src={shopifyImageUrl(merchandise.image.url, { width: 160 })}
            alt={merchandise.image.altText || title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-on-surface line-clamp-2 text-[0.95rem] leading-snug font-semibold">
            {product?.handle ? (
              <Link
                to={`/products/${product.handle}`}
                onClick={onNavigate}
                className="hover:text-burgundy"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </p>
          <p
            className={`text-on-surface shrink-0 font-bold ${pending ? "opacity-50" : ""}`}
          >
            {formatPrice(line.cost.totalAmount)}
          </p>
        </div>
        {optionText ? (
          <p className="text-on-surface-secondary mt-0.5 text-sm">
            {optionText}
          </p>
        ) : null}
        {line.attributes
          ?.filter((attr) => !attr.key.startsWith("_") && attr.value != null)
          .map((attr) => (
            <p
              key={attr.key}
              className="text-on-surface-secondary mt-0.5 text-sm italic"
            >
              {attr.key}: {attr.value}
            </p>
          ))}
        <form
          {...formProps({ beforeSubmit: moveFocusBeforeRemoval })}
          className="mt-2.5 flex items-center gap-2"
        >
          <button {...register("set")} />
          <input type="hidden" {...register("lineId", { value: line.id })} />
          <div className="border-border inline-flex h-10 items-center rounded-full border bg-white">
            <button
              type="submit"
              {...register("decrease")}
              className="hover:bg-peach-soft inline-flex size-10 items-center justify-center rounded-full disabled:opacity-40"
              aria-label={`Decrease quantity for ${title}`}
            >
              <Icon name="minus" size={16} strokeWidth={2.25} />
            </button>
            <input
              {...register("quantity", {
                value: line.quantity,
                interactive: true,
              })}
              className={`number-reset !h-10 !w-9 !rounded-none !border-0 !bg-transparent !p-0 text-center font-bold ${pending ? "opacity-50" : ""}`}
              aria-label={`Quantity for ${title}`}
              aria-describedby={
                lineError?.userErrors.length ? errorId : undefined
              }
              aria-invalid={lineError?.userErrors.length ? true : undefined}
            />
            <button
              type="submit"
              {...register("increase")}
              className="hover:bg-peach-soft inline-flex size-10 items-center justify-center rounded-full disabled:opacity-40"
              aria-label={`Increase quantity for ${title}`}
            >
              <Icon name="plus" size={16} strokeWidth={2.25} />
            </button>
          </div>
          <button
            type="submit"
            {...register("remove")}
            className="text-chocolate-muted hover:text-critical hover:bg-peach-soft ms-auto inline-flex size-10 items-center justify-center rounded-full"
            aria-label={`Remove ${title}`}
          >
            <Icon name="trash" size={19} />
          </button>
        </form>
        {lineError?.userErrors.length ? (
          <p id={errorId} className="text-critical mt-2 text-sm" role="alert">
            {lineError.userErrors[0]?.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Line list with spring enter/exit (transform + opacity only). */
export function CartLineList({
  emptyCartFocusId,
  onNavigate,
}: {
  emptyCartFocusId: string;
  onNavigate?: () => void;
}) {
  const lines = useCart((state) => state.data.lines.nodes);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <ul
        role="list"
        className="divide-y divide-[color-mix(in_oklab,var(--color-gold)_35%,transparent)]"
      >
        <AnimatePresence initial={false}>
          {lines.map((line) => (
            <m.li
              key={line.id}
              layout={reduceMotion ? false : "position"}
              initial={reduceMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={
                reduceMotion
                  ? undefined
                  : { opacity: 0, x: -24, transition: { duration: 0.2 } }
              }
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              <CartLineItem
                line={line}
                emptyCartFocusId={emptyCartFocusId}
                onNavigate={onNavigate}
              />
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
    </LazyMotion>
  );
}

export function CartEmpty({ onNavigate }: { onNavigate?: () => void }) {
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const collections = rootData?.siteContent.collections.slice(0, 4) ?? [];
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
      <span className="icon-chip [--chip-size:5rem]">
        <Icon name="cart" size={36} strokeWidth={1.5} />
      </span>
      <p className="type-heading-lg text-on-surface mt-5">Your cart is empty</p>
      <p className="type-hand text-terracotta-deep mt-1 text-xl">
        chaliye, kuch accha dhoondte hain!
      </p>
      <Link to="/collections" className="button-cta mt-6" onClick={onNavigate}>
        Start shopping
      </Link>
      {collections.length > 0 ? (
        <ul role="list" className="mt-6 flex flex-wrap justify-center gap-2">
          {collections.map((collection) => (
            <li key={collection.handle}>
              <Link
                to={`/collections/${collection.handle}`}
                onClick={onNavigate}
                className="bg-peach-soft hover:bg-peach inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold"
              >
                {collection.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Free-shipping progress — shown only when `store_promises.free_shipping_threshold`
 * is set (it must match the free rate configured in Shopify shipping settings).
 */
export function FreeShippingProgress() {
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const threshold =
    rootData?.siteContent.storePromises.freeShippingThreshold ?? null;
  const subtotal = useCart((state) => state.data.cost.subtotalAmount);
  if (
    !threshold ||
    !subtotal ||
    subtotal.currencyCode !== threshold.currencyCode
  )
    return null;

  const target = Number.parseFloat(threshold.amount);
  const current = Number.parseFloat(subtotal.amount);
  const progress = Math.min(1, current / target);
  const remaining = Math.max(0, target - current);
  const done = remaining <= 0;

  return (
    <div className="bg-peach-soft/70 rounded-2xl px-4 py-3">
      <p
        className="text-on-surface flex items-center gap-2 text-sm font-semibold"
        aria-live="polite"
      >
        <Icon name="truck" size={18} className="text-terracotta-deep" />
        {done ? (
          "You’ve unlocked free shipping!"
        ) : (
          <span>
            Add{" "}
            <strong>
              {formatPrice({
                amount: remaining.toFixed(2),
                currencyCode: threshold.currencyCode as "INR",
              })}
            </strong>{" "}
            more for free shipping
          </span>
        )}
      </p>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-white"
        aria-hidden="true"
      >
        <div
          className="bg-terracotta-deep h-full origin-left rounded-full motion-safe:transition-transform motion-safe:duration-500"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </div>
  );
}

export function DiscountForm() {
  const { formProps, register } = useCartForm();
  const discountCodes = useCart((state) => state.data.discountCodes);
  const pendingCodes = useCart((state) => state.pending.discountCodes);
  const [open, setOpen] = useState(discountCodes.length > 0);

  return (
    <div>
      {discountCodes.length > 0 ? (
        <ul role="list" className="mb-2 flex flex-wrap gap-2">
          {discountCodes.map((discount) => (
            <li key={discount.code}>
              <form {...formProps()} className="contents">
                <input
                  type="hidden"
                  {...register("discountCode", { value: discount.code })}
                />
                <span
                  className={`inline-flex min-h-9 items-center gap-1.5 rounded-full ps-3 pe-1 text-sm font-semibold ${
                    discount.applicable
                      ? "bg-success/10 text-success"
                      : "bg-peach-soft text-critical"
                  } ${pendingCodes.has(discount.code) ? "opacity-60" : ""}`}
                >
                  {discount.code}
                  {discount.applicable ? "" : " · not applicable"}
                  <button
                    type="submit"
                    {...register("discount-remove")}
                    className="inline-flex size-7 items-center justify-center rounded-full hover:bg-white"
                    aria-label={`Remove discount ${discount.code}`}
                  >
                    <Icon name="close" size={14} strokeWidth={2.5} />
                  </button>
                </span>
              </form>
            </li>
          ))}
        </ul>
      ) : null}
      {open ? (
        <form
          {...formProps({
            beforeSubmit: (event) => {
              const input =
                event.currentTarget.elements.namedItem("discountCode");
              const value =
                input instanceof HTMLInputElement ? input.value.trim() : "";
              if (
                !value ||
                discountCodes.some(
                  (d) => d.code.toLowerCase() === value.toLowerCase(),
                )
              ) {
                event.preventDefault();
              }
            },
          })}
          className="flex gap-2"
        >
          <label htmlFor="cart-discount" className="sr-only">
            Discount code
          </label>
          <input
            id="cart-discount"
            {...register("discountCode", { defaultValue: "" })}
            placeholder="Discount code"
            autoComplete="off"
            className="!h-11 flex-1 bg-white uppercase placeholder:normal-case"
          />
          <button
            type="submit"
            {...register("discount-apply")}
            className="border-burgundy text-burgundy hover:bg-burgundy h-11 rounded-full border-2 px-4 text-sm font-bold hover:text-white"
          >
            Apply
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-burgundy inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
        >
          <Icon name="plus" size={16} strokeWidth={2.25} />
          Have a discount code?
        </button>
      )}
    </div>
  );
}

export function CartSummary() {
  const cart = useCart((state) => state.data);
  const pending = useCart((state) => state.pending);
  const revalidating = useCart(
    (state) => "revalidating" in state && state.revalidating === true,
  );
  const isPending = hasPendingCost(pending) || revalidating;
  const subtotal = cart.cost.subtotalAmount;
  const total = cart.cost.totalAmount;
  const showSubtotal = subtotal && subtotal.amount !== total.amount;

  return (
    <div className="flex flex-col gap-3" aria-busy={isPending}>
      <FreeShippingProgress />
      <DiscountForm />
      <dl className={`grid gap-1.5 ${isPending ? "opacity-60" : ""}`}>
        {showSubtotal ? (
          <div className="text-on-surface-secondary flex justify-between text-sm">
            <dt>Subtotal</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
        ) : null}
        <div className="text-on-surface flex items-baseline justify-between">
          <dt className="font-semibold">
            Total
            {isPending ? (
              <span className="text-on-surface-secondary text-sm font-normal">
                {" "}
                (updating)
              </span>
            ) : null}
          </dt>
          <dd className="text-2xl font-bold">{formatPrice(total)}</dd>
        </div>
      </dl>
      <p className="text-on-surface-secondary text-xs">
        Shipping and taxes are shown at checkout.
      </p>
      {cart.checkoutUrl ? (
        <a href={cart.checkoutUrl} className="button-cta h-14 w-full !text-lg">
          <Icon name="shield" size={20} />
          Checkout securely
        </a>
      ) : null}
    </div>
  );
}
