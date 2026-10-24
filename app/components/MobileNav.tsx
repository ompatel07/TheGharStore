import { Link, useLocation } from "react-router";

import { Logo } from "~/components/Logo";
import { Icon } from "~/components/ui/Icon";
import { closeMobileNavDrawer, MOBILE_NAV_DRAWER_ID, openDialogFallback } from "~/lib/cart-drawer";
import type { NavItem } from "~/lib/site-content";

type MobileNavProps = {
  mainMenu: NavItem[];
  collections: { handle: string; title: string }[];
};

export function MobileNav({ mainMenu, collections }: MobileNavProps) {
  const location = useLocation();
  const close = () => closeMobileNavDrawer();

  return (
    <dialog
      id={MOBILE_NAV_DRAWER_ID}
      className="drawer-left bg-surface text-on-surface"
      aria-labelledby="mobile-nav-title"
      data-testid="mobile-nav"
      closedby="any"
    >
      <div className="flex h-full flex-col">
        <div className="border-border flex shrink-0 items-center justify-between border-b px-4 py-2">
          <h2 id="mobile-nav-title" className="sr-only">
            Menu
          </h2>
          <Logo height={48} onClick={close} />
          <button
            type="button"
            commandfor={MOBILE_NAV_DRAWER_ID}
            command="close"
            className="hover:bg-peach-soft inline-flex size-11 items-center justify-center rounded-full"
            aria-label="Close menu"
            onClick={close}
          >
            <Icon name="close" size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {mainMenu.length > 0 ? (
            <nav aria-label="Main">
              <ul role="list" className="flex flex-col gap-1">
                {mainMenu.map((item) => (
                  <li key={item.id}>
                    {item.items.length > 0 ? (
                      <details className="group">
                        <summary className="marker-hidden hover:bg-peach-soft flex min-h-12 cursor-pointer items-center justify-between rounded-2xl px-3 text-lg font-semibold">
                          {item.title}
                          <Icon
                            name="chevron-down"
                            size={20}
                            className="motion-safe:transition-transform group-open:rotate-180"
                          />
                        </summary>
                        <ul role="list" className="ms-3 flex flex-col border-s border-[var(--color-gold)] ps-3">
                          <li>
                            <MenuLink to={item.to} external={item.external} onClick={close} small>
                              All {item.title}
                            </MenuLink>
                          </li>
                          {item.items.map((child) => (
                            <li key={child.id}>
                              <MenuLink to={child.to} external={child.external} onClick={close} small>
                                {child.title}
                              </MenuLink>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : (
                      <MenuLink
                        to={item.to}
                        external={item.external}
                        onClick={close}
                        current={location.pathname === item.to}
                      >
                        {item.title}
                      </MenuLink>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {collections.length > 0 ? (
            <section aria-labelledby="mobile-nav-collections" className="mt-8">
              <h3 id="mobile-nav-collections" className="type-overline text-on-surface-secondary mb-3 px-3">
                Shop by category
              </h3>
              <ul role="list" className="grid grid-cols-2 gap-2">
                {collections.map((collection) => (
                  <li key={collection.handle}>
                    <Link
                      to={`/collections/${collection.handle}`}
                      onClick={close}
                      className="bg-peach-soft/70 hover:bg-peach-soft flex min-h-12 items-center rounded-2xl px-3 text-sm font-semibold"
                    >
                      {collection.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="gold-rule my-8" />

          <ul role="list" className="flex flex-col gap-1">
            <li>
              <MenuLink to="/account" onClick={close} small icon="user">
                My account
              </MenuLink>
            </li>
            <li>
              <MenuLink to="/pages/contact" onClick={close} small icon="phone">
                Contact us
              </MenuLink>
            </li>
            <li>
              <MenuLink to="/policies" onClick={close} small icon="shield">
                Policies
              </MenuLink>
            </li>
          </ul>
        </div>
      </div>
    </dialog>
  );
}

function MenuLink({
  to,
  external = false,
  onClick,
  children,
  small = false,
  current = false,
  icon,
}: {
  to: string;
  external?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  small?: boolean;
  current?: boolean;
  icon?: "user" | "phone" | "shield";
}) {
  const className = `hover:bg-peach-soft flex items-center gap-3 rounded-2xl px-3 ${
    small ? "min-h-11 text-base font-medium" : "min-h-12 text-lg font-semibold"
  } ${current ? "bg-peach-soft text-burgundy" : ""}`;

  const content = (
    <>
      {icon ? <Icon name={icon} size={20} className="text-terracotta-deep" /> : null}
      {children}
    </>
  );

  if (external) {
    return (
      <a href={to} className={className} rel="noopener">
        {content}
      </a>
    );
  }
  return (
    <Link to={to} className={className} onClick={onClick} aria-current={current ? "page" : undefined}>
      {content}
    </Link>
  );
}

export function MobileNavTrigger() {
  return (
    <button
      type="button"
      commandfor={MOBILE_NAV_DRAWER_ID}
      command="show-modal"
      className="text-on-surface hover:bg-peach-soft inline-flex size-11 items-center justify-center rounded-full"
      aria-label="Menu"
      aria-controls={MOBILE_NAV_DRAWER_ID}
      aria-haspopup="dialog"
      data-testid="nav-trigger"
      onClick={() => openDialogFallback(MOBILE_NAV_DRAWER_ID)}
    >
      <Icon name="menu" size={24} />
    </button>
  );
}
