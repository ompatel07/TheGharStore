// Star rating from Shopify's standard review metafields (reviews.rating /
// reviews.rating_count), written by a real reviews app such as Judge.me.
// Renders NOTHING unless a real rating with at least one review exists.

export type RatingData = { value: number; max: number; count: number };

type MetafieldValue = { value?: string | null } | null | undefined;

export function parseRating(
  rating: MetafieldValue,
  count: MetafieldValue,
): RatingData | null {
  if (!rating?.value || !count?.value) return null;
  try {
    const parsed = JSON.parse(rating.value) as {
      value?: string;
      scale_max?: string;
    };
    const value = Number.parseFloat(parsed.value ?? "");
    const max = Number.parseFloat(parsed.scale_max ?? "5");
    const total = Number.parseInt(count.value, 10);
    if (!Number.isFinite(value) || !Number.isFinite(total) || total < 1)
      return null;
    return { value, max: Number.isFinite(max) ? max : 5, count: total };
  } catch {
    return null;
  }
}

export function Rating({
  rating,
  size = "sm",
}: {
  rating: RatingData;
  size?: "sm" | "md";
}) {
  const percent = Math.max(0, Math.min(100, (rating.value / rating.max) * 100));
  const star = size === "md" ? "text-lg" : "text-sm";
  return (
    <p className="text-on-surface inline-flex items-center gap-1.5">
      <span
        className={`relative inline-block leading-none ${star}`}
        aria-hidden="true"
      >
        <span className="text-chocolate/20">★★★★★</span>
        <span
          className="text-terracotta-deep absolute inset-0 overflow-hidden whitespace-nowrap"
          style={{ width: `${percent}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span
        className={
          size === "md" ? "text-sm font-semibold" : "text-xs font-semibold"
        }
      >
        {rating.value.toFixed(1)}
        <span className="text-on-surface-secondary font-normal">
          {" "}
          ({rating.count})
        </span>
      </span>
      <span className="sr-only">
        Rated {rating.value.toFixed(1)} out of {rating.max} from {rating.count}{" "}
        {rating.count === 1 ? "review" : "reviews"}
      </span>
    </p>
  );
}
