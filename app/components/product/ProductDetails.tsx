import { Link } from "react-router";

import { BeforeAfterSlider } from "~/components/ui/BeforeAfterSlider";
import { Icon, type IconName } from "~/components/ui/Icon";
import { shopifyImageUrl } from "~/lib/image";
import type { MoneyValue } from "~/lib/metaobject";
import { formatPrice } from "~/lib/money";
import type { ProductContent } from "~/lib/product-page";
import type { PolicyLink, StoreProfile } from "~/lib/site-content";

function Section({
  id,
  title,
  icon,
  open = false,
  children,
}: {
  id: string;
  title: string;
  icon: IconName;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      className="group border-b border-[color-mix(in_oklab,var(--color-gold)_45%,transparent)]"
      open={open}
      id={id}
    >
      <summary className="marker-hidden hover:text-burgundy flex min-h-16 cursor-pointer items-center gap-3 py-3 text-lg font-bold">
        <span className="icon-chip [--chip-size:2.25rem]">
          <Icon name={icon} size={18} />
        </span>
        <span className="flex-1">{title}</span>
        <Icon
          name="chevron-down"
          size={22}
          className="text-chocolate-muted motion-safe:transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="pb-6 ps-12">{children}</div>
    </details>
  );
}

/**
 * Description, specs, how to use, box contents, care, shipping/returns, FAQs.
 * Each section renders only when its Shopify field has content.
 */
export function ProductDetails({
  descriptionHtml,
  content,
  policies,
}: {
  descriptionHtml: string;
  content: ProductContent;
  policies: PolicyLink[];
}) {
  const hasDescription = descriptionHtml.replace(/<[^>]*>/g, "").trim().length > 0;
  const shippingPolicies = policies.filter((policy) => /shipping|refund|return/.test(policy.handle));

  return (
    <div className="border-t border-[color-mix(in_oklab,var(--color-gold)_45%,transparent)]">
      {hasDescription ? (
        <Section id="description" title="Description" icon="sparkle" open>
          <div className="prose-ghar max-w-prose" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        </Section>
      ) : null}

      {content.specifications.length > 0 ? (
        <Section id="specifications" title="Specifications" icon="grid">
          <table className="w-full max-w-xl overflow-hidden rounded-2xl bg-white text-[0.95rem] shadow-[var(--shadow-sm)]">
            <tbody>
              {content.specifications.map((row) => (
                <tr key={row.label} className="even:bg-cream/60">
                  <th scope="row" className="text-on-surface-secondary w-2/5 px-4 py-3 text-start font-medium">
                    {row.label}
                  </th>
                  <td className="text-on-surface px-4 py-3 font-semibold">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      ) : null}

      {content.howToUse.length > 0 ? (
        <Section id="how-to-use" title="How to use" icon="check">
          <ol className="grid max-w-xl gap-5">
            {content.howToUse.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="bg-burgundy inline-grid size-9 shrink-0 place-items-center rounded-full font-bold text-white">
                  {index + 1}
                </span>
                <div className="pt-1">
                  <p className="text-on-surface font-bold">{step.title}</p>
                  {step.body ? <p className="text-on-surface-secondary mt-1">{step.body}</p> : null}
                  {step.image ? (
                    <img
                      src={shopifyImageUrl(step.image.url, { width: 640 })}
                      alt={step.image.altText || ""}
                      className="mt-3 aspect-[4/3] w-full max-w-sm rounded-2xl object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {content.inTheBox.length > 0 ? (
        <Section id="in-the-box" title="What’s in the box" icon="box">
          <ul role="list" className="grid gap-2">
            {content.inTheBox.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <Icon name="check" size={18} strokeWidth={2.25} className="text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {content.care ? (
        <Section id="care" title="Care" icon="sparkle">
          <p className="text-on-surface/90 max-w-prose whitespace-pre-line">{content.care}</p>
        </Section>
      ) : null}

      {content.shippingReturns || shippingPolicies.length > 0 ? (
        <Section id="shipping-returns" title="Shipping & returns" icon="truck">
          {content.shippingReturns ? (
            <p className="text-on-surface/90 max-w-prose whitespace-pre-line">{content.shippingReturns}</p>
          ) : null}
          {shippingPolicies.length > 0 ? (
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {shippingPolicies.map((policy) => (
                <Link
                  key={policy.handle}
                  to={`/policies/${policy.handle}`}
                  className="text-burgundy font-semibold underline underline-offset-4"
                >
                  Read the {policy.title.toLowerCase()}
                </Link>
              ))}
            </p>
          ) : null}
        </Section>
      ) : null}

      {content.faqs.length > 0 ? (
        <Section id="faqs" title="FAQs" icon="sparkle">
          <dl className="grid max-w-prose gap-5">
            {content.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="text-on-surface font-bold">{faq.question}</dt>
                <dd className="text-on-surface-secondary mt-1 whitespace-pre-line">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}
    </div>
  );
}

export function ProductBeforeAfter({ content }: { content: ProductContent }) {
  if (!content.beforeAfter) return null;
  return (
    <section aria-labelledby="before-after-title" className="max-w-page px-margin mx-auto py-12">
      <h2 id="before-after-title" className="type-heading-xl text-on-surface mb-6 text-center">
        See the difference
      </h2>
      <BeforeAfterSlider
        before={content.beforeAfter.before}
        after={content.beforeAfter.after}
        caption={content.beforeAfter.caption}
        className="mx-auto max-w-3xl"
      />
    </section>
  );
}

/** Legal Metrology / e-commerce declarations — only fields that are actually set. */
export function LegalDeclarations({
  legal,
  mrp,
  netQuantity,
  profile,
}: {
  legal: ProductContent["legal"];
  mrp: MoneyValue | null;
  netQuantity: string | null;
  profile: StoreProfile | null;
}) {
  const rows: { label: string; value: string }[] = [];
  if (legal.genericName) rows.push({ label: "Generic name", value: legal.genericName });
  if (legal.countryOfOrigin) rows.push({ label: "Country of origin", value: legal.countryOfOrigin });
  if (netQuantity) rows.push({ label: "Net quantity", value: netQuantity });
  if (legal.dimensions) rows.push({ label: "Dimensions", value: legal.dimensions });
  if (mrp) rows.push({ label: "MRP", value: `${formatPrice(mrp)} (inclusive of all taxes)` });
  for (const entity of legal.entities) {
    rows.push({ label: entity.role, value: `${entity.name}\n${entity.address}` });
  }
  const care =
    legal.consumerCare ??
    [profile?.supportEmail, profile?.supportPhone].filter(Boolean).join(" · ") ??
    "";
  if (care) rows.push({ label: "Consumer care", value: care });

  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="legal-title" className="mt-8">
      <h2 id="legal-title" className="type-overline text-on-surface-secondary mb-3">
        Product declarations
      </h2>
      <dl className="grid gap-x-6 gap-y-3 rounded-[var(--radius-lg)] bg-white/70 p-5 text-sm shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-gold)_40%,transparent)] sm:grid-cols-[auto_1fr]">
        {rows.map((row) => (
          <div key={`${row.label}-${row.value}`} className="contents">
            <dt className="text-on-surface-secondary font-medium">{row.label}</dt>
            <dd className="text-on-surface whitespace-pre-line max-sm:-mt-2">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** "Need help?" with the real contact options from the store profile. */
export function NeedHelp({ profile, productTitle }: { profile: StoreProfile | null; productTitle: string }) {
  const options: { icon: IconName; label: string; href: string; external?: boolean }[] = [];
  if (profile?.whatsappNumber) {
    options.push({
      icon: "whatsapp",
      label: "WhatsApp us",
      href: `https://wa.me/${profile.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hi! I have a question about: ${productTitle}`,
      )}`,
      external: true,
    });
  }
  if (profile?.supportPhone) {
    options.push({ icon: "phone", label: "Call us", href: `tel:${profile.supportPhone.replace(/[^+\d]/g, "")}` });
  }
  if (profile?.supportEmail) {
    options.push({
      icon: "mail",
      label: "Email us",
      href: `mailto:${profile.supportEmail}?subject=${encodeURIComponent(`Question: ${productTitle}`)}`,
    });
  }

  return (
    <aside
      aria-labelledby="need-help-title"
      className="bg-peach-soft/70 mt-8 flex flex-col gap-4 rounded-[var(--radius-lg)] p-5 sm:flex-row sm:items-center"
    >
      <div className="flex-1">
        <h2 id="need-help-title" className="text-on-surface font-bold">
          Need help choosing?
        </h2>
        <p className="text-on-surface-secondary text-sm">
          {profile?.supportHours ? `We reply ${profile.supportHours}.` : "Ask us anything about this product."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.length > 0 ? (
          options.map((option) => (
            <a
              key={option.label}
              href={option.href}
              rel={option.external ? "noopener" : undefined}
              className="text-chocolate inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)]"
            >
              <Icon name={option.icon} size={18} className="text-terracotta-deep" />
              {option.label}
            </a>
          ))
        ) : (
          <Link
            to="/pages/contact"
            className="text-chocolate inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold shadow-[var(--shadow-sm)]"
          >
            <Icon name="mail" size={18} className="text-terracotta-deep" />
            Contact us
          </Link>
        )}
      </div>
    </aside>
  );
}
