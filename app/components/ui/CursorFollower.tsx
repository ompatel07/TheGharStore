import { useEffect, useRef } from "react";

/**
 * A soft ring that trails the mouse and grows into a label ("View", "Shop")
 * over anything marked `data-cursor="…"`. The system cursor stays visible —
 * this is decoration, not a replacement. Desktop (fine pointer) only, off
 * under reduced motion; one rAF loop that sleeps when the ring is at rest.
 */
export function CursorFollower() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    const labelElement = labelRef.current;
    if (!element || !labelElement) return;
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    let x = -100;
    let y = -100;
    let targetX = -100;
    let targetY = -100;
    let frame = 0;
    let label: string | null = null;

    const loop = () => {
      x += (targetX - x) * 0.22;
      y += (targetY - y) * 0.22;
      element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      targetX = event.clientX;
      targetY = event.clientY;
      element.dataset.on = "true";
      if (!frame) frame = requestAnimationFrame(loop);
      const target = (event.target as Element | null)?.closest?.("[data-cursor]");
      const next = target?.getAttribute("data-cursor") ?? null;
      if (next !== label) {
        label = next;
        element.dataset.label = next ? "true" : "false";
        if (next) labelElement.textContent = next;
      }
    };
    const onLeave = () => {
      element.dataset.on = "false";
    };
    const onDown = () => {
      element.dataset.press = "true";
    };
    const onUp = () => {
      element.dataset.press = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div ref={ref} className="cursor" aria-hidden="true">
      <span className="cursor-dot">
        <span ref={labelRef} className="cursor-label" />
      </span>
    </div>
  );
}
