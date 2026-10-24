// Store-wide content for the layout shell: menus, announcements, store profile
// (seller + grievance details), store promises, festive mode and published policies.
// Everything comes from Shopify. An empty or missing entry returns null/[] and the
// matching UI hides — nothing is invented here.

import { Cache, gql, type StorefrontApi } from "@shopify/hydrogen";

import {
  bool,
  fieldMap,
  int,
  isWithinWindow,
  link,
  linkList,
  money,
  text,
  type LinkValue,
  type MoneyValue,
} from "~/lib/metaobject";
import type { RequestStorefrontClient } from "~/lib/storefront";

const MENU_ITEM_FRAGMENT = gql(`
  fragment MenuItemFields on MenuItem {
    id
    title
    url
    type
  }
`);

export const SITE_CONTENT_QUERY = gql(
  `
    query SiteContent($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
      shop {
        primaryDomain {
          host
        }
        privacyPolicy {
          title
          handle
        }
        refundPolicy {
          title
          handle
        }
        shippingPolicy {
          title
          handle
        }
        termsOfService {
          title
          handle
        }
      }
      mainMenu: menu(handle: "main-menu") {
        items {
          ...MenuItemFields
          items {
            ...MenuItemFields
          }
        }
      }
      footerMenu: menu(handle: "footer") {
        items {
          ...MenuItemFields
        }
      }
      collections(first: 12, sortKey: TITLE) {
        nodes {
          handle
          title
        }
      }
      announcements: metaobjects(type: "announcement", first: 10) {
        nodes {
          handle
          fields {
            key
            value
          }
        }
      }
      storeProfile: metaobject(handle: { type: "store_profile", handle: "main" }) {
        fields {
          key
          value
        }
      }
      storePromises: metaobject(handle: { type: "store_promises", handle: "main" }) {
        fields {
          key
          value
        }
      }
      festiveMode: metaobject(handle: { type: "festive_mode", handle: "main" }) {
        fields {
          key
          value
        }
      }
    }
  `,
  [MENU_ITEM_FRAGMENT],
);

type SiteContentQueryResult = StorefrontApi.ResultOf<typeof SITE_CONTENT_QUERY>;

export type NavItem = {
  id: string;
  title: string;
  to: string;
  external: boolean;
  items: NavItem[];
};

export type Announcement = {
  id: string;
  text: string;
  link: LinkValue | null;
  icon: string | null;
};

export type StoreProfile = {
  legalName: string | null;
  tradeName: string | null;
  registeredAddress: string | null;
  gstin: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  whatsappNumber: string | null;
  supportHours: string | null;
  grievanceOfficer: {
    name: string;
    designation: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  socialLinks: LinkValue[];
};

export type StorePromises = {
  freeShippingThreshold: MoneyValue | null;
  codAvailable: boolean;
  codNote: string | null;
  returnsWindowDays: number | null;
  returnsNote: string | null;
  dispatchNote: string | null;
};

export type FestiveMode = {
  theme: string;
  label: string | null;
} | null;

export type PolicyLink = { title: string; handle: string };

export type SiteContent = {
  mainMenu: NavItem[];
  footerMenu: NavItem[];
  collections: { handle: string; title: string }[];
  announcements: Announcement[];
  storeProfile: StoreProfile | null;
  storePromises: StorePromises;
  festiveMode: FestiveMode;
  policies: PolicyLink[];
};

const EMPTY_PROMISES: StorePromises = {
  freeShippingThreshold: null,
  codAvailable: false,
  codNote: null,
  returnsWindowDays: null,
  returnsNote: null,
  dispatchNote: null,
};

/**
 * Menu URLs come back absolute (https://<store>.myshopify.com/collections/x).
 * Internal links become relative paths; anything else stays external.
 */
export function toNavPath(
  url: string | null | undefined,
  type: string,
  internalHosts: readonly string[],
): { to: string; external: boolean } {
  if (type === "FRONTPAGE") return { to: "/", external: false };
  if (type === "CATALOG") return { to: "/collections/all", external: false };
  if (type === "COLLECTIONS") return { to: "/collections", external: false };
  if (type === "SEARCH") return { to: "/search", external: false };
  if (!url) return { to: "/", external: false };

  try {
    const parsed = new URL(url);
    if (internalHosts.includes(parsed.host)) {
      return { to: `${parsed.pathname}${parsed.search}` || "/", external: false };
    }
    return { to: url, external: true };
  } catch {
    // Already a relative path.
    return { to: url.startsWith("/") ? url : `/${url}`, external: false };
  }
}

type RawMenuItem = {
  id: string;
  title: string;
  url?: string | null;
  type: string;
  items?: readonly RawMenuItem[];
};

function normalizeMenu(
  items: readonly RawMenuItem[] | undefined,
  internalHosts: readonly string[],
): NavItem[] {
  return (items ?? []).map((item) => {
    const { to, external } = toNavPath(item.url, item.type, internalHosts);
    return {
      id: item.id,
      title: item.title,
      to,
      external,
      items: normalizeMenu(item.items, internalHosts),
    };
  });
}

function normalizeStoreProfile(
  fields: SiteContentQueryResult["storeProfile"],
): StoreProfile | null {
  if (!fields) return null;
  const f = fieldMap(fields.fields);
  if (Object.keys(f).length === 0) return null;

  const officerName = text(f.grievance_officer_name);
  return {
    legalName: text(f.legal_name),
    tradeName: text(f.trade_name),
    registeredAddress: text(f.registered_address),
    gstin: text(f.gstin),
    supportEmail: text(f.support_email),
    supportPhone: text(f.support_phone),
    whatsappNumber: text(f.whatsapp_number),
    supportHours: text(f.support_hours),
    grievanceOfficer: officerName
      ? {
          name: officerName,
          designation: text(f.grievance_officer_designation),
          email: text(f.grievance_officer_email),
          phone: text(f.grievance_officer_phone),
        }
      : null,
    socialLinks: linkList(f.social_links),
  };
}

function normalizePromises(fields: SiteContentQueryResult["storePromises"]): StorePromises {
  if (!fields) return EMPTY_PROMISES;
  const f = fieldMap(fields.fields);
  const days = int(f.returns_window_days);
  return {
    freeShippingThreshold: money(f.free_shipping_threshold),
    codAvailable: bool(f.cod_available),
    codNote: text(f.cod_note),
    returnsWindowDays: days !== null && days > 0 ? days : null,
    returnsNote: text(f.returns_note),
    dispatchNote: text(f.dispatch_note),
  };
}

function normalizeFestive(fields: SiteContentQueryResult["festiveMode"]): FestiveMode {
  if (!fields) return null;
  const f = fieldMap(fields.fields);
  if (!bool(f.enabled) || !isWithinWindow(f.starts_at, f.ends_at)) return null;
  return { theme: text(f.theme) ?? "generic", label: text(f.label) };
}

function normalizeAnnouncements(
  nodes: SiteContentQueryResult["announcements"]["nodes"],
): Announcement[] {
  return nodes
    .map((node) => ({ handle: node.handle, f: fieldMap(node.fields) }))
    .filter(({ f }) => text(f.text) !== null && isWithinWindow(f.starts_at, f.ends_at))
    .sort((a, b) => (int(a.f.sort) ?? 0) - (int(b.f.sort) ?? 0))
    .map(({ handle, f }) => ({
      id: handle,
      text: text(f.text) as string,
      link: link(f.link),
      icon: text(f.icon) === "none" ? null : text(f.icon),
    }));
}

export async function loadSiteContent(
  storefrontClient: RequestStorefrontClient,
  storeDomain: string | undefined,
): Promise<SiteContent> {
  const { data, errors } = await storefrontClient.graphql(SITE_CONTENT_QUERY, {
    cache: Cache.short(),
  });

  if (errors) {
    console.error(`Site content query failed: ${errors.map(({ message }) => message).join("\n")}`);
  }

  if (!data) {
    // The shell still renders (logo, cart, search) without optional content.
    return {
      mainMenu: [],
      footerMenu: [],
      collections: [],
      announcements: [],
      storeProfile: null,
      storePromises: EMPTY_PROMISES,
      festiveMode: null,
      policies: [],
    };
  }

  const internalHosts = [data.shop.primaryDomain.host, storeDomain].filter(
    (host): host is string => Boolean(host),
  );
  const { privacyPolicy, refundPolicy, shippingPolicy, termsOfService } = data.shop;

  return {
    mainMenu: normalizeMenu(data.mainMenu?.items, internalHosts),
    footerMenu: normalizeMenu(data.footerMenu?.items, internalHosts),
    collections: data.collections.nodes.filter((collection) => collection.handle !== "all"),
    announcements: normalizeAnnouncements(data.announcements.nodes),
    storeProfile: normalizeStoreProfile(data.storeProfile),
    storePromises: normalizePromises(data.storePromises),
    festiveMode: normalizeFestive(data.festiveMode),
    policies: [shippingPolicy, refundPolicy, privacyPolicy, termsOfService].filter(
      (policy): policy is PolicyLink => Boolean(policy?.handle),
    ),
  };
}
