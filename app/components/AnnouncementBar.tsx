import { Link } from "react-router";

import { Icon, isIconName } from "~/components/ui/Icon";
import type { Announcement, FestiveMode } from "~/lib/site-content";

/**
 * Store-wide announcements from the `announcement` metaobject. Nothing renders
 * when there are no active entries. No auto-rotation: on mobile the items are a
 * swipeable row, so nobody has to chase a moving message.
 */
export function AnnouncementBar({
  announcements,
  festive,
}: {
  announcements: Announcement[];
  festive: FestiveMode;
}) {
  if (announcements.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Store announcements"
      className="bg-chocolate text-cream relative overflow-hidden"
    >
      {festive ? (
        <span
          aria-hidden="true"
          className="festive-glow pointer-events-none absolute -top-10 left-1/2 h-24 w-72 -translate-x-1/2"
        />
      ) : null}
      <ul
        role="list"
        className="max-w-page scrollbar-none relative mx-auto flex snap-x snap-mandatory overflow-x-auto md:justify-around"
      >
        {announcements.map((announcement) => (
          <li
            key={announcement.id}
            className="flex w-full shrink-0 snap-center items-center justify-center px-4 py-2.5 md:w-auto"
          >
            <AnnouncementContent announcement={announcement} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnnouncementContent({ announcement }: { announcement: Announcement }) {
  const content = (
    <span className="inline-flex items-center gap-2 text-[0.85rem] font-medium">
      {isIconName(announcement.icon) ? (
        <Icon name={announcement.icon} size={18} className="text-peach shrink-0" />
      ) : null}
      <span>{announcement.text}</span>
    </span>
  );

  if (!announcement.link) return content;

  const { url } = announcement.link;
  const internal = url.startsWith("/");
  return internal ? (
    <Link to={url} className="underline-offset-4 hover:underline">
      {content}
    </Link>
  ) : (
    <a href={url} className="underline-offset-4 hover:underline" rel="noopener">
      {content}
    </a>
  );
}
