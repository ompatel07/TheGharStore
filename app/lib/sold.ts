// "Units sold" badge from the merchant's real figure (product metafield
// custom.units_sold, entered in Shopify admin). Rounded DOWN to a bucket so
// the badge never overstates: 520 → "500+ sold". Under 50, or empty → no badge.

const BUCKETS = [10000, 5000, 2000, 1000, 500, 250, 100, 50];

export function soldLabel(value: string | null | undefined): string | null {
  const count = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(count) || count < BUCKETS[BUCKETS.length - 1]) return null;
  const bucket = BUCKETS.find((step) => count >= step);
  return bucket ? `${bucket.toLocaleString("en-IN")}+ sold` : null;
}
