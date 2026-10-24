import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

import { Logo } from "~/components/Logo";
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
  const [scrolled, setScrolled] = useState(false);

  // One slim sticky bar; it frosts and the logo eases down once the page scrolls.
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <header className="site-header bg-surface sticky top-0 z-40" data-scrolled={scrolled}>
        <div className="max-w-page px-margin relative mx-auto flex h-16 items-center gap-1 lg:h-[5.5rem] lg:gap-8">
          <div className="flex items-center lg:hidden">
            <MobileNavTrigger />
            <SearchButton />
          </div>

          <div className="header-logo max-lg:absolute max-lg:start-1/2 max-lg:-translate-x-1/2">
            <Logo height={46} priority className="lg:hidden" />
            <Logo height={68} priority className="max-lg:hidden" />
          </div>

          <PrimaryNav items={mainMenu} collections={collections} />

          <div className="ms-auto flex items-center gap-0.5">
            <span className="max-lg:hidden">
              <SearchButton />
            </span>
            <span className="max-lg:hidden">
              <AccountLink compact />
            </span>
            <CartButton />
          </div>
        </div>
      </header>

      <MobileNav mainMenu={mainMenu} collections={collections} />
    </>
  );
}

function SearchButton() {
  return (
    <Link
      to="/search"
      className="text-on-surface hover:bg-peach-soft inline-flex size-11 items-center justify-center rounded-full motion-safe:transition-colors"
      aria-label="Search"
      aria-controls={SEARCH_DRAWER_ID}
      aria-haspopup="dialog"
      data-testid="search-trigger"
      onClick={(event) => openDialogFromLinkClick(event, SEARCH_DRAWER_ID)}
    >
      <Icon name="search" size={22} />
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
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {liveCartCountLabel(totalQuantity)}
      </span>
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
    <nav aria-label="Main" className="hidden lg:block">
      <ul role="list" className="flex items-center gap-1 xl:gap-3">
        {navItems.map((item) => {
          const active =
            item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
          const pillClass = `inline-flex min-h-11 items-center gap-1 px-3 text-[0.95rem] font-semibold whitespace-nowrap motion-safe:transition-colors ${
            active ? "text-burgundy" : "text-on-surface hover:text-burgundy"
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
      <span className="link-sweep">{item.title}</span>
      {children}
    </NavLink>
  );
}
