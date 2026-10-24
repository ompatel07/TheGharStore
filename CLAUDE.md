@AGENTS.md
# The Ghar Store — Project Rules

## Stack
- Hydrogen 2026-10 (library) on the React Router starter, TypeScript strict, Tailwind CSS
- Hosting: Shopify Oxygen. Every push to main deploys to production, so work on feature branches and merge only after checks pass.
- Follow the Hydrogen skills bundled in this repo for cart, variants, filters, search, Markets, analytics, consent and customer accounts. They override anything you remember about older Hydrogen.
- Use Shopify Dev MCP to verify every API field. Never guess.

## Brand tokens
Define once as CSS variables + Tailwind theme. Never hardcode hex values in components.
- cream #FFF8EF: page background
- burgundy #762F3D: primary brand, active states, key accents
- peach #E9A18C: soft fills, chips, hover backgrounds
- chocolate #382C2A: text, headings, dark bars
- gold #C9A76A: thin dividers, fine line motifs, small accents only
- terracotta: CTA accent. Sample the exact hex from "Store" in the logo and confirm with me.
WCAG AA contrast for every text/background pair. Peach and gold are never text colors on cream.

## Logo
public/brand/ghar-store-logo.png, used as-is. Never recreate, redraw, recolor, crop, or convert it.
Tagline: SMART FINDS. BETTER HOMES.

## Creative direction: this must NOT look like a template
Mood reference: design-reference/hero-sample.png. Warm, sunlit, lived-in Indian home. Match the feel, never pixel-copy.
The bar: someone opens the site and thinks "this is a real brand", not "this is a Shopify store".
- Typography: bold geometric sans headings matching the logo wordmark; clean readable body sans; one handwritten accent font for tiny callouts only. Max 3 families.
- Signature visual language: soft curved section edges, rounded cards with warm shadows, circular icon chips, fine gold line motifs inspired by Indian geometric patterns (subtle, never busy), generous whitespace, real photography feel.
- Signature moments (build these with care):
  1. Hero: headline reveals word by word; product image with soft parallax and a gentle float; interactive drag before/after slider when images exist.
  2. Category strip: icons with a small playful hover/tap animation.
  3. Product cards: hover lift, slow image zoom, second image crossfade on hover.
  4. Add to cart: a satisfying moment, e.g. a product thumbnail flying to the cart icon, the cart icon bouncing, the count ticking up.
  5. Cart drawer: spring-in, line items animate in and out smoothly.
  6. Scroll: sections reveal softly as they enter view; one scroll-driven storytelling section on the homepage for the featured product.
  7. Festive mode: optional seasonal accents (e.g. warm diya glow, subtle festive pattern) switched on and off from a Shopify metaobject, never hardcoded.
  8. Loading: skeletons in cream with a soft shimmer, never spinners on content.
- Avoid: generic template layouts, heavy gradients, clutter, giant promo banners, loud SALE styling, emoji in UI, stock-looking icons.

## Motion rules
- Motion (Framer Motion) for UI transitions; GSAP + ScrollTrigger only for signature scroll moments; Lenis optional. Ask before adding 3D.
- Animation code is client-only; never break server rendering or hydration.
- Lazy-load heavy effects per route; nothing heavy in the main bundle.
- Animate only transform and opacity. No layout shift. Nothing delays the hero image (LCP).
- prefers-reduced-motion: every effect has a static fallback.
- Must stay smooth on a mid-range Android phone; Lighthouse mobile ≥ 90 for performance, accessibility and SEO.

## Trust & honesty (non-negotiable)
- Never invent products, prices, stock, reviews, ratings, review counts, discounts, delivery dates or performance claims.
- No dark patterns: no fake countdown timers, fake "X people viewing", fake low-stock warnings, pre-ticked add-ons, hidden charges, or confirm-shaming.
- Store-wide promises (free shipping threshold, COD, returns window, festive offers) render only from Shopify metaobjects or shop policies. Empty entry means the element hides.
- Reviews: show none until a real reviews app is connected. No placeholder stars.
- Payment icons only for methods actually enabled at checkout.
- Before/after images only from product metafields.
- Never render supplier names, supplier SKUs, or foreign marketplace text; flag them to me.
- Mock data only in tests, clearly labeled.

## India specifics
- INR via Shopify money formatting, en-IN grouping (₹1,299 / ₹1,29,999)
- @inContext(country: IN, language: EN) on queries
- Product legal declarations displayed from metafields: country of origin, manufacturer/importer/marketer name and address, MRP (inclusive of all taxes), net quantity, dimensions, consumer care contact. Missing ones are flagged to me, never guessed.
- Seller details, contact and grievance contact visible in the footer and on the contact page, from Shopify content.
- Mobile-first at 360px.

## Engineering rules
- Inspect before editing. Small, reviewable changes. Commit per milestone on a feature branch.
- Components in app/components, primitives in app/components/ui
- Every data view has loading, empty and error states. Every route has meta tags; products get Product JSON-LD from real data only.
- Accessibility: semantic HTML, keyboard-operable menus and drawer with focus trap, visible focus, alt text from Shopify (fallback: product title).
- Secrets only in .env (gitignored). Never print, log or commit tokens. The Admin API token is never used in storefront code; only in local scripts.
- After each feature, run typecheck, lint and build. Don't move on with errors.
- Anything needing Shopify Admin setup goes into docs/ADMIN-SETUP.md with exact steps.
- Ask before adding any dependency.