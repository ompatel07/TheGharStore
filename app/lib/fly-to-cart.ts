// Signature add-to-cart moment: the product image flies to the cart icon, the
// icon bounces, then the cart drawer opens. Client-only; `motion` is loaded on
// first use so it never ships in the main bundle. Reduced motion: no flight,
// the drawer opens immediately (the cart count still updates and is announced).

import { openCartDrawer } from "~/lib/cart-drawer";

function prefersReducedMotion() {
  return (
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function findVisibleCartTarget(): HTMLElement | null {
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]"));
  return (
    targets.find((target) => {
      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.bottom <= 0 || rect.top >= window.innerHeight) return false;
      // Skip the compact bar while it is hidden off-screen.
      return !target.closest("[inert]");
    }) ?? null
  );
}

async function fly(source: HTMLElement, target: HTMLElement) {
  const { animate } = await import("motion");
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (from.width === 0) return;

  const size = Math.min(from.width, from.height, 220);
  const clone = document.createElement("img");
  const sourceImage = source instanceof HTMLImageElement ? source : source.querySelector("img");
  if (!sourceImage) return;
  clone.src = sourceImage.currentSrc || sourceImage.src;
  clone.alt = "";
  clone.setAttribute("aria-hidden", "true");
  Object.assign(clone.style, {
    position: "fixed",
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    objectFit: "cover",
    borderRadius: "9999px",
    boxShadow: "0 18px 40px -16px rgb(56 44 42 / 0.45)",
    zIndex: "100",
    pointerEvents: "none",
    willChange: "transform, opacity",
  });
  document.body.append(clone);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const endScale = 24 / size;

  try {
    await animate(
      clone,
      {
        x: [0, dx * 0.35, dx],
        y: [0, dy * 0.35 - 90, dy],
        scale: [1, 0.55, endScale],
        opacity: [1, 1, 0.35],
      },
      { duration: 0.75, ease: [0.45, 0, 0.2, 1] },
    );
  } finally {
    clone.remove();
  }

  void animate(target, { scale: [1, 1.3, 0.92, 1.06, 1] }, { duration: 0.55, ease: "easeOut" });
}

/**
 * Plays the add-to-cart moment from `source` (an image or an element containing
 * one), then opens the cart drawer. Never throws — the cart update itself is
 * handled by Hydrogen's form; this is only feedback.
 */
export async function playAddedToCart(source: HTMLElement | null) {
  if (typeof document === "undefined") return;
  const target = findVisibleCartTarget();

  if (source && target && !prefersReducedMotion()) {
    try {
      await fly(source, target);
      // Let the bounce and count tick register before the drawer covers them.
      await new Promise((resolve) => setTimeout(resolve, 260));
    } catch {
      // Animation is decorative; fall through to opening the drawer.
    }
  }

  openCartDrawer();
}
