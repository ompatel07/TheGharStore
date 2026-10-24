import { Link } from "react-router";

import {
  LegalDeclarations,
  NeedHelp,
} from "~/components/product/ProductDetails";
import { BeforeAfterSlider } from "~/components/ui/BeforeAfterSlider";
import { Icon } from "~/components/ui/Icon";
import { Spark } from "~/components/ui/Ornaments";
import { Reveal } from "~/components/ui/Reveal";
import { shopifyImageUrl } from "~/lib/image";
import type { MoneyValue } from "~/lib/metaobject";
import type { ProductContent } from "~/lib/product-page";
import type { PolicyLink, StoreProfile } from "~/lib/site-content";

function splitParagraphs(html: string) {
  return html
    .split(/<\/p>/i)
    .map((chunk) => chunk.replace(/<p[^>]*>/i, "").trim())
    .filter((chunk) => chunk.replace(/<[^>]*>/g, "").trim().length > 0);
}

/** In-page chapter links under the buy box. Only lists sections that exist. */
export function StoryNav({
  content,
  hasDescription,
}: {
  content: ProductContent;
  hasDescription: boolean;
}) {
  const links = [
    hasDescription && { href: "#story", label: "The story" },
    content.howToUse.length > 0 && { href: "#how-to-use", label: "How to use" },
    (content.specifications.length > 0 ||
      content.inTheBox.length > 0 ||
      content.care) && {
      href: "#details",
      label: "Details",
    },
    content.faqs.length > 0 && { href: "#faqs", label: "FAQs" },
  ].filter(Boolean) as { href: string; label: string }[];
  if (links.length === 0) return null;
  return (
    <nav aria-label="On this page" className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="border-border hover:border-burgundy hover:text-burgundy inline-flex min-h-10 items-center rounded-full border bg-white/60 px-4 text-sm font-semibold motion-safe:transition-colors"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export function ProductStory({
  title,
  descriptionHtml,
  content,
  policies,
  profile,
  mrp,
  netQuantity,
  collection,
}: {
  title: string;
  descriptionHtml: string;
  content: ProductContent;
  policies: PolicyLink[];
  profile: StoreProfile | null;
  mrp: MoneyValue | null;
  netQuantity: string | null;
  collection: { handle: string; title: string } | null;
}) {
  const paragraphs = splitParagraphs(descriptionHtml);
  const [lede, ...rest] = paragraphs;
  const shippingPolicies = policies.filter((policy) =>
    /shipping|refund|return/.test(policy.handle),
  );

  return (
    <div className="mt-20 md:mt-28">
      {/* ── The story ─────────────────────────────────────── */}
      {lede ? (
        <section
          id="story"
          aria-labelledby="story-title"
          className="max-w-page px-margin relative mx-auto scroll-mt-24"
        >
          <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
            <Reveal>
              <p className="type-hand text-terracotta-deep text-2xl md:text-3xl">
                about this find
              </p>
              <h2 id="story-title" className="display-lg text-on-surface mt-1">
                The <em className="text-terracotta-deep">story</em>
              </h2>
              {content.highlights.length > 0 ? (
                <ul role="list" className="mt-8 grid gap-3">
                  {content.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-center gap-3 text-lg font-semibold"
                    >
                      <Spark className="text-terracotta size-4 shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Reveal>
            <Reveal delay={120}>
              <p
                className="font-heading text-on-surface text-[clamp(1.4rem,1rem+1.4vw,2.2rem)] leading-snug font-bold tracking-tight"
                dangerouslySetInnerHTML={{ __html: lede }}
              />
              {rest.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-on-surface/85 mt-6 text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              ))}
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ── How to use ────────────────────────────────────── */}
      {content.howToUse.length > 0 ? (
        <section
          id="how-to-use"
          aria-labelledby="how-title"
          className="bg-night text-cream relative mt-24 scroll-mt-24 overflow-hidden py-20 md:mt-32 md:py-28"
        >
          <div className="max-w-page px-margin relative mx-auto">
            <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="type-hand text-peach text-2xl md:text-3xl">
                  step by step
                </p>
                <h2 id="how-title" className="display-lg mt-1">
                  How to <em className="text-peach">use it</em>
                </h2>
              </div>
              <p className="text-cream/70 max-w-sm">
                {content.howToUse.length} simple{" "}
                {content.howToUse.length === 1 ? "step" : "steps"}.
              </p>
            </Reveal>
            <ol className="scrollbar-none -mx-[var(--spacing-margin)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--spacing-margin)] pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
              {content.howToUse.map((step, index) => (
                <Reveal
                  as="li"
                  key={step.title}
                  delay={index * 90}
                  className="bg-cream/[0.06] relative flex w-[78vw] shrink-0 snap-start flex-col rounded-[var(--radius-xl)] p-6 ring-1 ring-[color-mix(in_oklab,var(--color-gold)_35%,transparent)] md:w-auto md:p-7"
                >
                  <span
                    aria-hidden="true"
                    className="ed-display ed-italic text-peach text-7xl leading-none"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-heading mt-6 text-2xl font-extrabold tracking-tight">
                    {step.title}
                  </h3>
                  {step.body ? (
                    <p className="text-cream/75 mt-2 leading-relaxed">
                      {step.body}
                    </p>
                  ) : null}
                  {step.image ? (
                    <img
                      src={shopifyImageUrl(step.image.url, { width: 600 })}
                      alt={step.image.altText || ""}
                      className="mt-5 aspect-[4/3] w-full rounded-2xl object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* ── Details bento: specs · in the box · care ───────── */}
      {content.specifications.length > 0 ||
      content.inTheBox.length > 0 ||
      content.care ? (
        <section
          id="details"
          aria-labelledby="details-title"
          className="max-w-page px-margin mx-auto mt-24 scroll-mt-24 md:mt-32"
        >
          <Reveal className="mb-10">
            <p className="type-hand text-terracotta-deep text-2xl md:text-3xl">
              the fine print, made friendly
            </p>
            <h2 id="details-title" className="display-lg text-on-surface mt-1">
              Good to <em className="text-terracotta-deep">know</em>
            </h2>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {content.specifications.length > 0 ? (
              <Reveal
                className={`surface-card p-6 md:p-8 ${content.specifications.length > 4 ? "lg:row-span-2" : ""}`}
              >
                <h3 className="font-heading flex items-center gap-3 text-xl font-extrabold">
                  <span className="icon-chip [--chip-size:2.5rem]">
                    <Icon name="grid" size={20} />
                  </span>
                  Specifications
                </h3>
                <dl className="mt-5 divide-y divide-[color-mix(in_oklab,var(--color-gold)_35%,transparent)]">
                  {content.specifications.map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between gap-4 py-3"
                    >
                      <dt className="text-on-surface-secondary">{row.label}</dt>
                      <dd className="text-on-surface text-end font-semibold">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ) : null}
            {content.inTheBox.length > 0 ? (
              <Reveal
                delay={80}
                className="bg-peach-soft rounded-[var(--radius-card)] p-6 md:p-8"
              >
                <h3 className="font-heading flex items-center gap-3 text-xl font-extrabold">
                  <span className="icon-chip bg-white [--chip-size:2.5rem]">
                    <Icon name="box" size={20} />
                  </span>
                  What’s in the box
                </h3>
                <ul role="list" className="mt-5 grid gap-2.5">
                  {content.inTheBox.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Icon
                        name="check"
                        size={18}
                        strokeWidth={2.5}
                        className="text-success mt-0.5 shrink-0"
                      />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}
            {content.care ? (
              <Reveal
                delay={160}
                className="bg-cream-deep rounded-[var(--radius-card)] p-6 md:p-8"
              >
                <h3 className="font-heading flex items-center gap-3 text-xl font-extrabold">
                  <span className="icon-chip bg-white [--chip-size:2.5rem]">
                    <Icon name="sparkle" size={20} />
                  </span>
                  Care &amp; safety
                </h3>
                <p className="text-on-surface/85 mt-4 leading-relaxed whitespace-pre-line">
                  {content.care}
                </p>
              </Reveal>
            ) : null}
            {content.shippingReturns || shippingPolicies.length > 0 ? (
              <Reveal
                delay={240}
                className="surface-card p-6 md:p-8 md:col-span-2"
              >
                <h3 className="font-heading flex items-center gap-3 text-xl font-extrabold">
                  <span className="icon-chip [--chip-size:2.5rem]">
                    <Icon name="truck" size={20} />
                  </span>
                  Shipping &amp; returns
                </h3>
                {content.shippingReturns ? (
                  <p className="text-on-surface/85 mt-4 whitespace-pre-line">
                    {content.shippingReturns}
                  </p>
                ) : null}
                <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                  {shippingPolicies.map((policy) => (
                    <Link
                      key={policy.handle}
                      to={`/policies/${policy.handle}`}
                      className="text-burgundy font-semibold underline underline-offset-4"
                    >
                      {policy.title}
                    </Link>
                  ))}
                </p>
              </Reveal>
            ) : null}
          </div>
        </section>
      ) : null}

      {content.beforeAfter ? (
        <section
          aria-labelledby="before-after-title"
          className="max-w-page px-margin mx-auto mt-24"
        >
          <h2
            id="before-after-title"
            className="display-lg text-on-surface mb-8 text-center"
          >
            See the <span className="text-terracotta-deep">difference</span>
          </h2>
          <BeforeAfterSlider
            before={content.beforeAfter.before}
            after={content.beforeAfter.after}
            caption={content.beforeAfter.caption}
            className="mx-auto max-w-3xl"
          />
        </section>
      ) : null}

      {/* ── FAQs ──────────────────────────────────────────── */}
      {content.faqs.length > 0 ? (
        <section
          id="faqs"
          aria-labelledby="faqs-title"
          className="max-w-page px-margin mx-auto mt-24 scroll-mt-24 md:mt-32"
        >
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.5fr]">
            <Reveal>
              <p className="type-hand text-terracotta-deep text-2xl md:text-3xl">
                sawaal-jawaab
              </p>
              <h2 id="faqs-title" className="display-lg text-on-surface mt-1">
                Questions, <em className="text-terracotta-deep">answered</em>
              </h2>
              <p className="text-on-surface-secondary mt-4">
                Still unsure about {title}?{" "}
                <a
                  href="#need-help-title"
                  className="text-burgundy font-semibold underline underline-offset-4"
                >
                  Ask us
                </a>
                .
              </p>
            </Reveal>
            <Reveal
              delay={100}
              className="divide-y divide-[color-mix(in_oklab,var(--color-gold)_45%,transparent)] border-y border-[color-mix(in_oklab,var(--color-gold)_45%,transparent)]"
            >
              {content.faqs.map((faq, index) => (
                <details
                  key={faq.question}
                  className="group"
                  name="product-faq"
                  open={index === 0}
                >
                  <summary className="marker-hidden hover:text-burgundy flex min-h-16 cursor-pointer items-center justify-between gap-4 py-4 text-lg font-bold">
                    {faq.question}
                    <span className="bg-peach-soft inline-grid size-9 shrink-0 place-items-center rounded-full motion-safe:transition-transform group-open:rotate-45">
                      <Icon name="plus" size={18} strokeWidth={2.25} />
                    </span>
                  </summary>
                  <p className="text-on-surface/85 max-w-prose pb-6 text-[1.05rem] leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ── Declarations + help ───────────────────────────── */}
      <section
        aria-label="Product information and help"
        className="max-w-page px-margin mx-auto mt-20 grid gap-6 lg:grid-cols-2"
      >
        <LegalDeclarations
          legal={content.legal}
          mrp={mrp}
          netQuantity={netQuantity}
          profile={profile}
        />
        <div className="lg:pt-8">
          <NeedHelp profile={profile} productTitle={title} />
          {collection ? (
            <Link
              to={`/collections/${collection.handle}`}
              className="text-burgundy mt-5 inline-flex min-h-11 items-center gap-2 font-bold"
            >
              More from {collection.title} <Icon name="arrow-right" size={18} />
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
