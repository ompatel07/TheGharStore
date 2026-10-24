import { useEffect, useState } from "react";

import {
  CartEmpty,
  CartErrorBanner,
  CartLineList,
  CartRecommendations,
  CartSummary,
  hasPendingCost,
} from "~/components/cart/CartParts";
import { Icon } from "~/components/ui/Icon";
import { useCart } from "~/lib/cart";
import {
  closeCartDrawer,
  configureOpenCartAction,
  CART_DRAWER_ID,
} from "~/lib/cart-drawer";

import { publishCartViewed } from "./AnalyticsTrackers";

export { CartLineItem } from "~/components/cart/CartParts";

function useCartStatusMessage(): string {
  const pending = useCart((state) => state.pending);
  const revalidating = useCart(
    (state) => "revalidating" in state && state.revalidating === true,
  );
  const networkErrors = useCart((state) => state.errors.network);
  const isPending = hasPendingCost(pending) || revalidating;
  const [sawPending, setSawPending] = useState(false);

  useEffect(() => {
    if (isPending) setSawPending(true);
  }, [isPending]);

  if (isPending) return "Updating cart totals";
  if (sawPending && networkErrors.length === 0) return "Cart totals updated";
  return "";
}

export function CartDrawer() {
  const totalQuantity = useCart((state) => state.data.totalQuantity);
  const cart = useCart((state) => state.data);
  const loading = useCart((state) => state.loading);
  const statusMessage = useCartStatusMessage();
  const hasLines = cart.lines.nodes.length > 0;

  useEffect(() => {
    configureOpenCartAction();
    const dialog = document.getElementById(CART_DRAWER_ID);
    if (!(dialog instanceof HTMLDialogElement)) return;
    const handleToggle = () => {
      if (dialog.open) publishCartViewed(cart);
    };
    dialog.addEventListener("toggle", handleToggle);
    return () => dialog.removeEventListener("toggle", handleToggle);
  }, [cart]);

  return (
    <>
      <span
        role="status"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        data-cart-status
      >
        {statusMessage}
      </span>
      <dialog
        id={CART_DRAWER_ID}
        className="drawer-right bg-surface text-on-surface"
        aria-labelledby="cart-drawer-title"
        data-testid="cart-drawer"
        closedby="any"
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center border-b border-[color-mix(in_oklab,var(--color-gold)_40%,transparent)] py-3 ps-5 pe-2">
            <div className="flex flex-1 items-center gap-2.5">
              <h2
                id="cart-drawer-title"
                tabIndex={-1}
                className="type-heading-lg text-on-surface"
              >
                Your cart
              </h2>
              {totalQuantity > 0 ? (
                <span className="bg-peach-soft text-burgundy rounded-full px-2.5 py-0.5 text-sm font-bold">
                  {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              commandfor={CART_DRAWER_ID}
              command="close"
              className="hover:bg-peach-soft inline-flex size-11 items-center justify-center rounded-full"
              aria-label="Close cart"
              onClick={() => closeCartDrawer()}
            >
              <Icon name="close" size={22} />
            </button>
          </div>
          <CartErrorBanner />
          <div className="flex-1 overflow-y-auto px-5">
            {loading ? (
              <div className="grid gap-4 py-4" aria-label="Loading cart">
                {[0, 1].map((index) => (
                  <div key={index} className="flex gap-3">
                    <span className="skeleton size-20 shrink-0" />
                    <span className="flex flex-1 flex-col gap-2">
                      <span className="skeleton h-4 w-3/4" />
                      <span className="skeleton h-4 w-1/3" />
                    </span>
                  </div>
                ))}
              </div>
            ) : hasLines ? (
              <>
                <CartLineList
                  emptyCartFocusId="cart-drawer-title"
                  onNavigate={() => closeCartDrawer()}
                />
                <CartRecommendations onNavigate={() => closeCartDrawer()} />
              </>
            ) : (
              <CartEmpty onNavigate={() => closeCartDrawer()} />
            )}
          </div>
          {hasLines ? (
            <div className="bg-cream-deep/60 shrink-0 border-t border-[color-mix(in_oklab,var(--color-gold)_40%,transparent)] p-5">
              <CartSummary />
            </div>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
