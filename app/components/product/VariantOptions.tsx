import { buildProductSelectionSearchParams, type SelectedOption } from "@shopify/hydrogen";
import { useMemo, type MouseEvent } from "react";
import { Link, useLocation } from "react-router";

import { useProductForm } from "~/lib/product";

type OptionProduct = {
  handle: string;
  options: Array<{
    name: string;
    optionValues: Array<{
      name: string;
      swatch?: { color?: string | null; image?: { previewImage?: { url: string } | null } | null } | null;
    }>;
  }>;
};

export function variantUrl(
  product: { handle: string; options: Array<{ name: string }> },
  selectedOptions: SelectedOption[],
  handle = product.handle,
  base: URLSearchParams = new URLSearchParams(),
) {
  const params = buildProductSelectionSearchParams({
    selectedOptions,
    optionNames: product.options.map((option) => option.name),
    base,
  });
  const query = params.toString();
  return `/products/${handle}${query ? `?${query}` : ""}`;
}

/** True when shoppers actually have something to choose. */
export function hasRealOptions(product: OptionProduct) {
  return product.options.some((option) => option.optionValues.length > 1);
}

// Mirrors React Router's Link guard: modified clicks belong to the browser.
function isPlainActivation(event: MouseEvent<HTMLAnchorElement>) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    (!event.currentTarget.target || event.currentTarget.target === "_self")
  );
}

/**
 * Variant picker synced to the URL (per the hydrogen-variant-form skill). Options
 * with a single value (e.g. supplier "Default Title") are not shown.
 */
export function VariantOptions({ product }: { product: OptionProduct }) {
  const { options, register } = useProductForm();
  const location = useLocation();
  const baseParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const swatches = useMemo(() => {
    const lookup = new Map<string, { color: string | null; imageUrl: string | null }>();
    for (const option of product.options) {
      for (const value of option.optionValues) {
        lookup.set(`${option.name}:${value.name}`, {
          color: value.swatch?.color ?? null,
          imageUrl: value.swatch?.image?.previewImage?.url ?? null,
        });
      }
    }
    return lookup;
  }, [product]);

  const visible = options.filter((option) => option.values.length > 1);
  if (visible.length === 0) return null;

  return (
    <div className="space-y-5">
      {visible.map((option) => {
        const selectedValue = option.values.find((value) => value.selected)?.name;
        const useSwatches = option.values.some((value) => {
          const swatch = swatches.get(`${option.name}:${value.name}`);
          return swatch?.color || swatch?.imageUrl;
        });

        return (
          <fieldset key={option.name}>
            <legend className="text-on-surface mb-2.5 text-sm font-semibold">
              {option.name}
              {selectedValue ? (
                <span className="text-on-surface-secondary font-normal">: {selectedValue}</span>
              ) : null}
            </legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label={option.name}>
              {option.values.map((value) => {
                const registered = register("optionValue", { optionName: option.name, value: value.name });
                const isCrossProduct = value.handle !== product.handle;
                const soldOut = !value.available;
                const swatch = useSwatches ? swatches.get(`${option.name}:${value.name}`) : null;
                const label = `${value.name}${soldOut ? " (sold out)" : ""}`;

                const className = swatch
                  ? `relative inline-flex size-11 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-[var(--color-cream)] ${
                      value.selected ? "ring-burgundy" : "ring-transparent hover:ring-[var(--color-gold)]"
                    } ${soldOut ? "opacity-45" : ""}`
                  : `inline-flex min-h-11 items-center rounded-full border-2 px-4 text-sm font-semibold motion-safe:transition-colors ${
                      value.selected
                        ? "border-burgundy bg-peach-soft text-burgundy"
                        : "border-border text-on-surface hover:border-[var(--color-gold)] bg-white"
                    } ${soldOut ? "line-through decoration-1 opacity-60" : ""}`;

                const content = swatch ? (
                  <>
                    <span
                      className="border-border size-9 overflow-hidden rounded-full border bg-cover bg-center"
                      style={
                        swatch.imageUrl
                          ? { backgroundImage: `url("${swatch.imageUrl}")` }
                          : { backgroundColor: swatch.color ?? undefined }
                      }
                    />
                    <span className="sr-only">{label}</span>
                  </>
                ) : (
                  label
                );

                if (!isCrossProduct && !value.exists) {
                  return (
                    <button
                      key={value.name}
                      type="button"
                      disabled
                      className={`${className} cursor-not-allowed`}
                      aria-label={swatch ? label : undefined}
                      aria-pressed={value.selected}
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <Link
                    key={value.name}
                    to={variantUrl(product, value.selectedOptions, value.handle, baseParams)}
                    replace={!isCrossProduct}
                    preventScrollReset
                    className={className}
                    aria-label={swatch ? label : undefined}
                    aria-current={value.selected ? "true" : undefined}
                    onClick={
                      isCrossProduct
                        ? undefined
                        : (event) => {
                            if (!isPlainActivation(event)) return;
                            registered.onClick();
                            event.preventDefault();
                          }
                    }
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
