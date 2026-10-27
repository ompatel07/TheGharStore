import { useEffect, useState } from "react";
import { Link } from "react-router";

import { PRODUCT_FORM_ID } from "~/components/product/BuyBox";
import { Icon } from "~/components/ui/Icon";
import { SectionHeading } from "~/components/ui/SectionHeading";
import { shopifyImageUrl } from "~/lib/image";
import { formatPrice } from "~/lib/money";
import { useProductForm } from "~/lib/product";

type Img = { url: string; altText?: string | null; width?: number | null; height?: number | null };
type Money = { amount: string; currencyCode: string };

/* ────────────────────────────────────────────────────────────────────────── */
/* Sticky section bar (desktop): product, tabs that follow the scroll, CTA.  */
/* ────────────────────────────────────────────────────────────────────────── */

export function SectionTabs({
  visible,
  title,
  image,
  price,
  addable,
  sections,
}: {
  visible: boolean;
  title: string;
  image: Img | null;
  price: Money;
  addable: boolean;
  sections: { id: string; label: string }[];
}) {
  const { register, pending } = useProductForm();
  const [active, setActive] = useState<string | null>(null);

  const sectionKey = sections.map((section) => section.id).join(",");
  useEffect(() => {
    const elements = sectionKey
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sectionKey]);

  return (
    <div
      className={`pdp-tabs fixed inset-x-0 top-[5.5rem] z-30 hidden border-b border-[var(--color-border)] bg-[rgb(255_248_239/0.92)] backdrop-blur-md lg:block motion-safe:transition-transform motion-safe:duration-500 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-[12rem] opacity-0"
      }`}
      inert={!visible}
    >
      <div className="max-w-page px-margin mx-auto flex h-16 items-center gap-6">
        <div className="flex min-w-0 items-center gap-3">
          {image ? <img loading="lazy" src={shopifyImageUrl(image.url, { width: 96 })} alt="" className="size-10 rounded-lg object-cover" /> : null}
          <p className="text-on-surface max-w-[16rem] truncate text-sm font-bold">{title}</p>
        </div>
        <nav aria-label="Product sections" className="mx-auto">
          <ul className="flex items-center gap-1">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={active === section.id ? "true" : undefined}
                  className={`relative inline-flex h-16 items-center px-3 text-sm font-semibold transition-colors ${
                    active === section.id ? "text-burgundy" : "text-on-surface-secondary hover:text-on-surface"
                  }`}
                >
                  {section.label}
                  <span
                    aria-hidden="true"
                    className={`bg-terracotta-deep absolute inset-x-3 bottom-0 h-0.5 origin-left rounded-full transition-transform duration-500 ${active === section.id ? "scale-x-100" : "scale-x-0"}`}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          <span className="font-heading text-on-surface text-xl font-extrabold">{formatPrice(price)}</span>
          <button
            {...register("addToCart", {})}
            form={PRODUCT_FORM_ID}
            disabled={!addable || pending}
            className="button-cta shine h-11 !px-5"
          >
            <Icon name="cart" size={18} />
            {addable ? (pending ? "Adding…" : "Add to cart") : "Sold out"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Why you'll love it: highlights as a photo bento                            */
/* ────────────────────────────────────────────────────────────────────────── */

const LOVE_ICONS = ["sparkle", "check", "gift", "home"] as const;

export function WhyLoveIt({ highlights, images, title }: { highlights: string[]; images: Img[]; title: string }) {
  const items = highlights.slice(0, 3);
  if (items.length === 0 || images.length < 2) return null;
  const [lead, ...rest] = images;

  return (
    <section id="overview" aria-labelledby="love-title" className="max-w-page px-margin mx-auto mt-20 scroll-mt-40 md:mt-28">
      <SectionHeading id="love-title" kicker="dil se" title="Why you'll" accent="love it" note={`a closer look at the ${title.split(" ").slice(0, 3).join(" ").toLowerCase()}`} />
      <div className="mt-10 grid gap-4 md:grid-cols-[1.25fr_1fr] md:gap-5">
        <figure className="bg-cream-deep group relative row-span-2 min-h-[22rem] overflow-hidden rounded-[2rem]">
          <img
            src={shopifyImageUrl(lead.url, { width: 1000 })}
            alt={lead.altText ?? title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-105"
          />
          <figcaption className="bg-chocolate/85 text-cream absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl p-4 backdrop-blur md:inset-x-6 md:bottom-6">
            <span className="from-peach to-terracotta-deep text-chocolate grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br">
              <Icon name={LOVE_ICONS[0]} size={22} />
            </span>
            <span className="font-heading text-lg leading-snug font-bold">{items[0]}</span>
          </figcaption>
        </figure>
        {items.slice(1).map((item, index) => {
          const image = rest[index] ?? rest[0];
          return (
            <figure key={item} className="group relative grid min-h-[12rem] grid-cols-[1fr_1.1fr] overflow-hidden rounded-[2rem] bg-white shadow-[var(--shadow)]">
              <figcaption className="flex flex-col justify-between gap-4 p-6">
                <span className="bg-peach-soft text-terracotta-deep grid size-11 place-items-center rounded-xl">
                  <Icon name={LOVE_ICONS[index + 1]} size={22} />
                </span>
                <span className="font-heading text-on-surface text-xl leading-snug font-bold">{item}</span>
              </figcaption>
              {image ? (
                <span className="relative overflow-hidden">
                  <img
                    src={shopifyImageUrl(image.url, { width: 600 })}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-105"
                  />
                </span>
              ) : null}
            </figure>
          );
        })}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Recently viewed (this browser only)                                        */
/* ────────────────────────────────────────────────────────────────────────── */

type Seen = { handle: string; title: string; image: string | null; price: Money };
const SEEN_KEY = "ghar:recently-viewed";

function readSeen(): Seen[] {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Seen[]).filter((item) => item?.handle && item?.price) : [];
  } catch {
    return [];
  }
}

/** Remembers this product and shows the visitor's other recent ones. */
export function RecentlyViewed({ current }: { current: Seen }) {
  const [items, setItems] = useState<Seen[]>([]);

  useEffect(() => {
    const previous = readSeen().filter((item) => item.handle !== current.handle);
    setItems(previous.slice(0, 8));
    try {
      window.localStorage.setItem(SEEN_KEY, JSON.stringify([current, ...previous].slice(0, 12)));
    } catch {
      // Storage blocked (private mode): nothing to remember.
    }
  }, [current]);

  if (items.length === 0) return null;
  return (
    <section aria-labelledby="seen-title" className="max-w-page px-margin mx-auto mt-16">
      <h2 id="seen-title" className="font-heading text-on-surface text-2xl font-extrabold tracking-tight">
        Recently viewed
      </h2>
      <ul role="list" className="scrollbar-none -mx-[var(--spacing-margin)] mt-5 flex gap-3 overflow-x-auto px-[var(--spacing-margin)] pb-2">
        {items.map((item) => (
          <li key={item.handle} className="w-40 shrink-0 md:w-48">
            <Link to={`/products/${item.handle}`} prefetch="intent" className="group block" viewTransition>
              <span className="bg-cream-deep block aspect-square overflow-hidden rounded-2xl">
                {item.image ? (
                  <img
                    src={shopifyImageUrl(item.image, { width: 320 })}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : null}
              </span>
              <span className="text-on-surface mt-2 line-clamp-2 text-sm font-semibold">{item.title}</span>
              <span className="text-on-surface text-sm font-bold">{formatPrice(item.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
