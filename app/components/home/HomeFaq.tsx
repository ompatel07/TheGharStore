import { Link } from "react-router";

import { Icon } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";
import { SectionHeading } from "~/components/ui/SectionHeading";
import type { FaqItem } from "~/lib/promises";
import type { StoreProfile } from "~/lib/site-content";

/**
 * Numbered FAQ accordion (native <details>, so it works without JS). Answers
 * are generated from the store's own promises and contact details.
 */
export function HomeFaq({ faqs, profile = null }: { faqs: FaqItem[]; profile?: StoreProfile | null }) {
  const phoneHref = profile?.supportPhone ? `tel:${profile.supportPhone.replace(/[^\d+]/g, "")}` : null;
  if (faqs.length < 3) return null;

  return (
    <section aria-labelledby="faq-title" className="cv-auto max-w-page px-margin mx-auto py-16 md:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
        <Reveal>
          <SectionHeading id="faq-title" kicker="koi sawaal?" title="Questions," accent="answered" />
          <p className="text-on-surface-secondary mt-4 max-w-sm text-lg">
            Delivery, payment and replacements, in plain words.
          </p>
          <div className="bg-chocolate text-cream relative mt-8 overflow-hidden rounded-[1.75rem] p-7">
            <span aria-hidden="true" className="bg-terracotta/30 absolute -top-10 -right-10 size-40 rounded-full blur-2xl" />
            <p className="type-hand text-peach relative text-2xl">abhi bhi sawaal?</p>
            <p className="font-heading relative mt-1 text-2xl font-extrabold tracking-tight">Talk to a real person</p>
            {profile?.supportHours ? <p className="text-cream/70 relative mt-1 text-sm">{profile.supportHours}</p> : null}
            <div className="relative mt-5 grid gap-2.5">
              {phoneHref ? (
                <a href={phoneHref} className="btn btn-light justify-start">
                  <Icon name="phone" size={18} />
                  {profile?.supportPhone}
                </a>
              ) : null}
              {profile?.supportEmail ? (
                <a href={`mailto:${profile.supportEmail}`} className="btn btn-ghost-light justify-start">
                  <Icon name="mail" size={18} />
                  Email us
                </a>
              ) : null}
              <Link to="/pages/contact" className="text-cream/80 mt-1 inline-flex items-center gap-1.5 text-sm font-semibold">
                <span className="link-sweep">Contact page</span>
                <Icon name="arrow-right" size={14} />
              </Link>
            </div>
          </div>
        </Reveal>
        <Reveal className="stagger border-border border-t">
          {faqs.map((faq, index) => (
            <details key={faq.question} className="faq-item border-border group border-b" name="home-faq">
              <summary className="flex cursor-pointer list-none items-center gap-5 py-5 md:py-6 [&::-webkit-details-marker]:hidden">
                <span className="font-heading text-terracotta-deep w-9 shrink-0 text-xl font-extrabold tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-on-surface flex-1 text-[1.05rem] font-bold md:text-lg">{faq.question}</span>
                <span className="faq-plus bg-peach-soft text-chocolate grid size-10 shrink-0 place-items-center rounded-full">
                  <Icon name="plus" size={18} strokeWidth={2.25} />
                </span>
              </summary>
              <div className="faq-answer ps-14 pe-4 pb-6">
                <p className="text-on-surface-secondary max-w-2xl leading-relaxed">{faq.answer}</p>
                {faq.to ? (
                  <Link to={faq.to} className="text-burgundy mt-2 inline-flex min-h-9 items-center gap-1 text-sm font-bold">
                    <span className="link-sweep">Read more</span>
                    <Icon name="arrow-right" size={14} />
                  </Link>
                ) : null}
              </div>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
