import { useEffect, useState } from "react";
import { Link } from "react-router";

import type { ProductCardData } from "~/components/ProductCard";
import { Icon } from "~/components/ui/Icon";
import { useCart } from "~/lib/cart";
import { openCartDrawer } from "~/lib/cart-drawer";
import { shopifyImageUrl } from "~/lib/image";
import { formatPrice } from "~/lib/money";
import { deliveryEstimate, deliveryRangeText, type TrustBadge } from "~/lib/promises";
import type { StorePromises } from "~/lib/site-content";

/**
 * Delivery & service card under the buy buttons. The delivery date is worked
 * out in the visitor's browser from the store's own delivery window (server
 * HTML shows the plain range, so there is no hydration mismatch).
 */
const PIN_KEY = "ghar:pincode";
const PIN_PATTERN = /^[1-9][0-9]{5}$/;

export function DeliveryCard({ promises, badges }: { promises: StorePromises; badges: TrustBadge[] }) {
  const [estimate, setEstimate] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [pinError, setPinError] = useState(false);
  useEffect(() => {
    setEstimate(deliveryEstimate(promises));
    try {
      const stored = window.localStorage.getItem(PIN_KEY);
      if (stored && PIN_PATTERN.test(stored)) {
        setSavedPin(stored);
        setPin(stored);
      }
    } catch {
      // Storage blocked: the visitor can still type a pincode.
    }
  }, [promises]);

  const checkPin = (event: React.FormEvent) => {
    event.preventDefault();
    const value = pin.trim();
    if (!PIN_PATTERN.test(value)) {
      setPinError(true);
      return;
    }
    setPinError(false);
    setSavedPin(value);
    try {
      window.localStorage.setItem(PIN_KEY, value);
    } catch {
      // Not remembered; fine.
    }
  };
  const range = deliveryRangeText(promises);
  const rest = badges.filter((badge) => badge.id !== "shipping" && badge.id !== "support");
  const shipping = badges.find((badge) => badge.id === "shipping");
  if (!shipping && rest.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-white">
      {shipping ? (
        <div className="bg-peach-soft/60 flex items-start gap-3 p-4">
          <span className="icon-chip bg-white [--chip-size:2.75rem]">
            <Icon name="truck" size={22} />
          </span>
          <div className="min-w-0 text-[0.92rem]">
            <p className="text-on-surface font-bold">
              {promises.freeShippingAll ? "Free delivery" : shipping.title}
              {estimate ? (
                <>
                  {" "}
                  by <span className="text-burgundy">{estimate}</span>
                </>
              ) : range ? (
                <> in {range}</>
              ) : null}
            </p>
            <p className="text-on-surface-secondary mt-0.5 leading-snug">
              {promises.dispatchNote ?? shipping.text}
            </p>
          </div>
        </div>
      ) : null}
      {shipping && estimate ? (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          {savedPin ? (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.88rem]">
              <Icon name="map-pin" size={16} className="text-terracotta-deep" />
              <span className="text-on-surface">
                Estimated delivery to <strong>{savedPin}</strong>: <strong className="text-burgundy">{estimate}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSavedPin(null)}
                className="text-on-surface-secondary ms-auto text-xs font-bold underline underline-offset-2"
              >
                Change
              </button>
            </p>
          ) : (
            <form onSubmit={checkPin} className="flex items-center gap-2" noValidate>
              <label htmlFor="pdp-pincode" className="sr-only">
                Your pincode
              </label>
              <span className="text-terracotta-deep">
                <Icon name="map-pin" size={18} />
              </span>
              <input
                id="pdp-pincode"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                placeholder="Enter pincode for delivery date"
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
                aria-invalid={pinError || undefined}
                aria-describedby={pinError ? "pdp-pincode-error" : undefined}
                className="text-on-surface min-w-0 flex-1 !rounded-full !border-[var(--color-border)] !bg-[var(--color-cream)] !px-4 !py-2 text-sm"
              />
              <button type="submit" className="btn btn-dark !min-h-10 !px-4 !text-sm">
                Check
              </button>
            </form>
          )}
          {pinError ? (
            <p id="pdp-pincode-error" className="text-critical mt-1.5 text-xs font-semibold">
              Please enter a valid 6-digit pincode.
            </p>
          ) : (
            <p className="text-on-surface-secondary mt-1.5 text-xs">Estimate from our usual delivery time; remote areas can take longer.</p>
          )}
        </div>
      ) : null}
      {rest.length > 0 ? (
        <ul role="list" className="grid grid-cols-3 divide-x divide-[var(--color-border)] border-t border-[var(--color-border)]">
          {rest.slice(0, 3).map((badge) => {
            const body = (
              <>
                <span className="trust-icon text-terracotta-deep">
                  <Icon name={badge.icon} size={24} />
                </span>
                <span className="text-on-surface text-[0.78rem] leading-tight font-bold">{badge.title}</span>
              </>
            );
            return (
              <li key={badge.id}>
                {badge.to ? (
                  <Link
                    to={badge.to}
                    className="flex h-full flex-col items-center gap-1.5 px-2 py-3.5 text-center transition-colors hover:bg-[var(--color-peach-soft)]"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="flex h-full flex-col items-center gap-1.5 px-2 py-3.5 text-center">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** Share on WhatsApp (how most Indian shoppers ask family "should I buy this?") + copy link. */
export function ShareRow({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the link is still visible in the address bar.
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-on-surface-secondary me-1 font-semibold">Share</span>
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#e7f6ec] px-4 font-bold text-[#1d6b3b] transition-colors hover:bg-[#d3efdc]"
      >
        <Icon name="whatsapp" size={18} />
        WhatsApp
      </a>
      <button
        type="button"
        onClick={() => void copy()}
        className="border-border text-on-surface hover:bg-peach-soft inline-flex min-h-10 items-center gap-2 rounded-full border px-4 font-bold transition-colors"
        aria-live="polite"
      >
        {copied ? <Icon name="check" size={16} /> : null}
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}

type BundleItem = {
  key: string;
  merchandiseId: string;
  title: string;
  handle: string;
  image: { url: string; altText?: string | null } | null;
  price: { amount: string; currencyCode: string };
};

function isSingleChoice(product: ProductCardData) {
  return product.options.every((option) => option.optionValues.length <= 1);
}

/** Card data → bundle line (only simple, in-stock products can join a bundle). */
export function bundleItemFrom(product: ProductCardData): BundleItem | null {
  const variant = product.selectedOrFirstAvailableVariant;
  if (!variant?.availableForSale || !isSingleChoice(product)) return null;
  return {
    key: product.id,
    merchandiseId: variant.id,
    title: product.title,
    handle: product.handle,
    image: variant.image ?? product.featuredImage ?? null,
    price: variant.price,
  };
}

/**
 * "Buy it together": this product plus two related ones, each with a
 * checkbox, a live total and one button that adds the ticked items. Uses
 * Shopify's cart runtime (`Shopify.actions.updateCart`); recommendations come
 * from Shopify, prices are the real ones.
 */
export function BuyTogether({ main, related }: { main: BundleItem; related: ProductCardData[] }) {
  const extras = related.map(bundleItemFrom).filter((item): item is BundleItem => Boolean(item)).slice(0, 2);
  const items = [main, ...extras];
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((item) => [item.key, true])),
  );
  const [status, setStatus] = useState<"idle" | "adding" | "error">("idle");
  const cartId = useCart((state) => state.data.id);
  const cartLoading = useCart((state) => state.loading);
  if (extras.length === 0) return null;

  const selected = items.filter((item) => checked[item.key]);
  const total = selected.reduce((sum, item) => sum + Number.parseFloat(item.price.amount), 0);
  const currencyCode = main.price.currencyCode;

  const addSelected = async () => {
    const updateCart = window.Shopify?.actions?.updateCart;
    if (!updateCart || updateCart.isDefault() || cartLoading || selected.length === 0) {
      setStatus("error");
      return;
    }
    setStatus("adding");
    const lines = selected.map((item) => ({ merchandiseId: item.merchandiseId, quantity: 1 }));
    try {
      // No cart yet: the first add creates it; send the rest once it exists.
      if (!cartId) {
        await updateCart({ lines: lines.slice(0, 1) });
        if (lines.length > 1) await updateCart({ lines: lines.slice(1) });
      } else {
        await updateCart({ lines });
      }
      setStatus("idle");
      openCartDrawer();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section aria-labelledby="together-title" className="rounded-[1.75rem] bg-white p-5 shadow-[var(--shadow)] md:p-8">
      <h2 id="together-title" className="ed-display ed-sm text-on-surface">
        Buy it together
      </h2>
      <p className="text-on-surface-secondary mt-1 text-sm">Picked to go with this one. Untick anything you don't need.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <ol className="flex items-center gap-2 md:gap-3">
          {items.map((item, index) => (
            <li key={item.key} className="flex items-center gap-2 md:gap-3">
              {index > 0 ? (
                <span aria-hidden="true" className="text-on-surface-secondary">
                  <Icon name="plus" size={18} strokeWidth={2.5} />
                </span>
              ) : null}
              <Link
                to={`/products/${item.handle}`}
                className={`block size-20 overflow-hidden rounded-2xl border-2 transition-[opacity,border-color] duration-300 md:size-28 ${
                  checked[item.key] ? "border-burgundy" : "border-transparent opacity-45"
                }`}
              >
                {item.image ? (
                  <img
                    src={shopifyImageUrl(item.image.url, { width: 240 })}
                    alt={item.image.altText ?? item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </Link>
            </li>
          ))}
        </ol>

        <div>
          <ul role="list" className="grid gap-2.5">
            {items.map((item, index) => (
              <li key={item.key}>
                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(checked[item.key])}
                    onChange={(event) => setChecked((prev) => ({ ...prev, [item.key]: event.target.checked }))}
                    className="accent-burgundy mt-0.5 size-5 shrink-0"
                  />
                  <span className="text-on-surface flex-1 leading-snug">
                    {index === 0 ? <span className="font-bold">This item: </span> : null}
                    {item.title}
                  </span>
                  <span className="text-on-surface shrink-0 font-bold">{formatPrice(item.price)}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="border-border mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-on-surface">
              <span className="text-on-surface-secondary text-sm">Total for {selected.length}: </span>
              <span className="font-heading text-2xl font-extrabold">
                {formatPrice({ amount: total.toFixed(2), currencyCode })}
              </span>
            </p>
            <button
              type="button"
              onClick={() => void addSelected()}
              disabled={selected.length === 0 || status === "adding"}
              className="button-cta h-12 !px-6 disabled:opacity-60"
            >
              <Icon name="cart" size={20} />
              {status === "adding" ? "Adding…" : `Add ${selected.length} to cart`}
            </button>
          </div>
          {status === "error" ? (
            <p role="alert" className="text-critical mt-2 text-sm">
              Couldn't add these just now. Please try again, or add them one by one.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
