import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

import { Logo } from "~/components/Logo";
import { HeaderSearch } from "~/components/search/HeaderSearch";
import { Icon } from "~/components/ui/Icon";
import { useCart } from "~/lib/cart";
import { CART_DRAWER_ID, SEARCH_DRAWER_ID, openDialogFromLinkClick } from "~/lib/cart-drawer";
import type { NavItem } from "~/lib/site-content";

import { MobileNav, MobileNavTrigger } from "./MobileNav";

function cartCountLabel(count: number) {
  return count === 1 ? "Cart, 1 item" : `Cart, ${count} items`;
}

function liveCartCountLabel(count: number) {
  return count === 1 ? "1 item in cart" : `${count} items in cart`;
}

function displayCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

type HeaderProps = {
  mainMenu: NavItem[];
  collections: { handle: string; title: string }[];
};

export function Header({ mainMenu, collections }: HeaderProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  // The compact bar slides in (transform only) once the full header scrolls away.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setCompact(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header className="bg-surface curve-bottom relative z-30 shadow-[0_14px_30px_-24px_rgb(56_44_42/0.45)]">
        {/* Mobile: menu · logo · account · cart, then the search pill */}
        <div className="px-margin flex items-center gap-1 pt-2 lg:hidden">
          <MobileNavTrigger />
          <div className="flex flex-1 justify-center">
            <Logo height={56} priority />
          </div>
          <AccountLink compact />
          <CartButton />
        </div>
        <div className="px-margin pt-2 pb-5 lg:hidden">
          <SearchPillButton />
        </div>

        {/* Desktop: logo spans two rows; search + actions, then the menu */}
        <div className="max-w-page px-margin mx-auto hidden grid-cols-[auto_1fr] gap-x-10 pt-3 pb-5 lg:grid">
          <div className="row-span-2 flex items-center">
            <Logo height={112} priority />
          </div>
          <div className="flex items-center gap-6 pt-2">
            <HeaderSearch className="max-w-2xl flex-1" />
            <div className="ms-auto flex items-center gap-1">
              <AccountLink />
              <CartButton labelled />
            </div>
          </div>
          <PrimaryNav items={mainMenu} collections={collections} />
        </div>
      </header>
      <div ref={sentinelRef} aria-hidden="true" className="h-px" />

      <CompactBar visible={compact} />
      <MobileNav mainMenu={mainMenu} collections={collections} />
    </>
  );
}

/** Thin sticky bar that slides down after scrolling past the header. */
function CompactBar({ visible }: { visible: boolean }) {
  return (
    <div
      className={`bg-surface/95 fixed inset-x-0 top-0 z-40 border-b border-[color-mix(in_oklab,var(--color-gold)_40%,transparent)] backdrop-blur-md motion-safe:transition-transform motion-safe:duration-300 ${
        visible ? "translate-y-0" : "pointer-events-none -translate-y-full"
      }`}
      inert={!visible}
      data-compact-header
    >
      <div className="max-w-page px-margin mx-auto flex h-14 items-center gap-2">
        <div className="lg:hidden">
          <MobileNavTrigger />
        </div>
        <Logo height={40} className="max-lg:mx-auto" />
        <div className="ms-auto flex items-center gap-1">
          <Link
            to="/search"
            className="hover:bg-peach-soft inline-flex size-11 items-center justify-center rounded-full"
            aria-label="Search"
            aria-controls={SEARCH_DRAWER_ID}
            aria-haspopup="dialog"
            onClick={(event) => openDialogFromLinkClick(event, SEARCH_DRAWER_ID)}
          >
            <Icon name="search" size={22} />
          </Link>
          <span className="max-lg:hidden">
            <AccountLink compact />
          </span>
          <CartButton />
        </div>
      </div>
    </div>
  );
}

function SearchPillButton() {
  return (
    <Link
      to="/search"
      className="border-border text-on-surface-secondary flex h-12 w-full items-center gap-3 rounded-full border bg-white ps-4 pe-1.5 text-[0.95rem] shadow-sm"
      aria-controls={SEARCH_DRAWER_ID}
      aria-haspopup="dialog"
      data-testid="search-trigger"
      onClick={(event) => openDialogFromLinkClick(event, SEARCH_DRAWER_ID)}
    >
      <Icon name="search" size={20} />
      <span className="flex-1 truncate">Search décor, lighting, kitchen…</span>
      <span
        className="bg-cta text-cta-text inline-flex h-9 w-11 items-center justify-center rounded-full"
        aria-hidden="true"
      >
        <Icon name="search" size={18} strokeWidth={2.25} />
      </span>
    </Link>
  );
}

function AccountLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/account"
      className={`text-on-surface hover:bg-peach-soft inline-flex items-center justify-center rounded-2xl motion-safe:transition-colors ${
        compact ? "size-11" : "min-h-14 min-w-16 flex-col gap-0.5 px-2 text-xs font-medium"
      }`}
      aria-label={compact ? "Account" : undefined}
    >
      <Icon name="user" size={compact ? 22 : 24} />
      {compact ? null : <span>Account</span>}
    </Link>
  );
}

/** Cart trigger. `data-cart-target` marks the fly-to-cart destination. */
export function CartButton({ labelled = false }: { labelled?: boolean }) {
  const totalQuantity = useCart((state) => state.data.totalQuantity);

  return (
    <>
      <Link
        to="/cart"
        className={`text-on-surface hover:bg-peach-soft relative inline-flex items-center justify-center rounded-2xl motion-safe:transition-colors ${
          labelled ? "min-h-14 min-w-16 flex-col gap-0.5 px-2 text-xs font-medium" : "size-11"
        }`}
        aria-label={cartCountLabel(totalQuantity)}
        aria-controls={CART_DRAWER_ID}
        aria-haspopup="dialog"
        data-testid="cart-trigger"
        onClick={(event) => openDialogFromLinkClick(event, CART_DRAWER_ID)}
      >
        <span className="relative inline-flex" data-cart-target aria-hidden="true">
          <Icon name="cart" size={labelled ? 24 : 22} />
          {totalQuantity > 0 ? (
            <span
              key={totalQuantity}
              className="cart-count-pop bg-cta text-cta-text absolute -end-2.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.7rem] font-bold"
            >
              {displayCount(totalQuantity)}
            </span>
          ) : null}
        </span>
        {labelled ? <span aria-hidden="true">Cart</span> : null}
      </Link>
      {labelled ? (
        <span aria-live="polite" aria-atomic="true" className="sr-only">
          {liveCartCountLabel(totalQuantity)}
        </span>
      ) : null}
    </>
  );
}

function PrimaryNav({
  items,
  collections,
}: {
  items: NavItem[];
  collections: { handle: string; title: string }[];
}) {
  const location = useLocation();
  // Fallback while the Shopify main menu is empty: the store's collections.
  const navItems: NavItem[] =
    items.length > 0
      ? items
      : collections.map((collection) => ({
          id: collection.handle,
          title: collection.title,
          to: `/collections/${collection.handle}`,
          external: false,
          items: [],
        }));

  if (navItems.length === 0) return null;

  return (
    <nav aria-label="Main" className="mt-3 -ms-3">
      <ul role="list" className="flex flex-wrap items-center gap-1">
        {navItems.map((item) => {
          const active =
            item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
          const pillClass = `inline-flex min-h-10 items-center gap-1 rounded-full px-4 text-[0.95rem] font-semibold whitespace-nowrap motion-safe:transition-colors ${
            active ? "bg-peach-soft text-burgundy" : "text-on-surface hover:bg-peach-soft/70"
          }`;

          if (item.items.length === 0) {
            return (
              <li key={item.id}>
                <NavItemLink item={item} className={pillClass} active={active} />
              </li>
            );
          }

          return (
            <li key={item.id} className="nav-has-dropdown relative">
              <NavItemLink item={item} className={pillClass} active={active}>
                <Icon name="chevron-down" size={16} />
              </NavItemLink>
              <div className="nav-dropdown">
                <ul role="list" className="surface-card grid min-w-56 gap-0.5 p-2">
                  {item.items.map((child) => (
                    <li key={child.id}>
                      <NavItemLink
                        item={child}
                        className="hover:bg-peach-soft flex min-h-10 items-center rounded-xl px-3 text-sm font-medium"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavItemLink({
  item,
  className,
  active,
  children,
}: {
  item: NavItem;
  className: string;
  active?: boolean;
  children?: React.ReactNode;
}) {
  if (item.external) {
    return (
      <a href={item.to} className={className} rel="noopener">
        {item.title}
        {children}
      </a>
    );
  }
  return (
    <NavLink
      to={item.to}
      className={className}
      prefetch="intent"
      aria-current={active ? "page" : undefined}
    >
      {item.title}
      {children}
    </NavLink>
  );
}
