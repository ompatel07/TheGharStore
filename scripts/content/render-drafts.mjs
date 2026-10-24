// Renders content/product-content.json into reviewable Markdown drafts and the
// "verify with supplier" list. Usage: node scripts/content/render-drafts.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const data = JSON.parse(readFileSync("content/product-content.json", "utf8"));
mkdirSync("content/product-drafts", { recursive: true });

const statusLabel = { supplier: "from supplier (not independently verified)", check: "NEEDS CHECK against a sample", verified: "verified" };
const verify = [];
const summary = [];

for (const p of data.products) {
  const unconfirmed = [];
  const lines = [];
  lines.push(`# ${p.title}`, "");
  lines.push(`- **Handle:** \`${p.handle}\``);
  lines.push(`- **Current title:** ${p.currentTitle}`);
  lines.push(`- **SEO title:** ${p.seoTitle}`);
  lines.push(`- **SEO description:** ${p.seoDescription} _(${p.seoDescription.length} chars)_`, "");
  lines.push("## Description", "", ...p.description.flatMap((para) => [para, ""]));
  if (p.highlights?.length) lines.push("## Highlights", "", ...p.highlights.map((h) => `- ${h}`), "");
  lines.push("## Specifications", "", "| Spec | Value | Status |", "|---|---|---|");
  for (const [label, value, status] of p.specifications) {
    lines.push(`| ${label} | ${value} | ${statusLabel[status] ?? status} |`);
    if (status === "check") unconfirmed.push(`${label}: ${value}`);
  }
  lines.push("");
  lines.push("## How to use", "", ...p.howToUse.map(([t, b], i) => `${i + 1}. **${t}** — ${b}`), "");
  lines.push("## What’s in the box", "", ...p.inTheBox.map((x) => `- ${x}`), "");
  lines.push("## Care", "", p.care, "");
  if (p.safety) lines.push("## Safety", "", p.safety, "");
  if (p.faqs.length) lines.push("## FAQs", "", ...p.faqs.flatMap(([q, a]) => [`**${q}**`, a, ""]));
  lines.push("## Legal declarations", "");
  for (const [key, label] of [["genericName", "Generic name"], ["netQuantity", "Net quantity"], ["dimensions", "Dimensions"], ["countryOfOrigin", "Country of origin"]]) {
    const field = p.legal[key];
    const [value, status] = Array.isArray(field) ? field : [field, "verified"];
    lines.push(`- **${label}:** ${value ?? "—"} ${value || status === "check" ? `_(${statusLabel[status] ?? status})_` : ""}`);
    if (status === "check") unconfirmed.push(`${label}: ${value ?? "unknown"}`);
  }
  lines.push("- **Manufacturer / packer / importer / marketer:** — _(you provide; never guessed)_", "");
  if (p.imageAlts.length) lines.push("## Image alt text", "", ...p.imageAlts.map((alt, i) => `${i + 1}. ${alt}`), "");
  if (p.flags.length) lines.push("## Flags", "", ...p.flags.map((f) => `- ⚠️ ${f}`), "");
  lines.push("## Sources", "", "- Product data and images from the store (Storefront API, 2026-10-24).", "- Usage and care guidance based on general practice for this product type; no marketplace text was copied.", "");
  writeFileSync(`content/product-drafts/${p.handle}.md`, lines.join("\n"));

  verify.push({ title: p.title, handle: p.handle, items: [...unconfirmed, "Manufacturer / packer / importer / marketer name and address", "Country of origin"] });
  summary.push(`| ${p.title} | ${p.specifications.length} specs, ${p.howToUse.length} steps, ${p.faqs.length} FAQs, ${p.imageAlts.length} alts | ${unconfirmed.length} | ${p.flags.length} |`);
}

const v = ["# Verify with supplier", "", "Facts we could not confirm. Until confirmed they are **not** shown on the site as facts.", ""];
for (const item of verify) {
  v.push(`## ${item.title}`, `\`${item.handle}\``, "", ...[...new Set(item.items)].map((x) => `- [ ] ${x}`), "");
}
v.push("## Not sellable yet", "", ...data.notSellable.map((n) => `- **${n.handle}** — ${n.issue}`), "");
writeFileSync("content/VERIFY-WITH-SUPPLIER.md", v.join("\n"));

writeFileSync(
  "content/SUMMARY.md",
  ["# Product content summary", "", "| Product | Fields filled | Items to verify | Flags |", "|---|---|---|---|", ...summary, ""].join("\n"),
);
console.log(`Rendered ${data.products.length} drafts.`);
