# The Ghar Store: v1 build plan

Status: **draft, waiting for approval**. Nothing in `app/` has been changed yet.

Sources this plan is based on (checked 2026-10-24):
- `CLAUDE.md` and `design-reference/hero-sample.png`
- the current template code
- the bundled Hydrogen skills
- live Storefront API data from `5keefc-ex.myshopify.com`

---

## 1. What the store has today (real data)

| Area | Finding | Impact |
|---|---|---|
| Store name | "My Store". No description, no brand logo set in Shopify | Logo comes from `public/brand/`. The name must be changed in admin |
| Products | 21 published. All single-variant. Options are placeholders (`color[1] size[1]` or `Title`) | The variant picker is hidden when no option has 2+ values |
| Vendors / SKUs | Vendors are numeric supplier IDs (`18279`, `34774`…) or `Shipeaso`. SKUs are `DS1xxxxx` | **Never rendered** (CLAUDE.md supplier rule) |
| Product types | Supplier taxonomy, often wrong ("Crack Filler" → "Decorative Pebbles & Vase Fillers") | Not rendered. Not used for filters |
| ₹0 products | `7-color-changing-led-outdoor-projector-lamp` and `14-led-rain-drop-fairy-lights-…` are **₹0, no images, no collection, available for sale**, tagged `best_seller,new_arrival` | Admin must fix or unpublish. The code also hides any product priced ₹0 from listings, as a safety net |
| Compare-at prices | None set on any product | No strike-through prices appear until set (correct behaviour) |
| Descriptions | Most are 24–50 characters. A few are longer | PDP accordions hide when empty. Content work is listed in ADMIN-SETUP |
| Images | Mostly supplier composites, 522px wide | Too small for hero or zoom. See the featured product below |
| Collections | `diwali-specials`, `ghar-jugaad`, `rasoi-saathi`, `ghar-sajavat`, `paudha-pantry`. **No collection images** | Missing ones listed in ADMIN-SETUP. Cards fall back to the first product image |
| Main menu | Shopify default: Home, Catalog, Contact | Must be rebuilt in admin (ADMIN-SETUP §3) |
| Pages | Only `contact`, with an empty body | About page must be created |
| Policies | Only Privacy (15.7k chars). **Refund, Shipping and Terms are empty** | Must be written in admin. Those routes 404 until they exist |
| Payment settings (API) | `acceptedCardBrands` and `supportedDigitalWallets` are both empty | Payment icons stay hidden (correct per CLAUDE.md) |
| Metaobjects / metafields | None found | Everything in §6 is new |
| Inventory | The public token has no inventory scope | Fine: we show only In stock / Sold out (`availableForSale`) |
| Country | `IN` / `INR` only | Template config says `US`. M1 switches to `IN` |

### Featured product: real data

`wall-repair-roller-paint-white-wall-repair-painting-solution-d7foign37jks73d5755g`

- **Title:** "Wall Repair Roller Paint -White Wall Repair Painting Solution"
  - Your brief calls it "Roller Brush for DIY Wall Repair". The title is controlled in Shopify.
- **Price:** ₹649.00 INR. No compare-at price, no MRP metafield.
- **Stock and variants:** available for sale. 1 variant ("Default Title"). Supplier SKU `DS105922`. Vendor `34774`.
- **Collections:** `diwali-specials` only. It is **not** in Ghar Jugaad (DIY).
- **Description:** 1 paragraph, starting "MULTIFUNCTIONAL PAINT ROLLER: Combines paint application and crack repair in one tool… Small Roller Wall Patching Brush… 2-in-1 paint roller…". The ALL-CAPS opener and the "professional best results" phrasing are supplier copy.
- **Media:** 6 images, 522px, all with empty alt text. No video.
  1. Clean product shot plus a hand-on-wall inset. **Usable.**
  2. 4-step how-to infographic in green and white, with machine-translated text ("superimpose smear").
  3. Parts infographic ("Large caliber and large capacity").
  4. 360° roller infographic.
  5. Spec diagram: 21 × 10.5 × 8.5 cm, 500 g. Has a headline "Strong Cover A Brush Is White" and claims "Antibacterial and mildew proof" and "Resistant to water and moisture".
  6. Supplier before/after collage with green branding.
- **SEO:** title and description are empty.
- **Recommendations:** Shopify returns 10 related products. Works.

**Flags (supplier / foreign-marketplace content):** images 2–6 contain supplier text and unverified performance claims. Per CLAUDE.md these must not be the hero or spotlight imagery. The spotlight therefore needs:
- a clean, higher-resolution cutout (transparent PNG, at least 1200px) for the hero and spotlight
- real before/after photos for the slider
- step copy written by you (in metaobjects, see §6)

Until those exist, the spotlight uses image 1 only and the slider stays hidden.

---

## 2. Architecture

- **Framework:** Hydrogen 2026.10 as a library on React Router 7 (SSR on Oxygen). Request handling stays in `root.tsx` middleware (`handleShopifyRoutes`, cart / predictive-search / customer-account handlers). This is exactly the bundled-skill pattern.
- **Data:** every loader uses the private Storefront client with `@inContext(country: IN, language: EN)`. `storefrontConfig.i18n` and `analyticsConsent` both switch to `IN`.
- **Content model:**
  - Store-wide content and promises come from metaobjects (§6).
  - Product content and legal fields come from product and variant metafields.
  - One root-level `SiteContent` query loads the announcement bar, festive mode, store profile, store promises and menus. It's cached with Hydrogen's cache (`CacheLong` for settings, `CacheShort` for the announcement bar).
- **Styling:**
  - Tailwind v4 `@theme` tokens. Brand values are defined **once** in `app/styles/tokens.css`.
  - The template's semantic tokens (`--color-surface`, `--color-primary`…) are remapped to brand tokens, so template components inherit the brand without hex values in components.
- **Motion:**
  - Core interactions use CSS only (zero JS).
  - `motion` (Framer Motion) is used for add-to-cart and cart line items.
  - `gsap` + ScrollTrigger is dynamically imported only by the homepage spotlight.
  - All animation code is client-only and lazy.
- **Images:** Hydrogen image helper (`hydrogen-image` skill) with responsive `srcset`. The hero image is `fetchpriority="high"`, never lazy, and never animated before load.
- **Fonts:** self-hosted WOFF2 in `public/fonts/` (latin subset). Two weights are preloaded, with `font-display: swap` plus metric-matched fallbacks (no CLS).
- **SEO:**
  - Per-route `meta`.
  - Product JSON-LD (real price, availability, images; **no** rating fields).
  - BreadcrumbList on collection and product pages.
  - Organization data built from the store profile.
  - `sitemap.xml` from the Storefront `sitemap` query, plus `robots.txt`.

## 3. Route list

| Route | File | Notes |
|---|---|---|
| `/` | `routes/home.tsx` | Hero, category strip, collection rows, spotlight, trust, newsletter |
| `/collections` | `routes/collections.tsx` | Collection grid |
| `/collections/:handle` | `routes/collection.tsx` | Filters, sort, pagination, empty state. `all` maps to the "All Products" collection (ADMIN-SETUP) |
| `/products/:handle` | `routes/product.tsx` | Full PDP spec |
| `/search` | `routes/search.tsx` | Results with filters, sort, empty state |
| `/cart` | `routes/cart.tsx` | Full-page cart (no-JS fallback for the drawer) |
| `/pages/:handle` | **new** `routes/page.tsx` | Shopify pages. `about` gets a brand layout, `contact` gets the contact module |
| `/policies` | **new** `routes/policies.tsx` | Index of published policies only |
| `/policies/:handle` | **new** `routes/policy.tsx` | Privacy / Refund / Shipping / Terms from `shop.*Policy` |
| `/account` | `routes/account.tsx` | Restyled |
| `/account/orders/:id` | **new** `routes/account.order.tsx` | Order detail (Customer Account API) |
| `/account/login`, `/account/authorize`, `/account/logout` | middleware | Already served by Hydrogen's customer-account handlers. The routes check doesn't see middleware, so these are documented rather than duplicated |
| `/sitemap.xml` | **new** `routes/sitemap.tsx` | Built from the Storefront `sitemap` query |
| `/robots.txt` | **new** `routes/robots.tsx` | Allows all, points to the sitemap, disallows `/cart`, `/account`, `/search?` |
| `*` | `routes/catchall.tsx` | Branded 404 |

**The 7 "missing standard routes":** `shopify hydrogen check routes` is disabled for Hydrogen 2026.10 locally. The CLI's list is 14 routes, and the 7 we lack are:
1. `sitemap.xml`
2. `robots.txt`
3. `pages/:pageHandle`
4. `policies/:policyHandle`
5. `account/login`
6. `account/authorize`
7. `account/orders/:orderId`

Items 1–4 and 7 get new routes. Items 5 and 6 already work through middleware.

## 4. Component tree

```
root.tsx
├─ SiteContentProvider          (announcement, promises, store profile, festive, menus)
├─ FestiveLayer                 (renders nothing unless festive_mode is active)
├─ AnnouncementBar              (metaobject entries; rotates on mobile, inline on desktop)
├─ Header
│  ├─ Logo                      (public/brand/ghar-store-logo.png, as-is)
│  ├─ PredictiveSearch          (combobox; desktop inline, mobile → SearchDrawer)
│  ├─ PrimaryNav                (main-menu; desktop pills, active = burgundy on peach-soft)
│  ├─ AccountLink
│  └─ CartButton                (animated count, bounce target for fly-to-cart)
├─ MobileNav                    (dialog drawer, focus trap, main-menu with nested items)
├─ <Outlet/>
├─ Footer
│  ├─ FooterCollections · FooterPolicies · FooterContact
│  ├─ SellerDetails · GrievanceOfficer       (store_profile; hidden if empty)
│  └─ Tagline + GoldMotifDivider
├─ CartDrawer                   (dialog; CartLines, DiscountForm, FreeShippingProgress, CartSummary)
├─ SearchDrawer
└─ FlyToCartLayer               (client-only portal)

components/ui/   Button · IconButton · Chip · IconChip · Card · Price (+MRP) · StockStatus ·
                 Accordion · Drawer · Skeleton · Breadcrumbs · LoadMore · TextField ·
                 QuantityStepper · GoldDivider · CurvedEdge · Reveal · BeforeAfterSlider · Icon (brand set)
components/home/ HomeHero · CategoryStrip · CollectionRow · ProductSpotlight (+ SpotlightScroller, lazy GSAP) ·
                 TrustSection · NewsletterSignup
components/product/ ProductGallery (swipe, zoom, video) · ProductHeader · VariantPicker · BuyBox ·
                 StickyBuyBar · TrustRow · ProductDetails (accordions) · SpecTable · HowToSteps ·
                 LegalDeclarations · NeedHelp · RelatedProducts · ProductJsonLd
components/collection/ (restyle of the existing CollectionBrowse: FacetForm, FilterDrawer, Toolbar, chips)
components/cart/ CartLine · DiscountForm · FreeShippingProgress · CartSummary · CartEmpty
```

## 5. Design system

### Colour tokens (CSS variables + Tailwind theme, defined once)

| Token | Hex | Use | Contrast checked |
|---|---|---|---|
| `cream` | #FFF8EF | Page background | — |
| `cream-deep` | #F6E9DA | Alternate sections, cards on cream | chocolate 11.3:1 |
| `chocolate` | #382C2A | Text, headings, dark bars | 12.8:1 on cream |
| `chocolate-muted` | #6B5853 | Secondary text | 6.3:1 on cream |
| `burgundy` | #762F3D | Brand, active states, links, accents | 8.9:1 on cream, white on it 9.4:1 |
| `burgundy-deep` | #5E2431 | Burgundy hover | white on it 11.9:1 |
| `peach` | #E9A18C | Soft fills, chips, hover backgrounds (**never text**) | chocolate on it 6.4:1 |
| `peach-soft` | #FBE5DB | Chip / pill backgrounds | chocolate 11.1:1, burgundy 7.7:1 |
| `gold` | #C9A76A | Hairlines, motifs, tiny accents (**never text** on cream) | decorative only |
| `terracotta` | **#EF7756** (sampled from "Store" in the logo) | Decorative only: brush swashes, icon fills, illustration | white on it 2.8:1 and on cream 2.7:1, **fails** as text or button |
| `terracotta-deep` | **#C04E30** (proposed) | CTA background, accent headline words, e.g. "in Minutes" | white on it 4.8:1, as text on cream 4.6:1 |
| `terracotta-deeper` | #A8432A | CTA hover | white on it 6.0:1 |
| `success` | #2E6B3F | "In stock" | 6.1:1 on cream |
| `critical` | #A3301F | Errors, "Sold out" | 6.6:1 on cream |

Warm shadows use chocolate at low alpha, e.g. `0 12px 32px -12px rgb(56 44 42 / 0.18)`.

Radii: `sm` 10px, `md` 16px, `lg` 24px, `xl` 32px, `pill`.

Section edges: an SVG `CurvedEdge` component (a soft arc, like the reference's header and category strip).

### Typography (3 families, all SIL OFL, self-hosted)

| Role | Font | Why |
|---|---|---|
| Headings | **Outfit** (600 / 700 / 800) | Geometric sans with single-storey "a" and round "G", the closest match to the logo's "Ghar" wordmark |
| Body | **DM Sans** (400 / 500 / 700) | Low-contrast geometric, very legible at 14–16px on small Android screens |
| Handwritten accent | **Kalam** (400 / 700) | Indian Type Foundry design (Latin + Devanagari). For tiny callouts only, like the reference's "Same Wall, New Look!" |

Type scale is fluid (`clamp`):
- display: 40 → 72px
- h1: 32 → 52px
- h2: 26 → 40px
- h3: 20 → 26px
- body: 16px
- small: 14px
- micro: 12px, used only for labels in all caps with tracking

### Signature visual language

- Soft curved section edges.
- Rounded cards with warm shadows.
- Circular icon chips: peach-soft disc with chocolate or terracotta-deep line icon.
- Gold hairline motifs: a small SVG "jaali" / rangoli-dot border used as dividers. Thin, at most 1 per section.
- Generous whitespace.

### Icons

A **custom brand icon set** drawn in-house: 2px rounded line, slightly hand-made, with optional terracotta fill accent. It covers categories (roller, sofa/vase, kadhai/utensils, broom/spray, plant, bulb/diya, gift, grid) and UI (search, user, cart, heart, truck, shield, refund, COD, phone, WhatsApp, mail, chevrons). No icon packages, no stock look.

## 6. Motion plan

| # | Moment | How it's built | Reduced-motion fallback |
|---|---|---|---|
| 1a | Hero headline reveals word by word | **CSS** keyframes on server-rendered word spans (opacity + translateY, 60ms stagger). Text is in the HTML at first paint; animation starts from a visible state on no-JS | Words render static |
| 1b | Hero image soft parallax + float | **CSS** float keyframe (translateY ±6px, 6s). Pointer/scroll parallax with **motion** `useScroll`, lazy-loaded after hydration. The image itself is never hidden or delayed (LCP) | Static image |
| 1c | Before/after drag slider | Custom component (pointer + keyboard, `role="slider"`, arrow keys). Uses CSS `clip-path` on transform-only layers. Rendered only if both metafield images exist | Still fully usable; no intro sweep animation |
| 2 | Category strip icon play | **CSS** per-icon micro-animations on hover/focus/tap (hammer tap, bulb glow via opacity, plant sway). Transform/opacity only | Colour change only |
| 3 | Product card lift, slow zoom, 2nd-image crossfade | **CSS** transitions (translateY −4px, image scale 1.06 over 900ms, opacity crossfade to media[1]). Second image loads lazily | No lift/zoom; second image not shown |
| 4 | Add to cart: thumbnail flies to cart, icon bounces, count ticks up | **motion**: a portal clone animates `transform` from button rect to cart icon rect along a slight arc; spring scale bounce on the icon; `AnimatePresence` digit roll. Lazy chunk loaded on first PDP/card interaction | No flight; count updates instantly, `aria-live` announces "Added to cart", drawer opens |
| 5 | Cart drawer spring-in, lines animate in/out | Native `<dialog>` + CSS `@starting-style` with a spring-like curve. Line items use **motion** `AnimatePresence` + `layout` (transform-based FLIP) | Instant open/close, no line animation |
| 6a | Sections reveal softly in view | Tiny `Reveal` hook (IntersectionObserver + CSS class), no library. Never applied to above-the-fold content | Content visible immediately |
| 6b | Homepage scroll story for the featured product | **GSAP + ScrollTrigger**, dynamically imported only when the section nears the viewport. Desktop (≥1024px): image pinned while 3–4 how-to steps scroll; step progress fills a gold line; ends on the before/after slider if it exists. Mobile: no pinning, steps stack with `Reveal` | Static stacked steps; no pin, no scrub |
| 7 | Festive mode | **CSS** only. Warm diya glow (radial gradient, opacity pulse), subtle festive dot pattern on the curved edges, festive accent on the announcement bar. Rendered only when `festive_mode` is active and inside its date window | Static glow, no pulse |
| 8 | Loading skeletons | **CSS** cream skeleton blocks with a soft shimmer (`transform` on a pseudo-element). Used for route transitions and the drawer/search panels. No spinners on content | Static cream blocks |

- **Lenis:** not recommended. It adds JS on the main thread and fights native scroll on Android. Skipped unless you want it.
- **3D:** none.

Performance guard:
- `motion` and `gsap` never ship in the entry chunk.
- Each motion moment is a separate lazy chunk.
- Checked with the build manifest at M8.

## 7. Content model: metaobjects and metafields

All definitions get **Storefront access: read**. Metaobjects get the **Active/Draft status** capability, so a Draft entry is invisible on the site.

Rule: **an empty field hides its element**.

### Metaobjects

| Type | Fields (key: type) | Entries |
|---|---|---|
| `announcement` | `text`: single_line_text_field (req) · `link`: link · `icon`: single_line_text_field (choices: truck, sparkle, cod, refund, gift, none) · `starts_at`: date_time · `ends_at`: date_time · `sort`: number_integer | Many |
| `home_hero` | `eyebrow`: single_line_text_field · `headline`: single_line_text_field (req) · `headline_accent`: single_line_text_field (2nd line in terracotta-deep) · `subtext`: multi_line_text_field · `benefits`: list.metaobject_reference → `benefit` · `cta`: link (req) · `product`: product_reference · `image`: file_reference (image; transparent cutout preferred) · `before_image`: file_reference · `after_image`: file_reference · `note`: single_line_text_field (handwritten callout) | 1 (handle `home-hero`) |
| `benefit` | `label`: single_line_text_field (req) · `icon`: single_line_text_field (choices from brand icon set) | Many |
| `home_page` | `category_strip`: list.collection_reference · `featured_collections`: list.collection_reference (one row each) · `spotlight_product`: product_reference · `spotlight_heading`: single_line_text_field · `spotlight_intro`: multi_line_text_field · `newsletter_heading`: single_line_text_field · `newsletter_text`: multi_line_text_field | 1 (handle `home`) |
| `store_profile` | `legal_name`: single_line_text_field · `trade_name`: single_line_text_field · `registered_address`: multi_line_text_field · `gstin`: single_line_text_field · `support_email`: single_line_text_field · `support_phone`: single_line_text_field · `whatsapp_number`: single_line_text_field · `support_hours`: single_line_text_field · `grievance_officer_name`: single_line_text_field · `grievance_officer_designation`: single_line_text_field · `grievance_officer_email`: single_line_text_field · `grievance_officer_phone`: single_line_text_field · `social_links`: list.link | 1 (handle `main`) |
| `store_promises` | `free_shipping_threshold`: money · `cod_available`: boolean · `cod_note`: single_line_text_field · `returns_window_days`: number_integer · `returns_note`: single_line_text_field · `dispatch_note`: single_line_text_field | 1 (handle `main`) |
| `festive_mode` | `enabled`: boolean · `theme`: single_line_text_field (choices: diwali, holi, wedding, generic) · `starts_at`: date_time · `ends_at`: date_time · `label`: single_line_text_field | 1 (handle `main`) |
| `how_to_step` | `title`: single_line_text_field (req) · `body`: multi_line_text_field · `image`: file_reference | Many |
| `faq` | `question`: single_line_text_field (req) · `answer`: multi_line_text_field (req) | Many (reusable across products) |
| `legal_entity` | `role`: single_line_text_field (choices: Manufacturer, Packer, Importer, Marketer) · `name`: single_line_text_field (req) · `address`: multi_line_text_field (req) · `email`: single_line_text_field · `phone`: single_line_text_field | Many (reusable) |

### Product metafields (owner: Product, namespace `custom`)

| Key | Type | Renders |
|---|---|---|
| `highlights` | list.single_line_text_field | Short benefit chips under the title |
| `specifications` | multi_line_text_field (one `Label: Value` per line) | Specifications table |
| `how_to_use` | list.metaobject_reference → `how_to_step` | How to use (steps); also feeds the spotlight |
| `in_the_box` | list.single_line_text_field | What's in the box |
| `care` | multi_line_text_field | Care |
| `shipping_returns` | multi_line_text_field | Product-specific note. Always followed by policy links |
| `faqs` | list.metaobject_reference → `faq` | FAQs (+ FAQPage JSON-LD) |
| `before_image` | file_reference (image) | Before/after slider (needs both) |
| `after_image` | file_reference (image) | Before/after slider |
| `before_after_caption` | single_line_text_field | Slider caption |
| `country_of_origin` | single_line_text_field | Legal declarations |
| `generic_name` | single_line_text_field | Legal declarations ("Common or generic name") |
| `legal_entities` | list.metaobject_reference → `legal_entity` | Manufacturer / Packer / Importer / Marketer name + address |
| `dimensions` | single_line_text_field (e.g. "21 × 10.5 × 8.5 cm") | Legal declarations |
| `consumer_care` | multi_line_text_field | Legal declarations; falls back to store_profile support details |

### Variant metafields (owner: Product variant, namespace `custom`)

| Key | Type | Renders |
|---|---|---|
| `mrp` | money | "MRP ₹x (inclusive of all taxes)", only when present |
| `net_quantity` | single_line_text_field (e.g. "1 unit, 500 g") | Legal declarations |

### Collection metafields (owner: Collection, namespace `custom`)

| Key | Type | Renders |
|---|---|---|
| `icon` | single_line_text_field (choices from brand icon set) | Category strip icon. Falls back to a neutral grid icon |
| `short_label` | single_line_text_field | Short name for the strip, e.g. "Lighting". Falls back to the collection title |

Fields marked "choices" use a validation list so admin shows a dropdown.

Video uses native Shopify product media (no metafield).

Unit price uses Shopify's native unit price.

## 8. Milestones

Each milestone ends with:
1. `npm run typecheck` (plus the Windows-safe GraphQL check)
2. lint and `npm run build`
3. dev server smoke test
4. a written diff at 360px and 1440px
5. a commit on `feature/v1-storefront`
6. **wait for your OK**

Nothing merges to `main` without approval, because `main` deploys to production.

1. **Foundations:** design tokens, fonts, logo, `IN` context, lint setup, brand icon set, `ui/` primitives, layout shell (announcement, header, mobile nav, footer), branded 404 + error boundary, content-model definitions (§7) created in Shopify.
2. **Homepage:** hero, category strip, collection rows, spotlight (static first), trust, newsletter.
3. **Collections:** index + collection page restyle (filters, sort, load-more pagination, empty states), `/collections/all`.
4. **Product page:** full spec, JSON-LD, sticky bar, legal block, accordions, related.
5. **Cart:** drawer + page, discount codes, free-shipping progress, checkout.
6. **Search:** predictive + results page.
7. **Pages and policies:** about, contact, policies, sitemap, robots, account order detail.
8. **Motion polish:** signature moments 1–8, reduced-motion audit.
9. **SEO / performance / a11y:** Lighthouse mobile ≥ 90 ×3, keyboard pass, contrast pass, bundle audit.

## 9. Wishlist options (your decision)

| Option | How | Pros | Cons |
|---|---|---|---|
| **A. Device-only** | localStorage list of product handles, `/wishlist` page queries the Storefront API | Free, no login, ships in a day | Lost when changing device or browser; not visible to you in admin |
| **B. Account-synced (recommended)** | Option A for guests; when signed in, saved to a customer metafield `custom.wishlist` (list.product_reference) through the Customer Account API; guest list merges on login | Free, native data, survives devices, you can see it in admin | Needs customer-account metafield write access set up; login needs the HTTPS flow |
| **C. Wishlist app** (e.g. Swym Wishlist Plus) | App's headless API | Back-in-stock / price-drop emails, analytics | Monthly cost, third-party script weight, another vendor |

My recommendation is **B**, built as A first in M4/M5 with the account sync added in M7. Until you decide, the header shows **no** wishlist icon, unlike the reference.

## 10. Reviews app recommendation (nothing installed)

1. **Judge.me.** Low cost, popular with Indian D2C stores. Writes Shopify's standard `reviews.rating` / `reviews.rating_count` metafields (readable through the Storefront API) and has a headless widget/API. Lightest option.
2. **Okendo.** The most mature Hydrogen integration (official React components), better review UX and UGC. Pricier.

Check each app's current Hydrogen 2026.10 support at install time. Until one is connected: no stars, no review counts, no review JSON-LD.

## 11. Dependencies I'd like to add (CLAUDE.md says ask first)

| Package | Why | Where it loads |
|---|---|---|
| `motion` | Add-to-cart flight, cart line animations, hero parallax | Lazy client chunks only |
| `gsap` (includes ScrollTrigger) | Homepage spotlight scroll story only | Dynamic import on the homepage |
| `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `globals` | CLAUDE.md requires lint; there is no lint script today | Dev only |

Fonts are self-hosted files (no npm package). The gallery swipe, zoom and before/after slider are hand-built (no carousel library).
