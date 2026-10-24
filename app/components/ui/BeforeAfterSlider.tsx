import { useCallback, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { Icon } from "~/components/ui/Icon";
import { shopifyImageUrl } from "~/lib/image";

type SliderImage = { url: string; altText: string | null; width: number | null; height: number | null };

type BeforeAfterSliderProps = {
  before: SliderImage;
  after: SliderImage;
  caption?: string | null;
  className?: string;
  /** Rendered width hint for the CDN (px). */
  width?: number;
};

/**
 * Drag / swipe / keyboard before-after comparison. Rendered only when BOTH images
 * come from product metafields (never stock or supplier collages). The divider is
 * a real `role="slider"`, so arrow keys, Home/End and screen readers work. The
 * "after" layer is revealed with clip-path (no layout work while dragging).
 */
export function BeforeAfterSlider({
  before,
  after,
  caption,
  className = "",
  width = 900,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const captionId = useId();

  const setFromClientX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, next)));
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromClientX(event.clientX);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) setFromClientX(event.clientX);
  };
  const onPointerUp = () => {
    draggingRef.current = false;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") setPosition((p) => Math.max(0, p - step));
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") setPosition((p) => Math.min(100, p + step));
    else if (event.key === "Home") setPosition(0);
    else if (event.key === "End") setPosition(100);
    else return;
    event.preventDefault();
  };

  return (
    <figure className={className}>
      <div
        ref={containerRef}
        className="bg-cream-deep relative aspect-[4/3] touch-pan-y overflow-hidden rounded-[var(--radius-lg)] select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          src={shopifyImageUrl(before.url, { width })}
          alt={before.altText || "Before"}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
          loading="lazy"
        />
        <img
          src={shopifyImageUrl(after.url, { width })}
          alt={after.altText || "After"}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
          draggable={false}
          loading="lazy"
        />

        <span className="bg-chocolate/85 text-cream absolute start-3 top-3 rounded-full px-3 py-1 text-sm font-bold">
          Before
        </span>
        <span className="bg-terracotta-deep absolute end-3 top-3 rounded-full px-3 py-1 text-sm font-bold text-white">
          After
        </span>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Before and after comparison"
          aria-describedby={caption ? captionId : undefined}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${Math.round(100 - position)}% after`}
          onKeyDown={onKeyDown}
          className="absolute inset-y-0 -ms-px w-0.5 cursor-ew-resize bg-white shadow-[0_0_0_1px_rgb(56_44_42/0.15)] outline-none"
          style={{ left: `${position}%` }}
        >
          <span className="bg-cream text-chocolate absolute top-1/2 left-1/2 inline-flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-[var(--shadow)] ring-2 ring-white [div:focus-visible>&]:ring-[var(--color-burgundy)]">
            <Icon name="chevron-left" size={16} strokeWidth={2.25} />
            <Icon name="chevron-right" size={16} strokeWidth={2.25} />
          </span>
        </div>
      </div>
      {caption ? (
        <figcaption id={captionId} className="text-on-surface-secondary mt-2 text-sm">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
