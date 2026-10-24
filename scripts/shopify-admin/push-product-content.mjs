// Writes content/product-content.json to Shopify (titles, descriptions, SEO,
// metafields, how-to + FAQ metaobjects, image alt text).
//
//   node scripts/shopify-admin/push-product-content.mjs            dry run: prints every change
//   node scripts/shopify-admin/push-product-content.mjs --apply    backs up current values, then writes
//   ... --only <handle>                                            limit to one product
//
// Honesty rules applied here (CLAUDE.md):
//   - spec rows marked "check" are NOT published
//   - FAQ answers that say we're still confirming are NOT published
//   - legal fields are published only when not marked "check" (dimensions only when verified)
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

import { admin, APPLY, check, log } from "./lib.mjs";

const data = JSON.parse(readFileSync("content/product-content.json", "utf8"));
const onlyIndex = process.argv.indexOf("--only");
const only = onlyIndex > -1 ? process.argv[onlyIndex + 1] : null;

const FIND = `query($q: String!) {
  products(first: 1, query: $q) {
    nodes {
      id handle title descriptionHtml status
      seo { title description }
      variants(first: 10) { nodes { id } }
      media(first: 30) { nodes { id alt mediaContentType } }
      metafields(first: 50, namespace: "custom") { nodes { key type value } }
    }
  }
}`;
const PRODUCT_UPDATE = `mutation($product: ProductUpdateInput!) {
  productUpdate(product: $product) { product { id } userErrors { field message } }
}`;
const METAFIELDS_SET = `mutation($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) { metafields { key } userErrors { field message } }
}`;
const METAOBJECT_UPSERT = `mutation($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
  metaobjectUpsert(handle: $handle, metaobject: $metaobject) { metaobject { id } userErrors { field message } }
}`;
const FILE_UPDATE = `mutation($files: [FileUpdateInput!]!) {
  fileUpdate(files: $files) { files { id } userErrors { field message } }
}`;

const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Stable, unique, readable metaobject handle prefix per product.
const short = (handle) =>
  `${handle.split("-").slice(0, 4).join("-")}-${createHash("sha1").update(handle).digest("hex").slice(0, 6)}`;
const isPending = (text) => /confirm|to be confirmed|we’ll update|we'll update/i.test(text);

function plan(p) {
  const descriptionHtml = p.description.map((para) => `<p>${escapeHtml(para)}</p>`).join("\n");
  const specs = p.specifications
    .filter(([, value, status]) => status !== "check" && !isPending(value))
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
  const care = [p.care, p.safety ? `Safety: ${p.safety}` : null].filter(Boolean).join("\n\n");
  const faqs = p.faqs.filter(([, answer]) => !isPending(answer));
  const legal = {};
  for (const [key, field] of Object.entries(p.legal)) {
    const [value, status] = Array.isArray(field) ? field : [field, "verified"];
    if (!value) continue;
    if (key === "genericName") legal.generic_name = value;
    if (key === "netQuantity" && status !== "check") legal.net_quantity = value;
    if (key === "countryOfOrigin" && status === "verified") legal.country_of_origin = value;
    if (key === "dimensions" && status === "verified") legal.dimensions = value;
  }
  return { descriptionHtml, specs, care, faqs, legal };
}

const backups = {};
let changes = 0;

for (const p of data.products) {
  if (only && p.handle !== only) continue;
  const { products } = await admin(FIND, { q: `handle:${p.handle}` });
  const current = products.nodes[0];
  if (!current) {
    log(`SKIP ${p.handle}: not found`);
    continue;
  }
  backups[p.handle] = current;
  const next = plan(p);
  console.log(`\n=== ${p.title}`);

  // 1. Title, description, SEO
  const productInput = { id: current.id };
  if (current.title !== p.title) productInput.title = p.title;
  if (current.descriptionHtml.trim() !== next.descriptionHtml) productInput.descriptionHtml = next.descriptionHtml;
  if (current.seo.title !== p.seoTitle || current.seo.description !== p.seoDescription) {
    productInput.seo = { title: p.seoTitle, description: p.seoDescription };
  }
  if (Object.keys(productInput).length > 1) {
    changes += 1;
    log(`product: ${Object.keys(productInput).filter((k) => k !== "id").join(", ")}`);
    if (productInput.title) log(`  title: "${current.title}" → "${p.title}"`);
    if (APPLY) check((await admin(PRODUCT_UPDATE, { product: productInput })).productUpdate, "productUpdate");
  }

  // 2. How-to steps + FAQs as metaobjects
  const stepIds = [];
  for (const [index, [title, body]] of p.howToUse.entries()) {
    const handle = `${short(p.handle)}-step-${index + 1}`;
    log(`how_to_step ${handle}: ${title}`);
    if (APPLY) {
      const result = await admin(METAOBJECT_UPSERT, {
        handle: { type: "how_to_step", handle },
        metaobject: {
          fields: [
            { key: "title", value: title },
            { key: "body", value: body },
          ],
          capabilities: { publishable: { status: "ACTIVE" } },
        },
      });
      stepIds.push(check(result.metaobjectUpsert, handle).metaobject.id);
    }
  }
  const faqIds = [];
  for (const [index, [question, answer]] of next.faqs.entries()) {
    const handle = `${short(p.handle)}-faq-${index + 1}`;
    log(`faq ${handle}: ${question}`);
    if (APPLY) {
      const result = await admin(METAOBJECT_UPSERT, {
        handle: { type: "faq", handle },
        metaobject: {
          fields: [
            { key: "question", value: question },
            { key: "answer", value: answer },
          ],
          capabilities: { publishable: { status: "ACTIVE" } },
        },
      });
      faqIds.push(check(result.metaobjectUpsert, handle).metaobject.id);
    }
  }

  // 3. Product + variant metafields
  const metafields = [
    ["highlights", "list.single_line_text_field", p.highlights?.length ? JSON.stringify(p.highlights) : null],
    ["specifications", "multi_line_text_field", next.specs || null],
    ["in_the_box", "list.single_line_text_field", p.inTheBox.length ? JSON.stringify(p.inTheBox) : null],
    ["care", "multi_line_text_field", next.care || null],
    ["generic_name", "single_line_text_field", next.legal.generic_name ?? null],
    ["country_of_origin", "single_line_text_field", next.legal.country_of_origin ?? null],
    ["dimensions", "single_line_text_field", next.legal.dimensions ?? null],
    ["how_to_use", "list.metaobject_reference", APPLY && stepIds.length ? JSON.stringify(stepIds) : null],
    ["faqs", "list.metaobject_reference", APPLY && faqIds.length ? JSON.stringify(faqIds) : null],
  ]
    .filter(([, , value]) => value)
    .map(([key, type, value]) => ({ ownerId: current.id, namespace: "custom", key, type, value }));
  if (next.legal.net_quantity) {
    for (const variant of current.variants.nodes) {
      metafields.push({
        ownerId: variant.id,
        namespace: "custom",
        key: "net_quantity",
        type: "single_line_text_field",
        value: next.legal.net_quantity,
      });
    }
  }
  log(`metafields: ${metafields.map((m) => m.key).join(", ") || "(none)"}${APPLY ? "" : " + how_to_use/faqs references"}`);
  if (metafields.length) changes += 1;
  if (APPLY && metafields.length) {
    for (let i = 0; i < metafields.length; i += 25) {
      check((await admin(METAFIELDS_SET, { metafields: metafields.slice(i, i + 25) })).metafieldsSet, "metafieldsSet");
    }
  }

  // 4. Image alt text (only where empty or different)
  const images = current.media.nodes.filter((media) => media.mediaContentType === "IMAGE");
  const altUpdates = images
    .map((media, index) => ({ id: media.id, alt: p.imageAlts[index], old: media.alt }))
    .filter((update) => update.alt && update.alt !== update.old)
    .map(({ id, alt }) => ({ id, alt }));
  if (altUpdates.length) {
    changes += 1;
    log(`image alt text: ${altUpdates.length} image(s)`);
    if (APPLY) check((await admin(FILE_UPDATE, { files: altUpdates })).fileUpdate, "fileUpdate");
  }
}

if (APPLY) {
  mkdirSync("content/backups", { recursive: true });
  const file = `content/backups/products-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify(backups, null, 2));
  console.log(`\nBackup of previous values: ${file}`);
}
console.log(`\n${APPLY ? "Applied" : "Planned"} ${changes} change group(s).${APPLY ? "" : " Re-run with --apply to write."}`);
