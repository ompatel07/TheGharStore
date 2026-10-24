// Creates the metaobject + metafield definitions from docs/PLAN.md §7.
// Idempotent: existing definitions are left alone.
//   node scripts/shopify-admin/define-content-model.mjs           (dry run)
//   node scripts/shopify-admin/define-content-model.mjs --apply   (create)
import { admin, APPLY, check, log } from "./lib.mjs";

const ICONS = ["roller", "hammer", "vase", "sofa", "kadhai", "utensils", "spray", "broom", "plant", "bulb", "diya", "box", "gift", "grid", "home", "truck", "sparkle", "cod", "refund", "shield", "check", "rupee", "clock", "heart"];
const choices = (values) => [{ name: "choices", value: JSON.stringify(values) }];

// Order matters: referenced types first.
const METAOBJECTS = [
  { type: "benefit", name: "Benefit", display: "label", fields: [
    { key: "label", name: "Label", type: "single_line_text_field", required: true },
    { key: "icon", name: "Icon", type: "single_line_text_field", validations: choices(ICONS) },
  ] },
  { type: "how_to_step", name: "How-to step", display: "title", fields: [
    { key: "title", name: "Title", type: "single_line_text_field", required: true },
    { key: "body", name: "Body", type: "multi_line_text_field" },
    { key: "image", name: "Image", type: "file_reference", validations: [{ name: "file_type_options", value: JSON.stringify(["Image"]) }] },
  ] },
  { type: "faq", name: "FAQ", display: "question", fields: [
    { key: "question", name: "Question", type: "single_line_text_field", required: true },
    { key: "answer", name: "Answer", type: "multi_line_text_field", required: true },
  ] },
  { type: "legal_entity", name: "Legal entity", display: "name", fields: [
    { key: "role", name: "Role", type: "single_line_text_field", validations: choices(["Manufactured by", "Packed by", "Imported by", "Marketed by"]) },
    { key: "name", name: "Name", type: "single_line_text_field", required: true },
    { key: "address", name: "Address", type: "multi_line_text_field", required: true },
    { key: "email", name: "Email", type: "single_line_text_field" },
    { key: "phone", name: "Phone", type: "single_line_text_field" },
  ] },
  { type: "announcement", name: "Announcement", display: "text", fields: [
    { key: "text", name: "Text", type: "single_line_text_field", required: true },
    { key: "link", name: "Link", type: "link" },
    { key: "icon", name: "Icon", type: "single_line_text_field", validations: choices(["truck", "sparkle", "cod", "refund", "gift", "diya", "none"]) },
    { key: "starts_at", name: "Starts at", type: "date_time" },
    { key: "ends_at", name: "Ends at", type: "date_time" },
    { key: "sort", name: "Sort order", type: "number_integer" },
  ] },
  { type: "store_profile", name: "Store profile", display: "legal_name", fields: [
    { key: "legal_name", name: "Legal business name", type: "single_line_text_field" },
    { key: "trade_name", name: "Trade name", type: "single_line_text_field" },
    { key: "registered_address", name: "Registered address", type: "multi_line_text_field" },
    { key: "gstin", name: "GSTIN", type: "single_line_text_field" },
    { key: "support_email", name: "Support email", type: "single_line_text_field" },
    { key: "support_phone", name: "Support phone", type: "single_line_text_field" },
    { key: "whatsapp_number", name: "WhatsApp number", type: "single_line_text_field" },
    { key: "support_hours", name: "Support hours", type: "single_line_text_field" },
    { key: "grievance_officer_name", name: "Grievance officer name", type: "single_line_text_field" },
    { key: "grievance_officer_designation", name: "Grievance officer designation", type: "single_line_text_field" },
    { key: "grievance_officer_email", name: "Grievance officer email", type: "single_line_text_field" },
    { key: "grievance_officer_phone", name: "Grievance officer phone", type: "single_line_text_field" },
    { key: "social_links", name: "Social links", type: "list.link" },
  ] },
  { type: "store_promises", name: "Store promises", display: "dispatch_note", fields: [
    { key: "free_shipping_threshold", name: "Free shipping threshold", type: "money" },
    { key: "cod_available", name: "COD available", type: "boolean" },
    { key: "cod_note", name: "COD note", type: "single_line_text_field" },
    { key: "returns_window_days", name: "Returns window (days)", type: "number_integer" },
    { key: "returns_note", name: "Returns note", type: "single_line_text_field" },
    { key: "dispatch_note", name: "Dispatch note", type: "single_line_text_field" },
  ] },
  { type: "festive_mode", name: "Festive mode", display: "label", fields: [
    { key: "enabled", name: "Enabled", type: "boolean" },
    { key: "theme", name: "Theme", type: "single_line_text_field", validations: choices(["diwali", "holi", "wedding", "generic"]) },
    { key: "starts_at", name: "Starts at", type: "date_time" },
    { key: "ends_at", name: "Ends at", type: "date_time" },
    { key: "label", name: "Label", type: "single_line_text_field" },
  ] },
  { type: "home_hero", name: "Home hero", display: "headline", fields: [
    { key: "eyebrow", name: "Eyebrow", type: "single_line_text_field" },
    { key: "headline", name: "Headline", type: "single_line_text_field", required: true },
    { key: "headline_accent", name: "Headline accent (2nd line)", type: "single_line_text_field" },
    { key: "subtext", name: "Subtext", type: "multi_line_text_field" },
    { key: "benefits", name: "Benefits", type: "list.metaobject_reference", refType: "benefit" },
    { key: "cta", name: "Button", type: "link" },
    { key: "product", name: "Product", type: "product_reference" },
    { key: "image", name: "Cutout image", type: "file_reference", validations: [{ name: "file_type_options", value: JSON.stringify(["Image"]) }] },
    { key: "before_image", name: "Before image", type: "file_reference", validations: [{ name: "file_type_options", value: JSON.stringify(["Image"]) }] },
    { key: "after_image", name: "After image", type: "file_reference", validations: [{ name: "file_type_options", value: JSON.stringify(["Image"]) }] },
    { key: "note", name: "Handwritten note", type: "single_line_text_field" },
  ] },
  { type: "home_page", name: "Home page", display: "spotlight_heading", fields: [
    { key: "category_strip", name: "Category strip", type: "list.collection_reference" },
    { key: "featured_collections", name: "Featured collection rows", type: "list.collection_reference" },
    { key: "spotlight_product", name: "Spotlight product", type: "product_reference" },
    { key: "spotlight_heading", name: "Spotlight heading", type: "single_line_text_field" },
    { key: "spotlight_intro", name: "Spotlight intro", type: "multi_line_text_field" },
    { key: "newsletter_heading", name: "Newsletter heading", type: "single_line_text_field" },
    { key: "newsletter_text", name: "Newsletter text", type: "multi_line_text_field" },
  ] },
];

const METAFIELDS = [
  // Product
  ["PRODUCT", "highlights", "Highlights", "list.single_line_text_field"],
  ["PRODUCT", "specifications", "Specifications (Label: Value per line)", "multi_line_text_field"],
  ["PRODUCT", "how_to_use", "How to use", "list.metaobject_reference", "how_to_step"],
  ["PRODUCT", "in_the_box", "What's in the box", "list.single_line_text_field"],
  ["PRODUCT", "care", "Care", "multi_line_text_field"],
  ["PRODUCT", "shipping_returns", "Shipping & returns note", "multi_line_text_field"],
  ["PRODUCT", "faqs", "FAQs", "list.metaobject_reference", "faq"],
  ["PRODUCT", "before_image", "Before image", "file_reference"],
  ["PRODUCT", "after_image", "After image", "file_reference"],
  ["PRODUCT", "before_after_caption", "Before/after caption", "single_line_text_field"],
  ["PRODUCT", "country_of_origin", "Country of origin", "single_line_text_field"],
  ["PRODUCT", "generic_name", "Generic name", "single_line_text_field"],
  ["PRODUCT", "legal_entities", "Manufacturer / packer / importer / marketer", "list.metaobject_reference", "legal_entity"],
  ["PRODUCT", "dimensions", "Dimensions", "single_line_text_field"],
  ["PRODUCT", "consumer_care", "Consumer care", "multi_line_text_field"],
  // Variant
  ["PRODUCTVARIANT", "mrp", "MRP (inclusive of all taxes)", "money"],
  ["PRODUCTVARIANT", "net_quantity", "Net quantity", "single_line_text_field"],
  // Collection
  ["COLLECTION", "icon", "Icon", "single_line_text_field", null, choices(ICONS)],
  ["COLLECTION", "short_label", "Short label", "single_line_text_field"],
];

const EXISTING_METAOBJECT = `query($type: String!) { metaobjectDefinitionByType(type: $type) { id type } }`;
const EXISTING_METAFIELDS = `query($ownerType: MetafieldOwnerType!) {
  metafieldDefinitions(first: 100, ownerType: $ownerType, namespace: "custom") { nodes { id key } }
}`;
const CREATE_METAOBJECT = `mutation($definition: MetaobjectDefinitionCreateInput!) {
  metaobjectDefinitionCreate(definition: $definition) { metaobjectDefinition { id type } userErrors { field message } }
}`;
const CREATE_METAFIELD = `mutation($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) { createdDefinition { id key } userErrors { field message } }
}`;

const typeIds = {};

for (const def of METAOBJECTS) {
  const { metaobjectDefinitionByType: existing } = await admin(EXISTING_METAOBJECT, { type: def.type });
  if (existing) {
    typeIds[def.type] = existing.id;
    log(`metaobject ${def.type}: exists`);
    continue;
  }
  const fieldDefinitions = def.fields.map(({ refType, ...field }) => ({
    ...field,
    validations: refType
      ? [{ name: "metaobject_definition_id", value: typeIds[refType] ?? `<${refType}>` }]
      : field.validations,
  }));
  log(`metaobject ${def.type}: create (${def.fields.length} fields)`);
  if (APPLY) {
    const result = await admin(CREATE_METAOBJECT, {
      definition: {
        type: def.type,
        name: def.name,
        displayNameKey: def.display,
        access: { storefront: "PUBLIC_READ" },
        capabilities: { publishable: { enabled: true } },
        fieldDefinitions,
      },
    });
    typeIds[def.type] = check(result.metaobjectDefinitionCreate, def.type).metaobjectDefinition.id;
  }
}

const existingByOwner = {};
for (const [ownerType, key, name, type, refType, validations] of METAFIELDS) {
  existingByOwner[ownerType] ??= (await admin(EXISTING_METAFIELDS, { ownerType })).metafieldDefinitions.nodes.map((n) => n.key);
  if (existingByOwner[ownerType].includes(key)) {
    log(`metafield ${ownerType} custom.${key}: exists`);
    continue;
  }
  log(`metafield ${ownerType} custom.${key}: create (${type})`);
  if (APPLY) {
    const result = await admin(CREATE_METAFIELD, {
      definition: {
        namespace: "custom",
        key,
        name,
        type,
        ownerType,
        access: { storefront: "PUBLIC_READ" },
        validations: refType ? [{ name: "metaobject_definition_id", value: typeIds[refType] }] : validations ?? undefined,
      },
    });
    check(result.metafieldDefinitionCreate, `custom.${key}`);
  }
}

log(APPLY ? "Done." : "Dry run complete. Re-run with --apply to create.");
