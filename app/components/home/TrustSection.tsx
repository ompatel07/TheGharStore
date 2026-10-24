import { Link } from "react-router";

import { Icon, type IconName } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";
import { formatPrice } from "~/lib/money";
import type { PolicyLink, StoreProfile, StorePromises } from "~/lib/site-content";

type TrustItem = { icon: IconName; title: string; text: string; to?: string };

/**
 * Built only from real store content: Shopify's secure checkout (always true) plus
 * whatever promises, policies and contact details are set in Shopify. Nothing here
 * is a fixed marketing claim; an unset promise simply doesn't appear.
 */
export function buildTrustItems(
  promises: StorePromises,
  policies: PolicyLink[],
  profile: StoreProfile | null,
): TrustItem[] {
  const policy = (match: RegExp) => policies.find((p) => match.test(p.handle));
  const items: TrustItem[] = [
    {
      icon: "shield",
      title: "Secure checkout",
      text: "Payments are processed by Shopify’s encrypted checkout.",
    },
  ];

  if (promises.freeShippingThreshold) {
    const shipping = policy(/shipping/);
    items.push({
      icon: "truck",
      title: "Free shipping",
      text: `On orders above ${formatPrice(promises.freeShippingThreshold)}.`,
      to: shipping ? `/policies/${shipping.handle}` : undefined,
    });
  } else if (promises.dispatchNote) {
    const shipping = policy(/shipping/);
    items.push({
      icon: "truck",
      title: "Dispatch",
      text: promises.dispatchNote,
      to: shipping ? `/policies/${shipping.handle}` : undefined,
    });
  }

  if (promises.codAvailable) {
    items.push({
      icon: "cod",
      title: "Cash on delivery",
      text: promises.codNote ?? "Pay in cash when your order arrives.",
    });
  }

  if (promises.returnsWindowDays) {
    const refund = policy(/refund|return/);
    items.push({
      icon: "refund",
      title: `${promises.returnsWindowDays}-day returns`,
      text: promises.returnsNote ?? "See the policy for what qualifies.",
      to: refund ? `/policies/${refund.handle}` : undefined,
    });
  }

  if (profile?.supportPhone || profile?.whatsappNumber || profile?.supportEmail) {
    items.push({
      icon: profile.whatsappNumber ? "whatsapp" : "phone",
      title: "Real people, real help",
      text: profile.supportHours
        ? `Reach us ${profile.supportHours}.`
        : "Questions before or after you buy? Talk to us.",
      to: "/pages/contact",
    });
  }

  return items;
}

export function TrustSection({
  promises,
  policies,
  profile,
}: {
  promises: StorePromises;
  policies: PolicyLink[];
  profile: StoreProfile | null;
}) {
  const items = buildTrustItems(promises, policies, profile);

  return (
    <Reveal as="section" aria-labelledby="trust-title" className="py-12 md:py-16">
      <div className="max-w-page px-margin mx-auto">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-white px-6 py-10 shadow-[var(--shadow)] md:px-12 md:py-14">
          <div className="gold-rule absolute inset-x-10 top-0" aria-hidden="true" />
          <div className="grid gap-10 lg:grid-cols-[0.9fr_2fr] lg:items-center">
            <div>
              <p className="type-hand text-terracotta-deep text-2xl">bharosa matters</p>
              <h2 id="trust-title" className="type-heading-xl text-on-surface mt-1">
                Shop with confidence
              </h2>
              {policies.length > 0 ? (
                <p className="text-on-surface-secondary mt-3">
                  Read our{" "}
                  {policies.map((policy, index) => (
                    <span key={policy.handle}>
                      {index > 0 ? (index === policies.length - 1 ? " and " : ", ") : null}
                      <Link
                        to={`/policies/${policy.handle}`}
                        className="text-burgundy font-semibold underline underline-offset-4"
                      >
                        {policy.title.toLowerCase()}
                      </Link>
                    </span>
                  ))}
                  .
                </p>
              ) : null}
            </div>
            <ul
              role="list"
              className={`grid gap-6 sm:grid-cols-2 ${items.length >= 3 ? "xl:grid-cols-3" : ""}`}
            >
              {items.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="icon-chip [--chip-size:3.25rem]">
                    <Icon name={item.icon} size={26} />
                  </span>
                  <div>
                    <h3 className="text-on-surface font-bold">{item.title}</h3>
                    <p className="text-on-surface-secondary mt-0.5 text-[0.95rem]">{item.text}</p>
                    {item.to ? (
                      <Link
                        to={item.to}
                        className="text-burgundy mt-1 inline-flex min-h-9 items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
                      >
                        Details
                        <span className="sr-only"> about {item.title.toLowerCase()}</span>
                        <Icon name="arrow-right" size={16} />
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
