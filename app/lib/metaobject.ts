// Helpers for reading Shopify metaobject/metafield values safely.
// Rule: an empty or missing value returns null, and the UI hides that element.

type RawField = {
  key: string;
  value?: string | null;
  type?: string;
};

export type FieldMap = Record<string, string>;

/** Turns a metaobject's `fields` list into `{ key: value }`, dropping empty values. */
export function fieldMap(fields: readonly RawField[] | null | undefined): FieldMap {
  const map: FieldMap = {};
  for (const field of fields ?? []) {
    const value = field.value?.trim();
    if (value) map[field.key] = value;
  }
  return map;
}

export function text(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function bool(value: string | null | undefined): boolean {
  return value?.trim() === "true";
}

export function int(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Splits a multi-line text field into trimmed, non-empty lines. */
export function lines(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Parses a `list.*` metafield value (a JSON array of strings). */
export function list(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && item.trim() !== "")
      : [];
  } catch {
    return [];
  }
}

export type LinkValue = { text: string; url: string };

/**
 * Shopify link fields require absolute URLs. Links that point at the store's own
 * myshopify domain become on-site paths so they route inside the storefront.
 */
export function toSitePath(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith(".myshopify.com")) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
    }
    return url;
  } catch {
    return url;
  }
}

/** Parses a `link` field (`{"text": "...", "url": "..."}`). */
export function link(value: string | null | undefined): LinkValue | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<LinkValue>;
    const url = text(parsed.url);
    if (!url) return null;
    return { text: text(parsed.text) ?? "", url: toSitePath(url) };
  } catch {
    return null;
  }
}

/** Parses a `list.link` field. */
export function linkList(value: string | null | undefined): LinkValue[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => link(JSON.stringify(item)))
      .filter((item): item is LinkValue => item !== null);
  } catch {
    return [];
  }
}

export type MoneyValue = { amount: string; currencyCode: string };

/** Parses a `money` field (`{"amount": "499.00", "currency_code": "INR"}`). */
export function money(value: string | null | undefined): MoneyValue | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as { amount?: string; currency_code?: string };
    const amount = Number.parseFloat(parsed.amount ?? "");
    if (!Number.isFinite(amount) || amount <= 0 || !parsed.currency_code) return null;
    return { amount: String(parsed.amount), currencyCode: parsed.currency_code };
  } catch {
    return null;
  }
}

/** True when `now` is inside the optional [startsAt, endsAt] window. */
export function isWithinWindow(
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
  now = Date.now(),
): boolean {
  const start = startsAt ? Date.parse(startsAt) : Number.NaN;
  const end = endsAt ? Date.parse(endsAt) : Number.NaN;
  if (Number.isFinite(start) && now < start) return false;
  if (Number.isFinite(end) && now > end) return false;
  return true;
}
