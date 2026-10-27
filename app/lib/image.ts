// Shopify CDN image sizing (per the hydrogen-image skill).
// Only Shopify CDN hosts are rewritten; anything else passes through unchanged.

export type ShopifyImageOptions = {
  width?: number;
  height?: number;
  crop?: "center" | "top" | "bottom" | "left" | "right";
  /** CDN quality (1–100). Defaults to 75: visually identical, ~30% lighter WebP/AVIF. */
  quality?: number;
};

const DEFAULT_QUALITY = 75;

const SHOPIFY_CDN_HOSTS = ["cdn.shopify.com", "mock.shop"];

function isShopifyImageHost(hostname: string) {
  return SHOPIFY_CDN_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

export function shopifyImageUrl(url: string, options: ShopifyImageOptions = {}) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (!isShopifyImageHost(parsed.hostname)) return url;

  if (options.width) parsed.searchParams.set("width", String(options.width));
  if (options.height) parsed.searchParams.set("height", String(options.height));
  if (options.crop) parsed.searchParams.set("crop", options.crop);
  // Only resized requests get a quality hint (the original file stays untouched).
  if (options.width || options.height) parsed.searchParams.set("quality", String(options.quality ?? DEFAULT_QUALITY));

  return parsed.toString();
}

/** Square-ish thumbnail URL at a given pixel width. */
export function productImageUrl(url: string, width: number) {
  return shopifyImageUrl(url, { width });
}

/**
 * Width-descriptor srcset for responsive images. Never asks the CDN for more
 * pixels than the source has (`sourceWidth`), so small supplier images aren't
 * upscaled into blur.
 */
export function responsiveSrcSet(
  url: string,
  widths: readonly number[],
  sourceWidth?: number | null,
  options: Omit<ShopifyImageOptions, "width" | "height"> & { aspectRatio?: number } = {},
) {
  const { aspectRatio, ...rest } = options;
  const usable = widths.filter((width) => !sourceWidth || width <= sourceWidth);
  const list = usable.length > 0 ? usable : [sourceWidth ?? widths[0]];
  return list
    .map((width) => {
      const height = aspectRatio ? Math.round(width / aspectRatio) : undefined;
      return `${shopifyImageUrl(url, { ...rest, width, height })} ${width}w`;
    })
    .join(", ");
}
