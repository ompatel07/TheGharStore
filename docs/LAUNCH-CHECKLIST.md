# Launch checklist and QA report (27 Oct 2026)

## Go-live steps (Shopify admin, in this order)

1. **Remove the store password.** Online Store → Preferences → Password protection → untick
   "Restrict access to visitors with the password" → Save.
   Until this is done, **every checkout redirects to the password page** and nobody can order.
2. **Make the storefront public.** Sales channels → Hydrogen → The Ghar Store → Storefront settings →
   Environments and variables → Production → URL privacy → **Public**.
   Live URL today: https://the-ghar-store-8acf3b86437f610f9c75.o2.myshopify.dev
3. **Cash on Delivery only.** Settings → Payments → Manual payment methods → add **Cash on Delivery (COD)**.
   Deactivate any other payment provider.
4. **Store name.** Settings → Store details → change "My Store" to **The Ghar Store**
   (it is shown in the checkout tab title, emails and policies).
5. **Policies.** Settings → Policies: paste the refund and shipping policies from `ADMIN-SETUP.md`;
   also generate Terms of service and fill Contact information.
6. **Checkout.** Settings → Checkout → Customer contact → set **Phone number: Required**
   (couriers need it for COD).
7. **Judge.me token.** Add `JUDGEME_PRIVATE_TOKEN` (see `ADMIN-SETUP.md`), then redeploy.
8. **Domain (recommended).** Settings → Domains → buy or connect a domain → assign it to the
   Hydrogen storefront (Hydrogen → Storefront settings → Domains).
9. **Legal (India e-commerce rules).** Store profile metaobject: legal name, GSTIN, grievance officer.
10. **Test order.** On the public site: add to cart → checkout → COD → place order. Check the
    confirmation email, then cancel and archive the order.

## QA results (automated, production build)

| Area | Result |
|---|---|
| Link crawl (42 pages from home, collections, products, search, policies, sitemap, robots) | All 200; unknown product → branded 404 |
| Console errors | None from the site |
| Cart: add, qty +/−, remove, close (Esc), "Buy it together" (3 items) | Pass |
| Checkout hand-off | Reaches Shopify checkout; **blocked by store password (step 1)** |
| Mobile: menu drawer, predictive search | Pass |
| Accessibility (axe, WCAG 2.1 AA) on home, collection, product, cart, search, contact | 0 violations after fixes |
| Content-Security-Policy | 0 violations across all flows |
| Performance (throttled slow 4G + 4× CPU, mobile) | LCP home 4.2 s, product 4.9 s, collection 2.9 s; CLS 0 |

## Security review

- **Secrets:** none in tracked files or git history; `.env` is git-ignored. Judge.me token is server-only
  (`app/lib/judgeme.server.ts`), never sent to the browser.
- **Dependencies:** React Router upgraded 7.15.1 → 7.18.4 (fixes open-redirect, XSS and DoS advisories);
  `npm audit --omit=dev`: 0 vulnerabilities.
- **Headers (all HTML responses):** Content-Security-Policy (scripts only from this site + Shopify; no
  framing, no plugins, forms only to this site/Shopify), X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy, HSTS (`app/lib/security-headers.ts`).
- **XSS:** user input (search) is escaped everywhere (tested with a `</script>` payload); JSON-LD escapes `<`;
  raw HTML is only merchant content from Shopify (descriptions, pages, policies).
- **Review form API:** same-origin only, size limit, validation, honeypot; reviews are moderated in Judge.me.
- **Payments:** COD only; the storefront never handles card data (checkout is Shopify's).
- **Known limitation:** inline scripts are allowed in the CSP because Shopify's storefront scripts inject
  inline bootstraps without nonce support; the host allow-list still blocks third-party scripts.
