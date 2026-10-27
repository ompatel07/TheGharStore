// Judge.me reviews, server side only. The private API token lives in the
// environment (JUDGEME_PRIVATE_TOKEN) and never reaches the browser.
// Docs: https://judge.me/api — reviews are read by Judge.me's internal product
// id, so we look that up from the Shopify product id first.

import type { Env } from "~/lib/env";
import type { PublicReview, ReviewsPayload } from "~/lib/reviews";

export type { PublicReview, ReviewsPayload };

const API = "https://judge.me/api/v1";
const TIMEOUT_MS = 4000;

function config(env: Env) {
  const token = env.JUDGEME_PRIVATE_TOKEN;
  const shopDomain = env.JUDGEME_SHOP_DOMAIN || env.PUBLIC_STORE_DOMAIN;
  if (!token || !shopDomain) return null;
  return { token, shopDomain };
}

export function judgeMeConfigured(env: Env) {
  return config(env) !== null;
}

async function call(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function numericId(gid: string) {
  return gid.split("/").pop() ?? "";
}

/** "Priya Sharma" → "Priya S." (reviews show first name + initial only). */
function displayName(raw: unknown) {
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) return "Customer";
  const [first, ...rest] = name.split(/\s+/);
  const last = rest.pop();
  return last ? `${first} ${last.charAt(0).toUpperCase()}.` : first;
}

type RawReview = {
  id?: number | string;
  rating?: number;
  title?: string | null;
  body?: string | null;
  created_at?: string;
  hidden?: boolean;
  published?: boolean;
  curated?: string;
  verified?: string;
  reviewer?: { name?: string };
  pictures?: { hidden?: boolean; urls?: { compact?: string; small?: string; original?: string } }[];
};

function toPublic(review: RawReview): PublicReview | null {
  if (review.hidden || review.published === false || review.curated === "spam") return null;
  const rating = Number(review.rating);
  const body = (review.body ?? "").replace(/<[^>]*>/g, "").trim();
  if (!Number.isFinite(rating) || rating < 1 || !body) return null;
  return {
    id: String(review.id ?? ""),
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    title: review.title?.replace(/<[^>]*>/g, "").trim() || null,
    body,
    name: displayName(review.reviewer?.name),
    date: review.created_at ?? "",
    // Judge.me marks reviews tied to a real order as verified buyers.
    verified: typeof review.verified === "string" && review.verified.includes("buyer"),
    photos: (review.pictures ?? [])
      .filter((picture) => !picture.hidden)
      .map((picture) => picture.urls?.compact ?? picture.urls?.small ?? picture.urls?.original ?? "")
      .filter(Boolean)
      .slice(0, 4),
  };
}

/** Published reviews for one Shopify product (newest first). */
export async function fetchProductReviews(env: Env, productGid: string, page = 1): Promise<ReviewsPayload> {
  const settings = config(env);
  if (!settings) return { configured: false, reviews: [], total: 0 };
  const base = `api_token=${encodeURIComponent(settings.token)}&shop_domain=${encodeURIComponent(settings.shopDomain)}`;

  try {
    const productResponse = await call(`${API}/products/-1?${base}&external_id=${encodeURIComponent(numericId(productGid))}`);
    if (!productResponse.ok) return { configured: true, reviews: [], total: 0 };
    const productJson = (await productResponse.json()) as { product?: { id?: number } };
    const judgeMeId = productJson.product?.id;
    if (!judgeMeId) return { configured: true, reviews: [], total: 0 };

    const reviewsResponse = await call(`${API}/reviews?${base}&product_id=${judgeMeId}&per_page=10&page=${page}`);
    if (!reviewsResponse.ok) return { configured: true, reviews: [], total: 0 };
    const reviewsJson = (await reviewsResponse.json()) as { reviews?: RawReview[]; total?: number };
    const reviews = (reviewsJson.reviews ?? []).map(toPublic).filter((review): review is PublicReview => Boolean(review));
    return { configured: true, reviews, total: Number(reviewsJson.total) || reviews.length };
  } catch {
    return { configured: true, reviews: [], total: 0 };
  }
}

export type NewReview = {
  productGid: string;
  productHandle: string;
  name: string;
  email: string;
  rating: number;
  title: string;
  body: string;
};

/** Sends a storefront review to Judge.me; it publishes per the shop's moderation settings. */
export async function submitReview(env: Env, review: NewReview): Promise<"ok" | "unconfigured" | "failed"> {
  const settings = config(env);
  if (!settings) return "unconfigured";
  try {
    const response = await call(`${API}/reviews?api_token=${encodeURIComponent(settings.token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop_domain: settings.shopDomain,
        platform: "shopify",
        id: Number(numericId(review.productGid)),
        url: review.productHandle,
        name: review.name,
        email: review.email,
        rating: review.rating,
        title: review.title,
        body: review.body,
      }),
    });
    return response.ok ? "ok" : "failed";
  } catch {
    return "failed";
  }
}
