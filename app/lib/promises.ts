// One source for every trust signal on the site (announcement, hero strip,
// product page, cart, FAQ). Everything is derived from the `store_promises` and
// `store_profile` metaobjects plus published policies — an empty field means
// the badge or answer simply doesn't render.
import type { IconName } from "~/components/ui/Icon";
import { formatPrice } from "~/lib/money";
import type { PolicyLink, StoreProfile, StorePromises } from "~/lib/site-content";

export type TrustBadge = {
  id: "shipping" | "cod" | "returns" | "secure" | "support";
  icon: IconName;
  title: string;
  text: string;
  to?: string;
};

function policyPath(policies: PolicyLink[], match: RegExp) {
  const policy = policies.find((p) => match.test(p.handle));
  return policy ? `/policies/${policy.handle}` : undefined;
}

export function deliveryRangeText(promises: StorePromises) {
  const { deliveryMinDays: min, deliveryMaxDays: max } = promises;
  if (!min && !max) return null;
  if (min && max && max !== min) return `${min}–${max} working days`;
  return `${min ?? max} working days`;
}

export function trustBadges(
  promises: StorePromises,
  policies: PolicyLink[],
  profile: StoreProfile | null,
): TrustBadge[] {
  const badges: TrustBadge[] = [];
  const shipping = policyPath(policies, /shipping/);
  const refund = policyPath(policies, /refund|return/);
  const range = deliveryRangeText(promises);

  if (promises.freeShippingAll) {
    badges.push({
      id: "shipping",
      icon: "truck",
      title: "Free delivery",
      text: range ? `Across India, in ${range}.` : "On every order across India.",
      to: shipping,
    });
  } else if (promises.freeShippingThreshold) {
    badges.push({
      id: "shipping",
      icon: "truck",
      title: "Free delivery",
      text: `On orders above ${formatPrice(promises.freeShippingThreshold)}.`,
      to: shipping,
    });
  } else if (promises.dispatchNote) {
    badges.push({ id: "shipping", icon: "truck", title: "Delivery", text: promises.dispatchNote, to: shipping });
  }

  if (promises.codAvailable) {
    badges.push({
      id: "cod",
      icon: "cod",
      title: "Cash on Delivery",
      text: promises.codNote ?? "Pay when your order arrives.",
    });
  }

  if (promises.returnsWindowDays) {
    badges.push({
      id: "returns",
      icon: "refund",
      title: promises.returnsTitle ?? `${promises.returnsWindowDays}-day returns`,
      text: promises.returnsNote ?? "See the policy for what qualifies.",
      to: refund,
    });
  }

  badges.push({
    id: "secure",
    icon: "shield",
    title: "Secure checkout",
    text: "Payments are encrypted and processed by Shopify.",
  });

  if (profile?.supportPhone || profile?.whatsappNumber || profile?.supportEmail) {
    badges.push({
      id: "support",
      icon: profile.whatsappNumber ? "whatsapp" : "phone",
      title: "Real people, real help",
      text: profile.supportHours ? `Reach us ${profile.supportHours}.` : "Questions before or after you buy? Talk to us.",
      to: "/pages/contact",
    });
  }

  return badges;
}

/** Adds `days` working days (Mon–Sat; Sundays skipped). */
function addWorkingDays(from: Date, days: number) {
  const date = new Date(from);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0) added += 1;
  }
  return date;
}

const DAY_FORMAT = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });

/** "Thu, 30 Oct – Mon, 3 Nov" from the store's own delivery window. Client-only (uses the visitor's clock). */
export function deliveryEstimate(promises: StorePromises, now = new Date()) {
  const { deliveryMinDays: min, deliveryMaxDays: max } = promises;
  if (!min || !max) return null;
  return `${DAY_FORMAT.format(addWorkingDays(now, min))} – ${DAY_FORMAT.format(addWorkingDays(now, max))}`;
}

export type FaqItem = { question: string; answer: string; to?: string };

/** Store FAQ built only from what's configured in Shopify. */
export function storeFaqs(
  promises: StorePromises,
  policies: PolicyLink[],
  profile: StoreProfile | null,
): FaqItem[] {
  const faqs: FaqItem[] = [];
  const range = deliveryRangeText(promises);
  const shipping = policyPath(policies, /shipping/);
  const refund = policyPath(policies, /refund|return/);

  if (promises.freeShippingAll || promises.freeShippingThreshold || range) {
    const cost = promises.freeShippingAll
      ? "Delivery is free on every order across India."
      : promises.freeShippingThreshold
        ? `Delivery is free on orders above ${formatPrice(promises.freeShippingThreshold)}.`
        : "";
    faqs.push({
      question: "How long does delivery take, and what does it cost?",
      answer: [cost, promises.dispatchNote ?? (range ? `Orders usually arrive in ${range}.` : "")]
        .filter(Boolean)
        .join(" "),
      to: shipping,
    });
  }
  if (promises.codAvailable) {
    faqs.push({
      question: "Can I pay with Cash on Delivery?",
      answer: `Yes. Choose Cash on Delivery at checkout. ${promises.codNote ?? ""} Or pay online with any method shown at checkout.`.trim(),
    });
  }
  if (promises.returnsWindowDays) {
    faqs.push({
      question: "What if my order arrives damaged?",
      answer: promises.returnsNote ?? `You can request a return within ${promises.returnsWindowDays} days.`,
      to: refund,
    });
  }
  faqs.push({
    question: "Is it safe to pay on this site?",
    answer:
      "Yes. Checkout runs on Shopify's secure, encrypted payment system. We never see or store your card details.",
  });
  faqs.push({
    question: "How do I track my order?",
    answer:
      "You'll get tracking details by email or SMS once your order ships. You can also sign in to your account to see every order and its status.",
    to: "/account",
  });
  if (profile?.supportEmail || profile?.supportPhone) {
    const ways = [profile.supportPhone && `call ${profile.supportPhone}`, profile.supportEmail && `email ${profile.supportEmail}`]
      .filter(Boolean)
      .join(" or ");
    faqs.push({
      question: "How can I reach you?",
      answer: `Just ${ways}${profile.supportHours ? ` (${profile.supportHours})` : ""}. You can also write to us from the contact page.`,
      to: "/pages/contact",
    });
  }
  return faqs;
}
