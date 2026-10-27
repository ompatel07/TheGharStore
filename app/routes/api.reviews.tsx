import { envContext } from "~/lib/env";
import { fetchProductReviews, submitReview } from "~/lib/judgeme.server";

import type { Route } from "./+types/api.reviews";

const GID = /^gid:\/\/shopify\/Product\/\d+$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** True when the Origin header points at this site ("null" or junk → false). */
function sameHost(origin: string, requestUrl: string) {
  try {
    return new URL(origin).host === new URL(requestUrl).host;
  } catch {
    return false;
  }
}

/** GET /api/reviews?productId=gid://… → published Judge.me reviews (JSON). */
export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId") ?? "";
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  if (!GID.test(productId)) return Response.json({ configured: false, reviews: [], total: 0 }, { status: 400 });
  const payload = await fetchProductReviews(context.get(envContext), productId, page);
  return Response.json(payload, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } });
}

/** POST /api/reviews — a visitor's review, forwarded to Judge.me for moderation. */
export async function action({ context, request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ status: "failed" }, { status: 405 });
  const origin = request.headers.get("Origin");
  if (origin && !sameHost(origin, request.url)) {
    return Response.json({ status: "failed" }, { status: 403 });
  }
  if (Number(request.headers.get("Content-Length") ?? 0) > 20_000) {
    return Response.json({ status: "invalid", errors: ["body"] }, { status: 413 });
  }
  const form = await request.formData();
  const field = (name: string) => String(form.get(name) ?? "").trim();

  // Honeypot: real people never fill this hidden field.
  if (field("website")) return Response.json({ status: "ok" });

  const review = {
    productGid: field("productId"),
    productHandle: field("productHandle"),
    name: field("name").slice(0, 80),
    email: field("email").slice(0, 120),
    rating: Number.parseInt(field("rating"), 10),
    title: field("title").slice(0, 120),
    body: field("body").slice(0, 3000),
  };
  const errors: string[] = [];
  if (!GID.test(review.productGid)) errors.push("product");
  if (review.name.length < 2) errors.push("name");
  if (!EMAIL.test(review.email)) errors.push("email");
  if (!(review.rating >= 1 && review.rating <= 5)) errors.push("rating");
  if (review.body.length < 10) errors.push("body");
  if (errors.length > 0) return Response.json({ status: "invalid", errors }, { status: 400 });

  const status = await submitReview(context.get(envContext), review);
  return Response.json({ status }, { status: status === "failed" ? 502 : 200 });
}
