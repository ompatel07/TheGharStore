// Shared Admin API helper for local scripts only — never imported by storefront code.
//
// Auth (from .env, never printed):
//   SHOPIFY_ADMIN_TOKEN                          an Admin API access token, or
//   SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET    a Dev Dashboard app (client credentials grant)
// Store: PUBLIC_STORE_DOMAIN (already in .env).
import { readFileSync } from "node:fs";

export const API_VERSION = "2026-10";

function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !env[match[1]]) env[match[1]] = match[2].replace(/^"|"$/g, "");
    }
  } catch {
    // no .env
  }
  return env;
}

const env = loadEnv();
export const SHOP = env.PUBLIC_STORE_DOMAIN;
let cachedToken = env.SHOPIFY_ADMIN_TOKEN || null;

async function getToken() {
  if (cachedToken) return cachedToken;
  if (!env.SHOPIFY_CLIENT_ID || !env.SHOPIFY_CLIENT_SECRET) {
    throw new Error(
      "No Admin API credentials. Add SHOPIFY_ADMIN_TOKEN, or SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET, to .env (see docs/ADMIN-SETUP.md).",
    );
  }
  const response = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
    }),
  });
  if (!response.ok) throw new Error(`Token request failed (${response.status}): ${await response.text()}`);
  cachedToken = (await response.json()).access_token;
  return cachedToken;
}

export async function admin(query, variables = {}) {
  const token = await getToken();
  const response = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors, null, 2));
  return json.data;
}

/** Throws when a mutation payload has userErrors. */
export function check(payload, label) {
  const errors = payload?.userErrors ?? [];
  if (errors.length) throw new Error(`${label}: ${errors.map((e) => `${e.field?.join(".") ?? ""} ${e.message}`).join("; ")}`);
  return payload;
}

export const APPLY = process.argv.includes("--apply");

export function log(...args) {
  console.log(APPLY ? "[apply]" : "[dry-run]", ...args);
}
