import { Link } from "react-router";

import { BRAND_NAME, BRAND_TAGLINE, Logo } from "~/components/Logo";
import { Icon, type IconName } from "~/components/ui/Icon";
import type { NavItem, PolicyLink, StoreProfile } from "~/lib/site-content";
import type { StorefrontShop } from "~/lib/storefront-shop";

import { PaymentMethodIcon } from "./PaymentMethodIcon";

type FooterProps = {
  shopInfo: StorefrontShop;
  collections: { handle: string; title: string }[];
  footerMenu: NavItem[];
  policies: PolicyLink[];
  storeProfile: StoreProfile | null;
};

const linkClass =
  "text-cream/85 hover:text-cream inline-flex min-h-9 items-center underline-offset-4 hover:underline";

export function Footer({ shopInfo, collections, footerMenu, policies, storeProfile }: FooterProps) {
  const year = new Date().getFullYear();
  const legalName = storeProfile?.legalName ?? BRAND_NAME;
  // Skip footer-menu links that duplicate the policy list or the built-in links.
  const policyPaths = new Set(policies.map((policy) => `/policies/${policy.handle}`));
  const extraLinks = footerMenu.filter(
    (item) => !policyPaths.has(item.to) && !["/search", "/pages/contact"].includes(item.to),
  );

  return (
    <footer className="bg-chocolate text-cream curve-top mt-20" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="max-w-page px-margin mx-auto pt-16 pb-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
          <div>
            <div className="bg-cream inline-flex rounded-3xl px-5 py-3">
              <Logo height={84} />
            </div>
            <p className="type-hand text-peach mt-5 text-2xl">{BRAND_TAGLINE}</p>
            <p className="text-cream/80 mt-3 max-w-xs text-sm leading-relaxed">
              Useful, good-looking finds for everyday Indian homes.
            </p>
          </div>

          {collections.length > 0 ? (
            <FooterColumn title="Shop">
              {collections.slice(0, 8).map((collection) => (
                <li key={collection.handle}>
                  <Link to={`/collections/${collection.handle}`} className={linkClass}>
                    {collection.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/collections" className={linkClass}>
                  All categories
                </Link>
              </li>
            </FooterColumn>
          ) : null}

          <FooterColumn title="Help">
            <li>
              <Link to="/pages/contact" className={linkClass}>
                Contact us
              </Link>
            </li>
            {policies.map((policy) => (
              <li key={policy.handle}>
                <Link to={`/policies/${policy.handle}`} className={linkClass}>
                  {policy.title}
                </Link>
              </li>
            ))}
            {extraLinks.map((item) => (
              <li key={item.id}>
                {item.external ? (
                  <a href={item.to} className={linkClass} rel="noopener">
                    {item.title}
                  </a>
                ) : (
                  <Link to={item.to} className={linkClass}>
                    {item.title}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <Link to="/account" className={linkClass}>
                My account
              </Link>
            </li>
          </FooterColumn>

          <ContactColumn profile={storeProfile} />
        </div>

        <SellerDetails profile={storeProfile} />

        <p
          aria-hidden="true"
          className="ed-display text-cream/90 mt-16 text-center text-[clamp(2.8rem,9vw,9.5rem)] leading-[0.92] select-none"
        >
          Smart finds.
          <em className="text-terracotta block">Better homes.</em>
        </p>

        <div className="mt-12 flex flex-col gap-6 border-t border-[color-mix(in_oklab,var(--color-gold)_45%,transparent)] pt-8 md:flex-row md:items-center md:justify-between">
          <div className="text-cream/75 flex flex-col gap-1 text-sm">
            <p>
              © {year} {legalName}. All rights reserved.
            </p>
            <p className="inline-flex items-center gap-2">
              <Icon name="shield" size={16} className="text-gold" />
              Secure checkout powered by Shopify
            </p>
          </div>
          {shopInfo.paymentMethods.length > 0 ? (
            <ul role="list" aria-label="Payment methods" className="flex flex-wrap items-center gap-2">
              {shopInfo.paymentMethods.map((method) => (
                <li key={method} className="bg-cream rounded-md px-1">
                  <PaymentMethodIcon method={method} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h3 className="text-gold type-overline mb-4">{title}</h3>
      <ul role="list" className="flex flex-col gap-1 text-[0.95rem]">
        {children}
      </ul>
    </nav>
  );
}

function ContactColumn({ profile }: { profile: StoreProfile | null }) {
  const rows: { icon: IconName; label: string; href?: string; text: string }[] = [];
  if (profile?.supportPhone) {
    rows.push({
      icon: "phone",
      label: "Phone",
      href: `tel:${profile.supportPhone.replace(/[^+\d]/g, "")}`,
      text: profile.supportPhone,
    });
  }
  if (profile?.whatsappNumber) {
    rows.push({
      icon: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/${profile.whatsappNumber.replace(/\D/g, "")}`,
      text: profile.whatsappNumber,
    });
  }
  if (profile?.supportEmail) {
    rows.push({
      icon: "mail",
      label: "Email",
      href: `mailto:${profile.supportEmail}`,
      text: profile.supportEmail,
    });
  }
  if (profile?.supportHours) {
    rows.push({ icon: "clock", label: "Hours", text: profile.supportHours });
  }

  return (
    <div>
      <h3 className="text-gold type-overline mb-4">Talk to us</h3>
      {rows.length > 0 ? (
        <ul role="list" className="flex flex-col gap-3 text-[0.95rem]">
          {rows.map((row) => (
            <li key={row.label} className="flex items-start gap-3">
              <span className="bg-cream/10 text-peach inline-grid size-9 shrink-0 place-items-center rounded-full">
                <Icon name={row.icon} size={18} />
              </span>
              <span className="flex flex-col">
                <span className="text-cream/65 text-xs">{row.label}</span>
                {row.href ? (
                  <a
                    href={row.href}
                    className="hover:text-cream text-cream/90 break-all underline-offset-4 hover:underline"
                    rel={row.href.startsWith("http") ? "noopener" : undefined}
                  >
                    {row.text}
                  </a>
                ) : (
                  <span className="text-cream/90">{row.text}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-cream/80 text-[0.95rem]">
          Questions about an order?{" "}
          <Link to="/pages/contact" className="text-cream underline underline-offset-4">
            Get in touch
          </Link>
          .
        </p>
      )}
      {profile?.socialLinks.length ? (
        <ul role="list" className="mt-5 flex flex-wrap gap-2">
          {profile.socialLinks.map((social) => (
            <li key={social.url}>
              <a
                href={social.url}
                rel="noopener"
                className="border-cream/25 hover:bg-cream/10 inline-flex min-h-9 items-center rounded-full border px-3 text-sm"
              >
                {social.text || new URL(social.url).hostname.replace("www.", "")}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Seller and grievance details (Consumer Protection (E-Commerce) Rules, 2020). */
function SellerDetails({ profile }: { profile: StoreProfile | null }) {
  if (!profile) return null;
  const hasSeller = profile.legalName || profile.registeredAddress || profile.gstin;
  const officer = profile.grievanceOfficer;
  if (!hasSeller && !officer) return null;

  return (
    <div className="bg-cream/5 mt-12 grid gap-8 rounded-3xl p-6 text-sm md:grid-cols-2 md:p-8">
      {hasSeller ? (
        <div>
          <h3 className="text-gold type-overline mb-3">Seller details</h3>
          <dl className="text-cream/85 grid gap-1.5">
            {profile.legalName ? (
              <div>
                <dt className="sr-only">Legal name</dt>
                <dd className="text-cream font-semibold">{profile.legalName}</dd>
              </div>
            ) : null}
            {profile.tradeName && profile.tradeName !== profile.legalName ? (
              <div>
                <dt className="sr-only">Trading as</dt>
                <dd>Trading as {profile.tradeName}</dd>
              </div>
            ) : null}
            {profile.registeredAddress ? (
              <div>
                <dt className="sr-only">Registered address</dt>
                <dd className="whitespace-pre-line">{profile.registeredAddress}</dd>
              </div>
            ) : null}
            {profile.gstin ? (
              <div className="flex gap-1">
                <dt>GSTIN:</dt>
                <dd>{profile.gstin}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}
      {officer ? (
        <div>
          <h3 className="text-gold type-overline mb-3">Grievance officer</h3>
          <dl className="text-cream/85 grid gap-1.5">
            <div>
              <dt className="sr-only">Name</dt>
              <dd className="text-cream font-semibold">
                {officer.name}
                {officer.designation ? `, ${officer.designation}` : ""}
              </dd>
            </div>
            {officer.email ? (
              <div className="flex gap-1">
                <dt>Email:</dt>
                <dd>
                  <a href={`mailto:${officer.email}`} className="underline underline-offset-4">
                    {officer.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {officer.phone ? (
              <div className="flex gap-1">
                <dt>Phone:</dt>
                <dd>
                  <a
                    href={`tel:${officer.phone.replace(/[^+\d]/g, "")}`}
                    className="underline underline-offset-4"
                  >
                    {officer.phone}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}
    </div>
  );
}
