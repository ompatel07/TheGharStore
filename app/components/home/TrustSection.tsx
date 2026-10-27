import type { CSSProperties } from "react";
import { Link } from "react-router";

import { Icon } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";
import type { TrustBadge } from "~/lib/promises";
import type { PolicyLink, StoreProfile } from "~/lib/site-content";

/**
 * Closing "shop with confidence" band: every store promise from Shopify, the
 * published policies, and real contact details. Nothing here is a fixed claim.
 */
export function TrustSection({
  badges,
  policies,
  profile,
}: {
  badges: TrustBadge[];
  policies: PolicyLink[];
  profile: StoreProfile | null;
}) {
  if (badges.length === 0) return null;
  const phoneHref = profile?.supportPhone ? `tel:${profile.supportPhone.replace(/[^\d+]/g, "")}` : null;

  return (
    <section aria-labelledby="trust-title" className="bg-burgundy-deep text-cream curve-top relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_100%_0%,rgb(239_119_86/0.25),transparent_70%)]"
      />
      <div className="max-w-page px-margin relative mx-auto py-20 md:py-24">
        <Reveal className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="type-hand text-peach text-2xl">bharosa matters</p>
            <h2 id="trust-title" className="ed-display ed-lg mt-1">
              Shop with <span className="text-peach">confidence</span>
            </h2>
          </div>
          {profile?.supportPhone || profile?.supportEmail ? (
            <div className="flex flex-wrap gap-3 lg:justify-end">
              {phoneHref ? (
                <a href={phoneHref} className="btn btn-light">
                  <Icon name="phone" size={18} />
                  {profile?.supportPhone}
                </a>
              ) : null}
              {profile?.supportEmail ? (
                <a href={`mailto:${profile.supportEmail}`} className="btn btn-ghost-light">
                  <Icon name="mail" size={18} />
                  Email us
                </a>
              ) : null}
            </div>
          ) : null}
        </Reveal>

        <ul
          role="list"
          className={`mt-14 grid border-t border-white/15 sm:grid-cols-2 ${badges.length >= 5 ? "lg:grid-cols-5" : badges.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
        >
          {badges.map((badge, index) => (
            <Reveal
              as="li"
              key={badge.id}
              delay={index * 90}
              className="border-b border-white/15 py-8 sm:pe-8 lg:border-b-0 lg:border-s lg:px-7 lg:first:border-s-0 lg:first:ps-0"
            >
              <span
                className="trust-icon bg-cream/10 text-peach grid size-14 place-items-center rounded-full"
                style={{ "--i": index } as CSSProperties}
              >
                <Icon name={badge.icon} size={28} />
              </span>
              <h3 className="font-heading mt-6 text-xl font-extrabold">{badge.title}</h3>
              <p className="text-cream/70 mt-2 text-[0.95rem] leading-relaxed">{badge.text}</p>
              {badge.to ? (
                <Link to={badge.to} className="text-cream mt-3 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold">
                  <span className="link-sweep">Details</span>
                  <span className="sr-only"> about {badge.title.toLowerCase()}</span>
                  <Icon name="arrow-right" size={16} />
                </Link>
              ) : null}
            </Reveal>
          ))}
        </ul>

        {policies.length > 0 ? (
          <p className="text-cream/60 mt-10 text-sm">
            Read our{" "}
            {policies.map((policy, index) => (
              <span key={policy.handle}>
                {index > 0 ? (index === policies.length - 1 ? " and " : ", ") : null}
                <Link to={`/policies/${policy.handle}`} className="text-cream link-sweep font-semibold">
                  {policy.title.toLowerCase()}
                </Link>
              </span>
            ))}
            .
          </p>
        ) : null}
      </div>
    </section>
  );
}
