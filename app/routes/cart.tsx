import { useEffect } from "react";

import { publishCartViewed } from "~/components/AnalyticsTrackers";
import {
  CartEmpty,
  CartErrorBanner,
  CartLineList,
  CartSummary,
} from "~/components/cart/CartParts";
import { BRAND_NAME } from "~/components/Logo";
import { useCart } from "~/lib/cart";

export function meta() {
  return [
    { title: `Your cart · ${BRAND_NAME}` },
    { name: "robots", content: "noindex" },
  ];
}

/** Full-page cart (no-JS fallback for the drawer, and a direct /cart link). */
export default function CartRoute() {
  const cart = useCart((state) => state.data);
  const loading = useCart((state) => state.loading);
  const hasLines = cart.lines.nodes.length > 0;

  useEffect(() => {
    publishCartViewed(cart);
  }, [cart]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="max-w-page px-margin mx-auto w-full flex-1 py-10"
    >
      <h1
        id="cart-page-title"
        tabIndex={-1}
        className="type-heading-xl text-on-surface mb-8"
      >
        Your cart
      </h1>
      <CartErrorBanner />
      {loading ? (
        <div className="grid gap-4" aria-label="Loading cart">
          <span className="skeleton h-24" />
          <span className="skeleton h-24" />
        </div>
      ) : hasLines ? (
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div className="rounded-[var(--radius-xl)] bg-white px-5 py-2 shadow-[var(--shadow-sm)]">
            <CartLineList emptyCartFocusId="cart-page-title" />
          </div>
          <aside
            className="bg-cream-deep rounded-[var(--radius-xl)] p-6 lg:sticky lg:top-20"
            aria-label="Order summary"
          >
            <h2 className="type-heading-md text-on-surface mb-4">
              Order summary
            </h2>
            <CartSummary />
          </aside>
        </div>
      ) : (
        <div className="rounded-[var(--radius-xl)] bg-white shadow-[var(--shadow-sm)]">
          <CartEmpty />
        </div>
      )}
    </main>
  );
}
