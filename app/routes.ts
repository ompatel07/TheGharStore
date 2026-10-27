import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("products/:handle", "routes/product.tsx"),
  route("collections", "routes/collections.tsx"),
  route("collections/:handle", "routes/collection.tsx"),
  route("cart", "routes/cart.tsx"),
  route("search", "routes/search.tsx"),
  route("account", "routes/account.tsx"),
  route("account/orders/:id", "routes/account.order.tsx"),
  route("pages/:handle", "routes/page.tsx"),
  route("policies", "routes/policies.tsx"),
  route("policies/:handle", "routes/policy.tsx"),
  route("sitemap.xml", "routes/sitemap.tsx"),
  route("robots.txt", "routes/robots.tsx"),
  route("api/recommendations", "routes/api.recommendations.tsx"),
  route("api/reviews", "routes/api.reviews.tsx"),
  route("*", "routes/catchall.tsx"),
] satisfies RouteConfig;
