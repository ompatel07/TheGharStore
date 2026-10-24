import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";

import { Icon } from "~/components/ui/Icon";
import { responsiveSrcSet, shopifyImageUrl } from "~/lib/image";

export type GalleryImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type GalleryItem =
  | { kind: "image"; key: string; image: GalleryImage }
  | {
      kind: "video";
      key: string;
      poster: GalleryImage | null;
      sources: { url: string; mimeType: string }[];
      alt: string | null;
    }
  | { kind: "external"; key: string; poster: GalleryImage | null; embedUrl: string; alt: string | null };

/** Zoom only when the source has enough pixels to be worth zooming into. */
const MIN_ZOOM_SOURCE_WIDTH = 1000;
const STAGE_WIDTHS = [400, 600, 800, 1000, 1200, 1600];

type ProductGalleryProps = {
  title: string;
  items: GalleryItem[];
};

export function ProductGallery({ title, items }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstKey = items[0]?.key;

  // A variant change can put a different image first; return to it.
  useEffect(() => {
    setActive(0);
    trackRef.current?.scrollTo({ left: 0 });
  }, [firstKey]);

  const goTo = (index: number) => {
    setActive(index);
    const track = trackRef.current;
    if (track) track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  if (items.length === 0) {
    return (
      <div className="bg-cream-deep grid aspect-square place-items-center rounded-[var(--radius-lg)]">
        <Icon name="home" size={64} className="text-chocolate-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4" data-testid="product-gallery">
      <div className="relative min-w-0 flex-1">
        <div
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label={`${title} — images`}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto rounded-[var(--radius-lg)] lg:overflow-hidden"
          onScroll={(event) => {
            const track = event.currentTarget;
            if (track.clientWidth > 0) setActive(Math.round(track.scrollLeft / track.clientWidth));
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.key}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${items.length}`}
              className="w-full shrink-0 snap-center"
            >
              <Slide item={item} title={title} priority={index === 0} />
            </div>
          ))}
        </div>

        {items.length > 1 ? (
          <>
            <span className="bg-chocolate/80 text-cream absolute end-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold lg:hidden">
              {active + 1} / {items.length}
            </span>
            <div className="mt-3 flex justify-center gap-1.5 lg:hidden" aria-hidden="true">
              {items.map((item, index) => (
                <span
                  key={item.key}
                  className={`h-1.5 rounded-full motion-safe:transition-all ${
                    index === active ? "bg-burgundy w-5" : "bg-chocolate/25 w-1.5"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {items.length > 1 ? (
        <ul
          role="list"
          aria-label="Choose image"
          className="scrollbar-none hidden gap-2.5 overflow-y-auto lg:flex lg:max-h-[38rem] lg:w-20 lg:flex-col"
        >
          {items.map((item, index) => {
            const thumb = item.kind === "image" ? item.image : item.poster;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Show ${item.kind === "image" ? "image" : "video"} ${index + 1}`}
                  aria-current={index === active ? "true" : undefined}
                  className={`bg-cream-deep relative block aspect-square w-full overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-[var(--color-cream)] motion-safe:transition ${
                    index === active ? "ring-burgundy" : "ring-transparent hover:ring-[var(--color-gold)]"
                  }`}
                >
                  {thumb ? (
                    <img
                      src={shopifyImageUrl(thumb.url, { width: 160 })}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  {item.kind !== "image" ? (
                    <span className="bg-chocolate/45 absolute inset-0 grid place-items-center text-white">
                      <Icon name="play" size={22} />
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function Slide({ item, title, priority }: { item: GalleryItem; title: string; priority: boolean }) {
  if (item.kind === "image") return <ZoomImage image={item.image} title={title} priority={priority} />;

  if (item.kind === "video") {
    return (
      <div className="bg-chocolate aspect-square overflow-hidden">
        <video
          className="h-full w-full object-contain"
          controls
          playsInline
          muted
          loop
          preload="metadata"
          poster={item.poster ? shopifyImageUrl(item.poster.url, { width: 1000 }) : undefined}
          aria-label={item.alt || `${title} video`}
        >
          {item.sources.map((source) => (
            <source key={source.url} src={source.url} type={source.mimeType} />
          ))}
        </video>
      </div>
    );
  }

  return (
    <div className="bg-chocolate aspect-square overflow-hidden">
      <iframe
        src={item.embedUrl}
        title={item.alt || `${title} video`}
        className="h-full w-full"
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function ZoomImage({
  image,
  title,
  priority,
}: {
  image: GalleryImage;
  title: string;
  priority: boolean;
}) {
  const canZoom = (image.width ?? 0) >= MIN_ZOOM_SOURCE_WIDTH;
  const imgRef = useRef<HTMLImageElement>(null);
  const [zooming, setZooming] = useState(false);
  const alt = image.altText?.trim() || title;
  const ratio = useMemo(
    () => (image.width && image.height ? image.width / image.height : 1),
    [image.width, image.height],
  );

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!canZoom || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    if (imgRef.current) imgRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  return (
    <div
      className={`bg-white relative aspect-square overflow-hidden ${canZoom ? "lg:cursor-zoom-in" : ""}`}
      onPointerEnter={(event) => canZoom && event.pointerType === "mouse" && setZooming(true)}
      onPointerLeave={() => setZooming(false)}
      onPointerMove={onMove}
    >
      <img
        ref={imgRef}
        src={shopifyImageUrl(image.url, { width: 1000 })}
        srcSet={responsiveSrcSet(image.url, STAGE_WIDTHS, image.width)}
        sizes="(min-width: 1024px) 46vw, 100vw"
        alt={alt}
        width={image.width ?? 1000}
        height={image.height ?? Math.round(1000 / ratio)}
        className={`h-full w-full object-contain motion-safe:transition-transform motion-safe:duration-300 ${
          zooming ? "scale-[2]" : ""
        }`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
      />
      {canZoom ? (
        <span
          aria-hidden="true"
          className="text-chocolate pointer-events-none absolute end-3 bottom-3 hidden size-9 place-items-center rounded-full bg-white/90 shadow-[var(--shadow-sm)] lg:grid"
        >
          <Icon name="zoom" size={18} />
        </span>
      ) : null}
    </div>
  );
}
