import { useEffect, useId, useState } from "react";
import { useFetcher } from "react-router";

import { Icon } from "~/components/ui/Icon";
import type { RatingData } from "~/components/ui/Rating";
import { SectionHeading } from "~/components/ui/SectionHeading";
import type { PublicReview, ReviewsPayload } from "~/lib/reviews";

const DATE = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

function Stars({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <span className="text-terracotta-deep inline-flex gap-0.5" aria-label={`${value} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className={star <= value ? "fill-current" : "fill-current opacity-20"}>
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
        </svg>
      ))}
    </span>
  );
}

/**
 * Product reviews from Judge.me, shown in the store's own design. Only real,
 * published reviews appear (verified buyers are labelled). Visitors can write
 * one on the page; it goes to Judge.me and appears once approved. Without a
 * Judge.me token configured, the form falls back to email.
 */
export function Reviews({
  productId,
  productHandle,
  title,
  rating,
  supportEmail,
}: {
  productId: string;
  productHandle: string;
  title: string;
  rating: RatingData | null;
  supportEmail: string | null;
}) {
  // One fetcher per product, so reviews never carry over between product pages.
  const { load, state, data } = useFetcher<ReviewsPayload>({ key: `reviews:${productId}` });
  const [open, setOpen] = useState(false);
  const url = `/api/reviews?productId=${encodeURIComponent(productId)}`;

  useEffect(() => {
    if (state === "idle" && !data) void load(url);
  }, [load, state, data, url]);

  const reviews = data?.reviews ?? [];
  const configured = data?.configured ?? true;
  const loading = !data;
  const average = rating?.value ?? (reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0);
  const count = rating?.count ?? data?.total ?? reviews.length;

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="max-w-page px-margin mx-auto mt-20 scroll-mt-40 md:mt-28">
      <div className="overflow-hidden rounded-[2rem] bg-white p-6 shadow-[var(--shadow)] md:p-12">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <SectionHeading id="reviews-title" kicker="aapki raay" title="Customer" accent="reviews" size="md" />
            {count > 0 && average > 0 ? (
              <div className="mt-5 flex items-center gap-4">
                <span className="font-heading text-on-surface text-6xl font-extrabold">{average.toFixed(1)}</span>
                <div>
                  <Stars value={Math.round(average)} size={22} />
                  <p className="text-on-surface-secondary mt-1 text-sm">
                    Based on {count} {count === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
            ) : !loading ? (
              <p className="text-on-surface-secondary mt-4 max-w-lg text-lg leading-relaxed">
                No reviews yet. We only show reviews from real customers, never copied or made-up ones. Be the first to share yours.
              </p>
            ) : null}
          </div>
          <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="btn btn-dark w-fit">
            <Icon name={open ? "close" : "plus"} size={18} />
            {open ? "Close" : "Write a review"}
          </button>
        </div>

        {open ? (
          configured ? (
            <ReviewForm productId={productId} productHandle={productHandle} title={title} />
          ) : (
            <p className="bg-peach-soft mt-8 rounded-2xl p-5">
              Email your review to{" "}
              <a className="text-burgundy font-bold underline" href={`mailto:${supportEmail ?? ""}?subject=${encodeURIComponent(`My review: ${title}`)}`}>
                {supportEmail ?? "us"}
              </a>{" "}
              with your order number. We'll add it once confirmed.
            </p>
          )
        ) : null}

        {loading ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2" aria-hidden="true">
            {[0, 1].map((index) => (
              <div key={index} className="skeleton h-40" />
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <ul role="list" className="mt-10 grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: PublicReview }) {
  const date = review.date ? DATE.format(new Date(review.date)) : null;
  return (
    <li className="border-border bg-cream flex flex-col gap-3 rounded-[1.5rem] border p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <Stars value={review.rating} />
        {date ? <span className="text-on-surface-secondary text-xs">{date}</span> : null}
      </div>
      {review.title ? <p className="font-heading text-on-surface text-lg font-bold">{review.title}</p> : null}
      <p className="text-on-surface/90 leading-relaxed whitespace-pre-line">{review.body}</p>
      {review.photos.length > 0 ? (
        <ul role="list" className="flex gap-2">
          {review.photos.map((photo) => (
            <li key={photo}>
              <a href={photo} target="_blank" rel="noopener noreferrer">
                <img src={photo} alt={`Shared by ${review.name}`} className="size-16 rounded-xl object-cover" loading="lazy" />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-auto flex items-center gap-2 pt-1 text-sm">
        <span className="bg-peach text-chocolate grid size-8 place-items-center rounded-full font-bold">{review.name.charAt(0)}</span>
        <span className="text-on-surface font-semibold">{review.name}</span>
        {review.verified ? (
          <span className="text-success inline-flex items-center gap-1 text-xs font-bold">
            <Icon name="shield" size={14} />
            Verified buyer
          </span>
        ) : null}
      </p>
    </li>
  );
}

function ReviewForm({ productId, productHandle, title }: { productId: string; productHandle: string; title: string }) {
  const fetcher = useFetcher<{ status: "ok" | "invalid" | "failed" | "unconfigured"; errors?: string[] }>();
  const [rating, setRating] = useState(0);
  const id = useId();
  const status = fetcher.data?.status;
  const errors = new Set(fetcher.data?.errors ?? []);

  if (status === "ok") {
    return (
      <div className="bg-peach-soft mt-8 flex items-start gap-3 rounded-2xl p-5" role="status">
        <Icon name="check" size={22} className="text-success mt-0.5" />
        <p>
          <strong>Thank you!</strong> Your review of {title} has been sent. It will appear here once it's approved.
        </p>
      </div>
    );
  }

  const input =
    "w-full !rounded-2xl !border-[var(--color-border)] !bg-[var(--color-cream)] !px-4 !py-3 text-on-surface focus:!border-[var(--color-burgundy)]";

  return (
    <fetcher.Form method="post" action="/api/reviews" className="bg-cream mt-8 grid gap-4 rounded-[1.5rem] p-5 md:grid-cols-2 md:p-7">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productHandle" value={productHandle} />
      <input type="hidden" name="rating" value={rating || ""} />
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Leave this empty</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="md:col-span-2">
        <legend className="text-on-surface mb-2 font-bold">Your rating</legend>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onClick={() => setRating(star)}
              className={`transition-transform hover:scale-110 ${star <= rating ? "text-terracotta-deep" : "text-chocolate/25"}`}
            >
              <svg viewBox="0 0 24 24" width={34} height={34} className="fill-current" aria-hidden="true">
                <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
              </svg>
            </button>
          ))}
        </div>
        {errors.has("rating") ? <p className="text-critical mt-1 text-sm">Please choose a rating.</p> : null}
      </fieldset>

      <label className="grid gap-1.5 text-sm font-semibold">
        Name
        <input name="name" required minLength={2} maxLength={80} autoComplete="name" className={input} />
        {errors.has("name") ? <span className="text-critical">Please add your name.</span> : null}
      </label>
      <label className="grid gap-1.5 text-sm font-semibold">
        Email <span className="text-on-surface-secondary font-normal">(not shown publicly)</span>
        <input name="email" type="email" required maxLength={120} autoComplete="email" className={input} />
        {errors.has("email") ? <span className="text-critical">Please enter a valid email.</span> : null}
      </label>
      <label className="grid gap-1.5 text-sm font-semibold md:col-span-2">
        Title <span className="text-on-surface-secondary font-normal">(optional)</span>
        <input name="title" maxLength={120} className={input} />
      </label>
      <label className="grid gap-1.5 text-sm font-semibold md:col-span-2">
        Your review
        <textarea name="body" required minLength={10} maxLength={3000} rows={4} className={input} />
        {errors.has("body") ? <span className="text-critical">Please write at least a sentence.</span> : null}
      </label>
      <div className="flex flex-wrap items-center gap-4 md:col-span-2">
        <button type="submit" disabled={fetcher.state !== "idle"} className="button-cta h-12 !px-7">
          {fetcher.state !== "idle" ? "Sending…" : "Submit review"}
        </button>
        {status === "failed" ? <p className="text-critical text-sm">Couldn't send right now. Please try again in a minute.</p> : null}
        <p className="text-on-surface-secondary text-xs">Reviews are checked before they're published.</p>
      </div>
    </fetcher.Form>
  );
}
