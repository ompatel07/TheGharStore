// Security headers for every HTML response (set in entry.server.tsx).
//
// Content-Security-Policy: scripts only from this site and Shopify's CDN;
// no plugins, no <base> hijacking, no framing by other sites; forms may only
// post here or to Shopify (checkout, customer accounts). Shopify's storefront
// scripts inject small inline bootstraps without nonce support, so inline
// scripts stay allowed — the host allow-list still blocks third-party script
// injection. Dev (localhost) gets the Vite HMR socket and no upgrade rule.

const SHOPIFY = [
  "https://cdn.shopify.com",
  "https://*.shopify.com",
  "https://*.myshopify.com",
  "https://*.shopifycloud.com",
  "https://*.shopifysvc.com",
];

export function securityHeaders(requestUrl: string): Record<string, string> {
  const url = new URL(requestUrl);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...SHOPIFY],
    "style-src": ["'self'", "'unsafe-inline'", "https://cdn.shopify.com"],
    "img-src": ["'self'", "data:", "blob:", ...SHOPIFY, "https://*.judge.me", "https://judgeme.imgix.net"],
    "font-src": ["'self'", "data:", "https://cdn.shopify.com"],
    "connect-src": ["'self'", ...SHOPIFY, ...(local ? ["ws://localhost:*", "http://localhost:*"] : [])],
    "media-src": ["'self'", "blob:", ...SHOPIFY],
    "frame-src": ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com", "https://player.vimeo.com", ...SHOPIFY],
    "worker-src": ["'self'", "blob:"],
    "form-action": ["'self'", ...SHOPIFY, "https://shop.app"],
    "frame-ancestors": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
  };
  const csp = Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .concat(local ? [] : ["upgrade-insecure-requests"])
    .join("; ");

  return {
    "Content-Security-Policy": csp,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), usb=(), interest-cohort=()",
    ...(local ? {} : { "Strict-Transport-Security": "max-age=31536000" }),
  };
}
