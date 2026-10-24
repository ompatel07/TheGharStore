// The Ghar Store icon set — drawn for this brand (24×24, rounded 1.75px strokes,
// soft hand-made curves). Use <Icon name="..." />. Decorative by default
// (aria-hidden); pass `label` when the icon is the only content of a control.

import type { SVGProps } from "react";

const PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.75 20c.9-3.6 3.85-5.5 7.25-5.5s6.35 1.9 7.25 5.5" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2.2l2.1 10.6a1.6 1.6 0 0 0 1.57 1.3h8.06a1.6 1.6 0 0 0 1.56-1.24L20 8H6.2" />
      <circle cx="9.5" cy="19.5" r="1.25" />
      <circle cx="17" cy="19.5" r="1.25" />
    </>
  ),
  heart: (
    <path d="M12 19.5s-7-4.3-7-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.1c0 5.1-7 9.4-7 9.4Z" />
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  "chevron-down": <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />,
  "chevron-right": <path d="m9.5 6.5 5.5 5.5-5.5 5.5" />,
  "chevron-left": <path d="m14.5 6.5-5.5 5.5 5.5 5.5" />,
  "arrow-right": <path d="M4.5 12h14.5m-5.5-5.5 5.5 5.5-5.5 5.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: (
    <>
      <path d="M4.5 7h15M9.5 7V5.25c0-.7.55-1.25 1.25-1.25h2.5c.7 0 1.25.55 1.25 1.25V7" />
      <path d="m6.5 7 .9 11.6a1.6 1.6 0 0 0 1.6 1.4h6a1.6 1.6 0 0 0 1.6-1.4L17.5 7" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  truck: (
    <>
      <path d="M2.75 6.5h10.5v9.25H2.75zM13.25 9.5h3.9l3.1 3.3v2.95h-7" />
      <circle cx="6.5" cy="17.25" r="1.75" />
      <circle cx="16.75" cy="17.25" r="1.75" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 5 6.25v5.2c0 4.3 2.95 7.65 7 9.05 4.05-1.4 7-4.75 7-9.05v-5.2Z" />
      <path d="m8.75 12 2.25 2.25 4.25-4.5" />
    </>
  ),
  refund: (
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9" />
      <path d="M4.5 4.5V9H9" />
      <path d="M10 9.5h4.25M10 12h4.25m-2.6 0 2.6 3.25M11.25 9.5c1.65 0 2.5.6 2.5 1.25S12.9 12 11.25 12" />
    </>
  ),
  cod: (
    <>
      <rect x="2.75" y="6.5" width="18.5" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 9.5v.01M18 14.5v.01" />
    </>
  ),
  rupee: (
    <path d="M7 5h10M7 9h10M7 5h3.25a4 4 0 0 1 0 8H7l7.5 6.5" />
  ),
  phone: (
    <path d="M8.2 3.75 6 4.4c-1 .3-1.6 1.3-1.4 2.3 1.2 6.1 6.6 11.5 12.7 12.7 1 .2 2-.4 2.3-1.4l.65-2.2-3.6-1.9-1.9 1.6c-2.1-.9-3.7-2.5-4.6-4.6l1.6-1.9Z" />
  ),
  whatsapp: (
    <>
      <path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6Z" />
      <path d="M9.2 8.6c.2-.4.6-.4.8 0l.6 1.3c.1.2 0 .5-.1.7l-.5.6c.5 1.1 1.4 2 2.5 2.5l.6-.5c.2-.2.5-.2.7-.1l1.3.6c.4.2.4.6 0 .8-.9.6-2 .8-3 .3a7 7 0 0 1-3.4-3.4c-.4-1-.2-2.1.5-2.8Z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  "map-pin": (
    <>
      <path d="M12 20.5s6.25-5.6 6.25-10.5a6.25 6.25 0 1 0-12.5 0c0 4.9 6.25 10.5 6.25 10.5Z" />
      <circle cx="12" cy="10" r="2.25" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5c.5 3.9 2.6 6 6.5 6.5-3.9.5-6 2.6-6.5 6.5-.5-3.9-2.6-6-6.5-6.5 3.9-.5 6-2.6 6.5-6.5Z" />
      <path d="M18.5 15.5c.2 1.3.9 2 2.2 2.2-1.3.2-2 .9-2.2 2.2-.2-1.3-.9-2-2.2-2.2 1.3-.2 2-.9 2.2-2.2Z" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M3 9h18M12 9v11M12 9c-1.2-3.4-4.6-4.2-5.4-2.3-.6 1.5 1.6 2.3 5.4 2.3Zm0 0c1.2-3.4 4.6-4.2 5.4-2.3.6 1.5-1.6 2.3-5.4 2.3Z" />
    </>
  ),
  box: (
    <>
      <path d="m12 3.5 8 4v9L12 20.5l-8-4v-9Z" />
      <path d="m4 7.5 8 4 8-4M12 11.5v9" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" />
    </>
  ),
  filter: <path d="M4 6.5h16M7 12h10M10 17.5h4" />,
  zoom: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5M11 8.5v5M8.5 11h5" />
    </>
  ),
  play: <path d="M8 5.5v13l10.5-6.5Z" />,
  // ─── Category icons ─────────────────────────────────────────────────
  roller: (
    <>
      <rect x="4" y="3.75" width="13" height="5" rx="2" />
      <path d="M17 6.25h2.25v4.5H11.5v3" />
      <rect x="10" y="13.75" width="3" height="6.5" rx="1.25" />
    </>
  ),
  hammer: (
    <>
      <path d="M13.5 6.5 8.25 11.75" />
      <path d="m9.5 4 6.75 6.75 2-2c.6-.6.6-1.5 0-2.1L13.6 2.1c-.6-.6-1.5-.6-2.1 0Z" />
      <path d="M10.75 9.25 3.5 16.5a1.75 1.75 0 0 0 2.5 2.5l7.25-7.25" />
    </>
  ),
  sofa: (
    <>
      <path d="M5.5 11V8.5a2.5 2.5 0 0 1 2.5-2.5h8a2.5 2.5 0 0 1 2.5 2.5V11" />
      <path d="M4 11a1.75 1.75 0 0 1 1.75 1.75V14h12.5v-1.25a1.75 1.75 0 1 1 3.5 0V17a1.5 1.5 0 0 1-1.5 1.5H3.75A1.5 1.5 0 0 1 2.25 17v-4.25A1.75 1.75 0 0 1 4 11Z" />
      <path d="M5.5 18.5v1.5M18.5 18.5v1.5" />
    </>
  ),
  vase: (
    <>
      <path d="M9 3.5h6M9.75 3.5v3c-2.6 1.3-4 3.5-4 6.25 0 4.25 2.75 7.75 6.25 7.75s6.25-3.5 6.25-7.75c0-2.75-1.4-4.95-4-6.25v-3" />
      <path d="M7 13c2.2-1.2 4.4.9 6.6 0 1.2-.5 2.3-.6 3.4-.2" />
    </>
  ),
  utensils: (
    <>
      <path d="M6.5 3.5v6.25a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3.5M8.5 3.5v17" />
      <path d="M16.5 20.5V3.5c-2 1.2-3 3.6-3 6.75 0 1.9.9 3.1 3 3.25" />
    </>
  ),
  kadhai: (
    <>
      <path d="M3.5 10.5h17c0 4.4-3.8 7.5-8.5 7.5s-8.5-3.1-8.5-7.5Z" />
      <path d="M2 10.5h1.5M20.5 10.5H22M9 6.5c0-1 .8-1.5 0-2.75M12.5 6.5c0-1 .8-1.5 0-2.75M16 6.5c0-1 .8-1.5 0-2.75" />
    </>
  ),
  broom: (
    <>
      <path d="m19.5 3.5-7.25 7.25" />
      <path d="M12.75 10.25 9.5 9.25c-1.3 1.6-2.1 3.1-2.6 4.4l3.4 3.4c1.3-.5 2.8-1.3 4.4-2.6Z" />
      <path d="M6.9 13.65c-1 .9-2.4 1.4-3.4 1.6.4 2.6 2.7 4.9 5.3 5.3.2-1 .7-2.4 1.6-3.4M5.5 17.5l1.75-1.75" />
    </>
  ),
  spray: (
    <>
      <path d="M8.5 9.5h6l1 2.5v7.25A1.25 1.25 0 0 1 14.25 20.5h-5.5a1.25 1.25 0 0 1-1.25-1.25V12Z" />
      <path d="M10 9.5V7.25h3.5l.5-2h-5.5c-1.5 0-2.5 1-3 2.25M17 5.5h.01M19 4h.01M19 7h.01" />
    </>
  ),
  plant: (
    <>
      <path d="M7 14.5h10l-1.2 5.1a1.25 1.25 0 0 1-1.2.9H9.4a1.25 1.25 0 0 1-1.2-.9Z" />
      <path d="M12 14.5V9.25M12 9.25c0-3 1.9-5.1 5.25-5.75.2 3.4-1.9 5.75-5.25 5.75Zm0 2.25c0-2.5-1.6-4.2-4.5-4.75-.2 2.8 1.6 4.75 4.5 4.75Z" />
    </>
  ),
  bulb: (
    <>
      <path d="M9.25 17h5.5M10 20h4" />
      <path d="M9.25 17c0-2.6-3-3.6-3-7.25A5.75 5.75 0 0 1 12 4a5.75 5.75 0 0 1 5.75 5.75c0 3.65-3 4.65-3 7.25" />
    </>
  ),
  diya: (
    <>
      <path d="M3 13.5h18c-.9 3.6-4.6 6-9 6s-8.1-2.4-9-6Z" />
      <path d="M12 3.5c2 2.4 2.5 4.1 1.6 5.6a1.85 1.85 0 0 1-3.2 0c-.9-1.5-.4-3.2 1.6-5.6Z" />
      <path d="M12 11v2.5" />
    </>
  ),
  hook: (
    <>
      <rect x="9.25" y="3" width="5.5" height="5.5" rx="1.25" />
      <path d="M12 8.5v6.75a3 3 0 0 1-6 0V14" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 11 12 4l8.5 7" />
      <path d="M5.75 9.25v10.25h12.5V9.25" />
      <path d="M10.25 12.5h3.5v3.5h-3.5z" />
    </>
  ),
} as const;

export type IconName = keyof typeof PATHS;

export const ICON_NAMES = Object.keys(PATHS) as IconName[];

export function isIconName(value: string | null | undefined): value is IconName {
  return Boolean(value && Object.hasOwn(PATHS, value));
}

type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName;
  /** Accessible name. Omit for decorative icons (default). */
  label?: string;
  size?: number | string;
};

export function Icon({ name, label, size = 24, className, strokeWidth, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
