# Shopify Admin setup checklist

Everything the storefront needs from Shopify Admin, in order of priority.

- Each item says **where** to go and **what** to do.
- "Hides until set" means the site still works; that element just doesn't appear.
- The admin URL is `https://admin.shopify.com/store/5keefc-ex`.

Legend: 🔴 blocks launch · 🟠 needed for the planned design · 🟢 nice to have

---

## 1. Store basics

- [ ] 🔴 **Store name:** Settings → General → Store details → Store name → `The Ghar Store`. Today it's "My Store", which shows in page titles.
- [ ] 🟢 **Store description:** Settings → General → Store details → add a one-line description. It's used as the homepage meta description fallback.
- [ ] 🟢 **Brand:** Settings → Brand (or Sales channels → Hydrogen) → upload the logo and slogan `SMART FINDS. BETTER HOMES.`. The site uses `public/brand/` for the logo itself, but Shopify checkout and emails use this one.
- [ ] 🟠 **Checkout branding:** Settings → Checkout → Customize. Use the cream background, burgundy buttons and the same logo, so checkout feels like the same brand.

## 2. Products: fix before launch

- [ ] 🔴 **₹0 products:** `7 Color Changing LED Outdoor Projector Lamp` and `14 LED Rain Drop Fairy Lights Waterproof Indoor Outdoor For Home Decoration` are **₹0, have no images, and are available for sale**. Products → open each → either set a real price and images, or set Status → Draft. (The site also hides ₹0 products as a safety net, but they're still buyable via direct link and checkout.)
- [ ] 🔴 **Duplicate products:** earlier the homepage showed `7-color-changing-led-outdoor-projector-lamp-1` and `-2` as well. Products → search "projector" → delete or draft the duplicates.
- [ ] 🟠 **Image alt text:** every product image currently has empty alt text. Products → product → click each image → "Add alt text" (describe the photo, e.g. "Wall repair roller with white paint bottle, held in hand"). Until then the site falls back to the product title.
- [ ] 🟠 **Supplier content:** many images carry supplier infographic text and unverified claims, e.g. "Antibacterial and mildew proof" on the wall roller. Replace them with clean photos, or confirm the claims are true and keep them. Product descriptions with ALL-CAPS supplier openers should be rewritten.
- [ ] 🟠 **Descriptions:** most products have 1 line (24–50 characters). Add 2–4 short paragraphs per product. Products → product → Description.
- [ ] 🟠 **SEO:** Products → product → "Search engine listing" → Edit → set a page title and meta description. All are empty today.
- [ ] 🟢 **Compare-at prices:** only set them if the product was genuinely sold at that price. Nothing is shown otherwise.
- [ ] 🟢 **Product titles:** consider shorter, cleaner titles, e.g. "Furniture Lifter -Furniture Lifter Mover Tool Set Heavy Duty…" → "Furniture Lifter & Mover Set". The supplier codes in URLs (`-d7foign37jks73…`) can be cleaned up by editing the URL handle. Shopify creates redirects automatically if you tick the box.

### Featured product: Wall Repair Roller Paint

- [ ] 🟠 **Title:** decide on the title. Today it's "Wall Repair Roller Paint -White Wall Repair Painting Solution"; your brief calls it "Roller Brush for DIY Wall Repair".
- [ ] 🟠 **Collections:** it's only in Diwali Specials. Add it to **Ghar Jugaad** (DIY): Products → product → Product organization → Collections.
- [ ] 🟠 **Hero cutout:** upload a **clean, high-resolution cutout** (transparent PNG, at least 1200 × 1200 px) of the bottle + roller. Content → Files → Upload, then pick it in the `home_hero` entry (§6). The current images are 522px and look soft on large screens.
- [ ] 🟠 **Before/after photos:** upload **real before/after photos** of the same wall, same angle. Set them on the product's `before_image` / `after_image` metafields. The supplier collage can't be used.
- [ ] 🟠 **Legal fields:** fill the legal fields (§5) from the actual packaging. The supplier diagram says 21 × 10.5 × 8.5 cm and 500 g; confirm against your stock.

## 3. Navigation

- [ ] 🔴 **Main menu:** Content → Menus → **Main menu** (handle must stay `main-menu`). Replace Home / Catalog / Contact with your categories, for example:
  - Home → `Home page`
  - Home Improvement → Collection: Ghar Jugaad
  - Home Decor → Collection: Ghar Sajavat
  - Kitchen & Dining → Collection: Rasoi Saathi
  - Home Care → Collection: Ghar Sambhal (create first, §4)
  - Lighting → Collection: Roshan Ghar (create first, §4)
  - Festive Specials → Collection: Diwali Specials
  - All Products → Collection: All Products (§4)
  - Nested items (drag one item under another) become a dropdown and a nested list on mobile.
- [ ] 🟠 **Footer menu:** Content → Menus → **Footer menu** (handle `footer`). Add About us (Page), Contact (Page), Shipping policy, Refund policy, Privacy policy, Terms of service (Policies, available after §7).

## 4. Collections

Checked against your list on 2026-10-24:

| Wanted | Status today | Action |
|---|---|---|
| Ghar Sajavat (Home Decor) | ✅ exists, 7 products, desc "Home Décor & Styling" | Add a collection image |
| Garden Care (name pending) | ⚠️ exists as **Paudha Pantry** (`paudha-pantry`), 1 product, desc "Garden & Plant Care" | Confirm the name; add products + image. Renaming the title is fine; keep the handle unless you also want the URL to change |
| Rasoi Saathi (Kitchen Tools) | ✅ exists, 2 products | Add an image |
| Ghar Sambhal (Home Care Essentials) | ❌ **missing** | Create it |
| Ghar Jugaad (DIY & Home Improvement) | ⚠️ exists, 9 products, but its description says "Home Care & Everyday Essentials", and it holds cleaning items (broom, duster, stain spray, floor wax) next to DIY items (crack filler, screwdriver, hooks) | Change the description to DIY & Home Improvement; move the cleaning items to Ghar Sambhal |
| Roshan Ghar (Lighting) | ❌ **missing** | Create it; add the string lights, LED diyas, projector lamp |
| All Products | ❌ missing (needed for `/collections/all` with filters) | Create an automated collection |

Steps:

- [ ] 🔴 **Create collections:** Products → Collections → Create collection.
  - Ghar Sambhal (manual), handle `ghar-sambhal`
  - Roshan Ghar (manual), handle `roshan-ghar`
  - **All Products**, handle `all`. Type: Automated, condition "Price is greater than 0". This also keeps ₹0 products out.
- [ ] 🟠 **Collection images:** none have images today. Collections → collection → Collection image → upload a warm, lifestyle-style photo (at least 1600px wide, landscape).
- [ ] 🟠 **Sales channel:** make sure every collection is available on the **The Ghar Store** Hydrogen sales channel (collection → Publishing).
- [ ] 🟢 **Collection metafields** `icon` and `short_label` (§5): pick an icon per collection for the homepage category strip.

## 5. Metafield and metaobject definitions

I'll create all definitions in Milestone 1, either through the Shopify connector (you approve each change) or by a local script. You only fill in values. If you prefer to create them by hand: Settings → Custom data → (Products / Variants / Collections / Metaobjects) → Add definition. Use **namespace `custom`**, the exact key and type from `docs/PLAN.md §7`, and turn on **Storefront access**.

Once they exist, fill them from Products → product → Metafields (bottom of the page):

- [ ] 🟠 **Legal declarations** for each product, from the physical packaging:
  - country of origin
  - generic name
  - manufacturer / packer / importer / marketer (name + address)
  - dimensions
  - **variant** MRP and net quantity

  Missing fields are simply not shown, but Indian e-commerce rules expect them, so I'll list products with gaps after M4.
- [ ] 🟠 **Content fields** where you have the content: highlights, specifications, how to use, in the box, care, shipping/returns note, FAQs.

## 6. Metaobject entries (Content → Metaobjects)

Set each entry to **Active**. Draft entries are invisible on the site.

- [ ] 🟠 **`home_hero` (handle `home-hero`):**
  - eyebrow, headline, headline accent, subtext
  - 3–4 benefits
  - CTA link
  - product (Wall Repair Roller)
  - cutout image
  - optional before/after images
  - optional handwritten note
- [ ] 🟠 **`home_page` (handle `home`):** category strip collections (in order), featured collection rows, spotlight product + heading + intro, newsletter text.
- [ ] 🟠 **`announcement`:** one entry per message, e.g. "Free shipping on orders above ₹499" (only if true, see §8), "COD available".
  - Optional start and end dates.
  - Use sort to order them.
- [ ] 🔴 **`store_profile` (handle `main`):**
  - legal business name
  - registered address
  - GSTIN (if registered)
  - support email / phone / WhatsApp / hours
  - **Grievance Officer** name, designation, email, phone

  The Consumer Protection (E-Commerce) Rules, 2020 expect seller and grievance details to be displayed. Confirm the exact wording with your CA or lawyer.
- [ ] 🟠 **`store_promises` (handle `main`):** free-shipping threshold, COD available + note, returns window (days) + note, dispatch note. **Only fill what is actually true at checkout.** Empty fields hide the matching badge, the trust row item and the cart progress bar.
- [ ] 🟢 **`festive_mode` (handle `main`):** enabled, theme `diwali`, start/end dates. Switch it off after the festival.

## 7. Pages and policies

- [ ] 🔴 **Policies:** Settings → Policies → write (or generate, then edit) the **Refund policy**, **Shipping policy** and **Terms of service**. Today only the Privacy policy exists, so `/policies/refund-policy`, `/policies/shipping-policy` and `/policies/terms-of-service` will 404 and the trust row has nothing to link to.
- [ ] 🟠 **Privacy policy:** it currently has no grievance-officer section. Add one.
- [ ] 🟠 **About page:** Content → Pages → Add page → title "About us", handle `about`. Write your brand story (2–5 paragraphs; you can add images in the editor).
- [ ] 🟠 **Contact page:** Content → Pages → Contact. The body is empty today. Add a short intro line. The contact details themselves come from `store_profile`.
- [ ] 🟢 The **News** blog exists but has no posts, and the v1 site doesn't render blogs.

## 8. Shipping, payments, COD

- [ ] 🔴 **Shipping rates:** Settings → Shipping and delivery → set the India rates. If you advertise free shipping above ₹X, add a **free rate with condition "order price ≥ ₹X"** and put the **same X** in `store_promises.free_shipping_threshold`. The site never invents this number.
- [ ] 🔴 **Payments:** Settings → Payments → set up a payment provider for India (e.g. Razorpay, PayU, Cashfree or PhonePe). The API currently reports no card brands or wallets, so **no payment icons** will show.
- [ ] 🟠 **COD:** Settings → Payments → Manual payment methods → **Cash on Delivery (COD)**. Only set `store_promises.cod_available` after this is on.
- [ ] 🟢 **Taxes:** Settings → Taxes and duties → India. Prices are "inclusive of all taxes" only if Shopify is configured with tax-inclusive pricing (the site shows that phrase only next to an MRP metafield).

## 9. Customer accounts

- [ ] 🟠 **New customer accounts:** Settings → Customer accounts → make sure **customer accounts (new)** is selected. The Hydrogen storefront already has the client ID in its environment.
- [ ] 🟠 **Customer Account API URLs:** Sales channels → Hydrogen → The Ghar Store → Storefront settings → Customer Account API → confirm the callback / JavaScript origin / logout URLs include your production domain once you add one.

## 10. Hydrogen channel and domain

- [ ] 🟠 **Preview access:** Hydrogen → The Ghar Store → Storefront settings → Oxygen deployments → "Select who can preview deployment links". Staff-only is fine while building.
- [ ] 🟢 **Production visibility:** Hydrogen → The Ghar Store → Environments → Production → make the production URL public when you're ready to launch (today it may be private).
- [ ] 🟢 **Custom domain:** Hydrogen → The Ghar Store → Storefront settings → Domains, e.g. `theghar.store` (if purchased).

## 11. Let the setup scripts write to Shopify (one-time)

The content model, product content and homepage entries are written by scripts in
`scripts/shopify-admin/`. They need ONE of these:

- [ ] **Option A (easiest):** reconnect the Shopify connector — claude.ai → Settings → Connectors → Shopify → sign in. Claude can then run the same writes for you.
- [ ] **Option B:** create an app at https://dev.shopify.com (Dev Dashboard) in the same organization as the store.
  - Scopes: `write_products`, `write_metaobjects`, `write_metaobject_definitions`, `write_files`.
  - Install it on the store.
  - Put `SHOPIFY_CLIENT_ID=` and `SHOPIFY_CLIENT_SECRET=` in `.env`. Never commit them; `.env` is git-ignored.

Then, in order:

```
node scripts/shopify-admin/define-content-model.mjs          # dry run
node scripts/shopify-admin/define-content-model.mjs --apply
node scripts/shopify-admin/push-product-content.mjs          # dry run — review
node scripts/shopify-admin/push-product-content.mjs --apply   # backs up first
node scripts/shopify-admin/seed-store-content.mjs --apply
```

## 12. Reviews (Judge.me)

- [ ] Install **Judge.me Product Reviews** from the Shopify App Store (free plan is fine).
- [ ] In Judge.me → Settings → Integrations, turn on syncing review data to Shopify product metafields (`reviews.rating`, `reviews.rating_count`).
- [ ] Settings → Custom data → Products → find **Product rating** and **Product rating count** → turn on **Storefront access**.
- [ ] Turn on Judge.me's review-request emails after delivery. Real reviews start arriving with your first orders.

Stars then appear on product cards and pages, and in Google results via structured data, automatically. Nothing shows until a product has a real review.

## 13. Pairs-well-with (more items per order)

- [ ] Install Shopify's free **Search & Discovery** app → Product recommendations.
- [ ] Add complementary products, for example:
  - Wall Repair Roller → Crack Filler, Floor Wiper
  - Water-Sensor Diyas → Floating Lotus Diyas, Rangoli Kit
  - Beeswax Polish → Fan Duster

These appear first in the cart drawer's "Pairs well with" row.

## 14. Images to replace (hurts trust today)

The full list with reasons is in `content/VERIFY-WITH-SUPPLIER.md` and each `content/product-drafts/*.md`. The most urgent:

- [ ] **Fabric Stain Cleaner:** current photos are another company's Spanish-language product (500 ml). Replace them all.
- [ ] **Stainless Steel Hangers:** both images are broken placeholders. Unpublish until fixed.
- [ ] **Water-Sensor Diya Pack of 6:** shows the "Pack of 12" photo. Replace it.
- [ ] **Crack Filler:** Chinese-language packaging.
- [ ] **Roller Paint:** supplier infographics with machine-translated text and unverified claims.
- [ ] Ask your supplier for original product videos. Upload them as product media; the gallery plays them inline, muted and looping.
- [ ] Better still, photograph one sample of each bestseller at home in daylight. That's what makes a store look like a brand.

## 15. Decisions waiting on you

- [ ] Wishlist approach (A / B / C, see PLAN §9)
- [ ] Reviews app (Judge.me or Okendo, see PLAN §10). Install later, no rush.
- [ ] Newsletter provider. The Storefront API's only option (`customerCreate`) needs a password per signup, which isn't suitable for a newsletter. Options: Shopify Email + Customer Account sign-up, Klaviyo, or Mailchimp. The newsletter block stays hidden until one is chosen.
