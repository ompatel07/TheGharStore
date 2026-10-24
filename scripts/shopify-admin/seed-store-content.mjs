// Seeds store-level content that we can write honestly without your input:
//   - home_hero (featured product copy + benefits), home_page (layout), festive_mode (Diwali window)
//   - collection icons (custom.icon)
//   - sets ₹0 / image-less placeholder products to DRAFT (they are buyable at ₹0 today)
// Store promises, store profile, announcements and policies need YOUR real details — not seeded.
//
//   node scripts/shopify-admin/seed-store-content.mjs          dry run
//   node scripts/shopify-admin/seed-store-content.mjs --apply  write
import { admin, APPLY, check, log } from "./lib.mjs";

const FEATURED = "wall-repair-roller-paint-white-wall-repair-painting-solution-d7foign37jks73d5755g";
const ICONS = {
  "ghar-jugaad": "roller",
  "ghar-sajavat": "vase",
  "rasoi-saathi": "kadhai",
  "ghar-sambhal": "spray",
  "roshan-ghar": "bulb",
  "paudha-pantry": "plant",
  "diwali-specials": "diya",
  all: "grid",
};
const STRIP_ORDER = ["ghar-jugaad", "ghar-sajavat", "rasoi-saathi", "ghar-sambhal", "roshan-ghar", "paudha-pantry", "diwali-specials"];
const ROWS = ["diwali-specials", "ghar-sajavat", "ghar-jugaad"];
const PLACEHOLDERS = [
  "7-color-changing-led-outdoor-projector-lamp",
  "14-led-rain-drop-fairy-lights-waterproof-indoor-outdoor-for-home-decoration",
];

const FIND_PRODUCT = `query($q: String!) { products(first: 1, query: $q) { nodes { id handle status } } }`;
const COLLECTIONS = `query { collections(first: 50) { nodes { id handle title } } }`;
const UPSERT = `mutation($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
  metaobjectUpsert(handle: $handle, metaobject: $metaobject) { metaobject { id } userErrors { field message } }
}`;
const METAFIELDS_SET = `mutation($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) { metafields { key } userErrors { field message } }
}`;
const PRODUCT_UPDATE = `mutation($product: ProductUpdateInput!) {
  productUpdate(product: $product) { product { id status } userErrors { field message } }
}`;

async function upsert(type, handle, fields) {
  log(`${type} ${handle}: ${fields.map((f) => f.key).join(", ")}`);
  if (!APPLY) return `gid://shopify/Metaobject/<${handle}>`;
  const result = await admin(UPSERT, {
    handle: { type, handle },
    metaobject: { fields, capabilities: { publishable: { status: "ACTIVE" } } },
  });
  return check(result.metaobjectUpsert, `${type} ${handle}`).metaobject.id;
}

const featured = (await admin(FIND_PRODUCT, { q: `handle:${FEATURED}` })).products.nodes[0];
const collections = (await admin(COLLECTIONS)).collections.nodes;
const byHandle = Object.fromEntries(collections.map((c) => [c.handle, c]));

// Benefits (factual product features only)
const benefits = [];
for (const [handle, label, icon] of [
  ["roller-paint-in-one", "Paint + roller in one", "roller"],
  ["roller-no-tray", "No tray, no open tin", "sparkle"],
  ["roller-washable", "Washable roller", "check"],
  ["roller-white-walls", "For white walls", "home"],
]) {
  benefits.push(await upsert("benefit", handle, [
    { key: "label", value: label },
    { key: "icon", value: icon },
  ]));
}

await upsert("home_hero", "home-hero", [
  { key: "eyebrow", value: "Diwali home makeover" },
  { key: "headline", value: "Fix wall marks" },
  { key: "headline_accent", value: "the easy way" },
  { key: "subtext", value: "A 2-in-1 roller and paint bottle for scuffs, crayon lines and small patches on white walls." },
  { key: "benefits", value: JSON.stringify(benefits) },
  { key: "cta", value: JSON.stringify({ text: "Shop now", url: `/products/${FEATURED}` }) },
  ...(featured ? [{ key: "product", value: featured.id }] : []),
  { key: "note", value: "Same wall, fresh look!" },
]);

await upsert("home_page", "home", [
  { key: "category_strip", value: JSON.stringify(STRIP_ORDER.filter((h) => byHandle[h]).map((h) => byHandle[h].id)) },
  { key: "featured_collections", value: JSON.stringify(ROWS.filter((h) => byHandle[h]).map((h) => byHandle[h].id)) },
  ...(featured ? [{ key: "spotlight_product", value: featured.id }] : []),
  { key: "spotlight_heading", value: "Small marks, quick fix" },
  { key: "spotlight_intro", value: "No painter, no tray, no open tin. Here’s how the touch-up roller works." },
]);

// Diwali 2026 falls on 8 November; glow on through Bhai Dooj.
await upsert("festive_mode", "main", [
  { key: "enabled", value: "true" },
  { key: "theme", value: "diwali" },
  { key: "starts_at", value: "2026-10-20T00:00:00+05:30" },
  { key: "ends_at", value: "2026-11-12T23:59:59+05:30" },
  { key: "label", value: "Diwali" },
]);

// Collection icons
const iconFields = Object.entries(ICONS)
  .filter(([handle]) => byHandle[handle])
  .map(([handle, icon]) => ({ ownerId: byHandle[handle].id, namespace: "custom", key: "icon", type: "single_line_text_field", value: icon }));
log(`collection icons: ${iconFields.length}`);
if (APPLY && iconFields.length) check((await admin(METAFIELDS_SET, { metafields: iconFields })).metafieldsSet, "icons");

// ₹0 placeholders → DRAFT
for (const handle of PLACEHOLDERS) {
  const product = (await admin(FIND_PRODUCT, { q: `handle:${handle}` })).products.nodes[0];
  if (!product || product.status === "DRAFT") continue;
  log(`product ${handle}: ${product.status} → DRAFT (₹0, no images)`);
  if (APPLY) check((await admin(PRODUCT_UPDATE, { product: { id: product.id, status: "DRAFT" } })).productUpdate, handle);
}

log(APPLY ? "Done." : "Dry run complete. Re-run with --apply to write.");
