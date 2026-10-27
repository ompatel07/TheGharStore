import { Link } from "react-router";

// The brand logo, used exactly as supplied (never recoloured, cropped or redrawn).
// Source: public/brand/ghar-store-logo.png (350 × 248, transparent).
export const LOGO_SRC = "/brand/ghar-store-logo.png";
export const LOGO_WIDTH = 350;
export const LOGO_HEIGHT = 248;
export const BRAND_NAME = "The Ghar Store";
export const BRAND_TAGLINE = "Smart finds. Better homes.";

type LogoProps = {
  /** Rendered height in px; width follows the logo's aspect ratio. */
  height: number;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
};

export function Logo({ height, className = "", priority = false, onClick }: LogoProps) {
  const width = Math.round((LOGO_WIDTH / LOGO_HEIGHT) * height);
  return (
    <Link
      to="/"
      aria-label={`${BRAND_NAME} — home`}
      className={`inline-flex shrink-0 rounded-sm ${className}`}
      prefetch="intent"
      onClick={onClick}
    >
      <img
        src={LOGO_SRC}
        alt={BRAND_NAME}
        width={width}
        height={height}
        style={{ width, height }}
        className="block object-contain"
        // Never "high": the hero / product photo is the page's main image.
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
      />
    </Link>
  );
}
