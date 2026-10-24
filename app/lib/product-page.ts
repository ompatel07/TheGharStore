// Product page data + normalizers. Every block on the PDP maps to a real Shopify
// field; empty fields return null/[] and their block hides.

import { gql } from "@shopify/hydrogen";

import { PRODUCT_CARD_FRAGMENT } from "~/components/ProductCard";
import { fieldMap, lines, list, money, text, type MoneyValue } from "~/lib/metaobject";

export const PRODUCT_VARIANT_FRAGMENT = gql(`
  fragment ProductVariantFields on ProductVariant {
    id
    title
    availableForSale
    selectedOptions {
      name
      value
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    unitPrice {
      amount
      currencyCode
    }
    unitPriceMeasurement {
      referenceValue
      referenceUnit
    }
    image {
      id
      url
      altText
      width
      height
    }
    product {
      title
      handle
    }
    mrp: metafield(namespace: "custom", key: "mrp") {
      value
    }
    netQuantity: metafield(namespace: "custom", key: "net_quantity") {
      value
    }
  }
`);

export const PRODUCT_QUERY = gql(
  `
    query ProductPage(
      $handle: String!
      $selectedOptions: [SelectedOptionInput!]!
      $country: CountryCode
      $language: LanguageCode
    ) @inContext(country: $country, language: $language) {
      product(handle: $handle) {
        id
        handle
        title
        description
        descriptionHtml
        requiresSellingPlan
        encodedVariantExistence
        encodedVariantAvailability
        seo {
          title
          description
        }
        collections(first: 3) {
          nodes {
            handle
            title
          }
        }
        featuredImage {
          id
          url
          altText
          width
          height
        }
        images(first: 12) {
          nodes {
            id
            url
            altText
            width
            height
          }
        }
        media(first: 20) {
          nodes {
            __typename
            mediaContentType
            alt
            previewImage {
              url
              altText
              width
              height
            }
            ... on Video {
              id
              sources {
                url
                mimeType
                width
                height
              }
            }
            ... on ExternalVideo {
              id
              embedUrl
              host
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        options {
          name
          optionValues {
            name
            firstSelectableVariant {
              ...ProductVariantFields
            }
            swatch {
              color
              image {
                previewImage {
                  url
                }
              }
            }
          }
        }
        selectedOrFirstAvailableVariant(
          selectedOptions: $selectedOptions
          ignoreUnknownOptions: true
          caseInsensitiveMatch: true
        ) {
          ...ProductVariantFields
        }
        adjacentVariants(
          selectedOptions: $selectedOptions
          ignoreUnknownOptions: true
          caseInsensitiveMatch: true
        ) {
          ...ProductVariantFields
        }
      }
    }
  `,
  [PRODUCT_VARIANT_FRAGMENT],
);

export const PRODUCT_CONTENT_QUERY = gql(`
  query ProductContent($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      highlights: metafield(namespace: "custom", key: "highlights") {
        value
      }
      specifications: metafield(namespace: "custom", key: "specifications") {
        value
      }
      howToUse: metafield(namespace: "custom", key: "how_to_use") {
        references(first: 10) {
          nodes {
            ... on Metaobject {
              handle
              fields {
                key
                value
                reference {
                  ... on MediaImage {
                    image {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
      }
      inTheBox: metafield(namespace: "custom", key: "in_the_box") {
        value
      }
      care: metafield(namespace: "custom", key: "care") {
        value
      }
      shippingReturns: metafield(namespace: "custom", key: "shipping_returns") {
        value
      }
      faqs: metafield(namespace: "custom", key: "faqs") {
        references(first: 12) {
          nodes {
            ... on Metaobject {
              handle
              fields {
                key
                value
              }
            }
          }
        }
      }
      beforeImage: metafield(namespace: "custom", key: "before_image") {
        reference {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
      afterImage: metafield(namespace: "custom", key: "after_image") {
        reference {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
      beforeAfterCaption: metafield(namespace: "custom", key: "before_after_caption") {
        value
      }
      countryOfOrigin: metafield(namespace: "custom", key: "country_of_origin") {
        value
      }
      genericName: metafield(namespace: "custom", key: "generic_name") {
        value
      }
      dimensions: metafield(namespace: "custom", key: "dimensions") {
        value
      }
      consumerCare: metafield(namespace: "custom", key: "consumer_care") {
        value
      }
      legalEntities: metafield(namespace: "custom", key: "legal_entities") {
        references(first: 6) {
          nodes {
            ... on Metaobject {
              handle
              fields {
                key
                value
              }
            }
          }
        }
      }
    }
  }
`);

export const RECOMMENDATIONS_QUERY = gql(
  `
    query ProductRecommendations(
      $productId: ID!
      $country: CountryCode
      $language: LanguageCode
    ) @inContext(country: $country, language: $language) {
      productRecommendations(productId: $productId, intent: RELATED) {
        ...ProductCard
      }
    }
  `,
  [PRODUCT_CARD_FRAGMENT],
);

type RawFields = readonly { key: string; value?: string | null }[];
type RawRefs = { references?: { nodes: readonly unknown[] } | null } | null | undefined;

export type SpecRow = { label: string; value: string };
export type HowToStep = {
  title: string;
  body: string | null;
  image: { url: string; altText: string | null; width: number | null; height: number | null } | null;
};
export type Faq = { question: string; answer: string };
export type LegalEntity = {
  role: string;
  name: string;
  address: string;
  email: string | null;
  phone: string | null;
};

function referenceFields(meta: RawRefs): { handle: string; fields: RawFields }[] {
  return (meta?.references?.nodes ?? []).flatMap((node) => {
    if (node && typeof node === "object" && "fields" in node && "handle" in node) {
      return [node as { handle: string; fields: RawFields }];
    }
    return [];
  });
}

/** "Label: Value" per line → table rows. Lines without a colon are skipped. */
export function parseSpecifications(value: string | null | undefined): SpecRow[] {
  return lines(value).flatMap((line) => {
    const index = line.indexOf(":");
    if (index <= 0) return [];
    const label = line.slice(0, index).trim();
    const rowValue = line.slice(index + 1).trim();
    return label && rowValue ? [{ label, value: rowValue }] : [];
  });
}

type ProductContentSource = {
  highlights?: { value?: string | null } | null;
  specifications?: { value?: string | null } | null;
  howToUse?: RawRefs;
  inTheBox?: { value?: string | null } | null;
  care?: { value?: string | null } | null;
  shippingReturns?: { value?: string | null } | null;
  faqs?: RawRefs;
  beforeImage?: { reference?: unknown } | null;
  afterImage?: { reference?: unknown } | null;
  beforeAfterCaption?: { value?: string | null } | null;
  countryOfOrigin?: { value?: string | null } | null;
  genericName?: { value?: string | null } | null;
  dimensions?: { value?: string | null } | null;
  consumerCare?: { value?: string | null } | null;
  legalEntities?: RawRefs;
};

function imageFromReference(reference: unknown): HowToStep["image"] {
  if (reference && typeof reference === "object" && "image" in reference) {
    const image = (reference as { image?: HowToStep["image"] }).image;
    return image ?? null;
  }
  return null;
}

export function normalizeProductContent(product: ProductContentSource) {
  const howToUse: HowToStep[] = (product.howToUse?.references?.nodes ?? []).flatMap((node) => {
    if (!node || typeof node !== "object" || !("fields" in node)) return [];
    const fields = (node as { fields: readonly { key: string; value?: string | null; reference?: unknown }[] })
      .fields;
    const map = fieldMap(fields);
    const title = text(map.title);
    if (!title) return [];
    const imageField = fields.find((field) => field.key === "image");
    return [{ title, body: text(map.body), image: imageFromReference(imageField?.reference) }];
  });

  const faqs: Faq[] = referenceFields(product.faqs).flatMap(({ fields }) => {
    const map = fieldMap(fields);
    const question = text(map.question);
    const answer = text(map.answer);
    return question && answer ? [{ question, answer }] : [];
  });

  const legalEntities: LegalEntity[] = referenceFields(product.legalEntities).flatMap(({ fields }) => {
    const map = fieldMap(fields);
    const name = text(map.name);
    const address = text(map.address);
    if (!name || !address) return [];
    return [
      {
        role: text(map.role) ?? "Marketed by",
        name,
        address,
        email: text(map.email),
        phone: text(map.phone),
      },
    ];
  });

  const before = imageFromReference(product.beforeImage?.reference);
  const after = imageFromReference(product.afterImage?.reference);

  return {
    highlights: list(product.highlights?.value),
    specifications: parseSpecifications(product.specifications?.value),
    howToUse,
    inTheBox: list(product.inTheBox?.value),
    care: text(product.care?.value),
    shippingReturns: text(product.shippingReturns?.value),
    faqs,
    beforeAfter: before && after ? { before, after, caption: text(product.beforeAfterCaption?.value) } : null,
    legal: {
      countryOfOrigin: text(product.countryOfOrigin?.value),
      genericName: text(product.genericName?.value),
      dimensions: text(product.dimensions?.value),
      consumerCare: text(product.consumerCare?.value),
      entities: legalEntities,
    },
  };
}

export type ProductContent = ReturnType<typeof normalizeProductContent>;

export function variantMrp(variant: { mrp?: { value?: string | null } | null } | null | undefined): MoneyValue | null {
  return money(variant?.mrp?.value);
}
