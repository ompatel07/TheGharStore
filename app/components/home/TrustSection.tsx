import { Link } from "react-router";

import { Icon, type IconName } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";
import { formatPrice } from "~/lib/money";
import type {
  PolicyLink,
  StoreProfile,
  StorePromises,
} from "~/lib/site-content";

export type TrustItem = { icon: IconName; title: string; text: string; to?: string };

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

  if (
    profile?.supportPhone ||
    profile?.whatsappNumber ||
    profile?.supportEmail
  ) {
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
    <section aria-labelledby="trust-title" className="bg-burgundy-deep text-cream relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_100%_0%,rgb(239_119_86/0.25),transparent_70%)]"
      />
      <div className="max-w-page px-margin relative mx-auto py-20 md:py-24">
        <Reveal className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">
          <div>
            <p className="eyebrow text-peach">Bharosa matters</p>
            <h2 id="trust-title" className="ed-display ed-lg mt-4">
              Shop with <em className="text-peach">confidence</em>
            </h2>
          </div>
          {policies.length > 0 ? (
            <p className="text-cream/75 max-w-xl text-lg lg:justify-self-end">
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
        </Reveal>

        <ul
          role="list"
          className={`mt-14 grid border-t border-white/15 sm:grid-cols-2 ${items.length >= 5 ? "lg:grid-cols-5" : items.length === 4 ? "lg:grid-cols-4" : items.length === 3 ? "lg:grid-cols-3" : ""}`}
        >
          {items.map((item, index) => (
            <Reveal
              as="li"
              key={item.title}
              delay={index * 90}
              className="border-b border-white/15 py-8 sm:pe-8 lg:border-b-0 lg:border-s lg:px-8 lg:first:border-s-0 lg:first:ps-0"
            >
              <span className="bg-cream/10 text-peach grid size-14 place-items-center rounded-full">
                <Icon name={item.icon} size={28} />
              </span>
              <h3 className="ed-display mt-6 text-2xl">{item.title}</h3>
              <p className="text-cream/70 mt-2 text-[0.95rem] leading-relaxed">{item.text}</p>
              {item.to ? (
                <Link
                  to={item.to}
                  className="text-cream mt-3 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold"
                >
                  <span className="link-sweep">Details</span>
                  <span className="sr-only"> about {item.title.toLowerCase()}</span>
                  <Icon name="arrow-right" size={16} />
                </Link>
              ) : null}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
