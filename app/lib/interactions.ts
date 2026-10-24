// Small pointer-driven interactions. All are client-only, transform-only, and
// switch off for touch-only devices and prefers-reduced-motion.
import { useEffect, useRef } from "react";

function finePointerAndMotionOk() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** 3D tilt toward the pointer. Sets --rx / --ry on the element (see .tilt). */
export function useTilt<T extends HTMLElement>(max = 6) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !finePointerAndMotionOk()) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        element.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
        element.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      element.style.setProperty("--rx", "0deg");
      element.style.setProperty("--ry", "0deg");
    };
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
    };
  }, [max]);
  return ref;
}

/** Magnetic pull toward the pointer. Sets --mx / --my (see .magnetic). */
export function useMagnetic<T extends HTMLElement>(strength = 0.25) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !finePointerAndMotionOk()) return;
    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      element.style.setProperty("--mx", `${(x * strength).toFixed(1)}px`);
      element.style.setProperty("--my", `${(y * strength).toFixed(1)}px`);
    };
    const onLeave = () => {
      element.style.setProperty("--mx", "0px");
      element.style.setProperty("--my", "0px");
    };
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);
  return ref;
}

/** Layered pointer parallax: children with [data-depth] move by depth × px. */
export function useParallaxLayers<T extends HTMLElement>(range = 18) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || !finePointerAndMotionOk()) return;
    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-depth]"));
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        for (const layer of layers) {
          const depth = Number(layer.dataset.depth ?? 0);
          layer.style.translate = `${(-x * range * depth).toFixed(1)}px ${(-y * range * depth).toFixed(1)}px`;
        }
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [range]);
  return ref;
}
