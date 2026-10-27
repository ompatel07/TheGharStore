import type { CSSProperties } from "react";
import { Link } from "react-router";

import { Icon } from "~/components/ui/Icon";
import type { TrustBadge } from "~/lib/promises";

const MD_COLS = ["", "md:grid-cols-1", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-4"];

/** Store promises as a compact badge grid (from Shopify `store_promises`). */
export function TrustStrip({
  badges,
  className = "",
  limit = 4,
}: {
  badges: TrustBadge[];
  className?: string;
  limit?: number;
}) {
  const items = badges.slice(0, limit);
  if (items.length === 0) return null;

  return (
    <ul role="list" className={`trust-strip grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem] bg-[var(--color-border)] ${MD_COLS[Math.min(items.length, 4)]} ${className}`}>
      {items.map((badge, index) => {
        const body = (
          <>
            <span className="trust-icon icon-chip [--chip-size:2.75rem]" style={{ "--i": index } as CSSProperties}>
              <Icon name={badge.icon} size={22} />
            </span>
            <span className="min-w-0">
              <span className="text-on-surface block text-[0.88rem] leading-tight font-bold md:text-[0.92rem]">{badge.title}</span>
              <span className="text-on-surface-secondary mt-0.5 line-clamp-2 text-[0.78rem] leading-snug max-md:hidden">
                {badge.text}
              </span>
            </span>
          </>
        );
        return (
          <li key={badge.id} className="bg-white">
            {badge.to ? (
              <Link to={badge.to} className="flex h-full items-center gap-3 p-3.5 transition-colors md:items-start md:p-4 hover:bg-[var(--color-peach-soft)]">
                {body}
              </Link>
            ) : (
              <div className="flex h-full items-center gap-3 p-3.5 md:items-start md:p-4">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
