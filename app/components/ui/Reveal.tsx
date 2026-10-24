import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type RevealProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Extra delay in ms (for staggering siblings). */
  delay?: number;
  id?: string;
  "aria-labelledby"?: string;
};

/**
 * Soft reveal as a section scrolls into view. Server HTML is fully visible; after
 * mount, only elements still below the fold are "armed" (hidden) and then revealed
 * by an IntersectionObserver. Above-the-fold content never hides, nothing waits on
 * JS, and reduced-motion users see everything immediately (see brand.css).
 */
export function Reveal({ as: Tag = "div", className = "", children, delay = 0, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    element.classList.add("reveal-armed");
    if (delay) element.style.transitionDelay = `${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.classList.add("is-revealed");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
