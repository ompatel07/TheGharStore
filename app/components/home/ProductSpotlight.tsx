import { useEffect, useRef } from "react";
import { Link } from "react-router";

import { BeforeAfterSlider } from "~/components/ui/BeforeAfterSlider";
import { Icon } from "~/components/ui/Icon";
import { Reveal } from "~/components/ui/Reveal";
import { SectionHeading } from "~/components/ui/SectionHeading";
import type { Spotlight } from "~/lib/home";
import { responsiveSrcSet, shopifyImageUrl } from "~/lib/image";
import { formatPrice } from "~/lib/money";

/**
 * Featured-product storytelling. With 2+ "how to use" steps (product metafield)
 * it becomes a scroll story: the product stays pinned (CSS sticky) while steps
 * scroll past; GSAP ScrollTrigger — loaded only when the section approaches —
 * scrubs a gold progress line and highlights the active step. Mobile and
 * reduced-motion users get the same steps, stacked and static.
 */
export function ProductSpotlight({ spotlight }: { spotlight: Spotlight }) {
  const { product } = spotlight;
  const heading = spotlight.heading ?? product.title;
  const price = product.priceRange.minVariantPrice;
  const image = product.featuredImage ?? product.images.nodes[0] ?? null;
  const story = spotlight.steps.length >= 2;

  return (
    <section
      aria-labelledby="spotlight-title"
      className="bg-surface relative overflow-clip"
    >
      <div className="max-w-page px-margin mx-auto py-20 md:py-28">
        <div className="mb-12 max-w-3xl">
          <SectionHeading id="spotlight-title" kicker="featured find" title={heading} note="see how it works, step by step" />
          {spotlight.intro ? (
            <p className="text-on-surface-secondary mt-3 text-lg">
              {spotlight.intro}
            </p>
          ) : null}
        </div>

        {story ? (
          <SpotlightStory spotlight={spotlight} />
        ) : (
          <div className="grid items-center gap-10 md:grid-cols-2">
            {image ? (
              <Reveal className="surface-card mx-auto w-full max-w-md overflow-hidden p-3">
                <img
                  src={shopifyImageUrl(image.url, { width: 640 })}
                  srcSet={responsiveSrcSet(
                    image.url,
                    [360, 520, 640],
                    image.width,
                  )}
                  sizes="(min-width: 768px) 40vw, 90vw"
                  alt={image.altText || product.title}
                  width={image.width ?? 640}
                  height={image.height ?? 640}
                  className="aspect-square w-full rounded-[1.25rem] object-cover"
                  loading="lazy"
                />
              </Reveal>
            ) : null}
            <Reveal delay={120}>
              {spotlight.highlights.length > 0 ? (
                <ul role="list" className="grid gap-3">
                  {spotlight.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3">
                      <span className="icon-chip bg-white [--chip-size:2.25rem]">
                        <Icon name="check" size={18} strokeWidth={2.25} />
                      </span>
                      <span className="text-on-surface pt-1.5 font-medium">
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : product.description ? (
                <p className="text-on-surface/90 line-clamp-6 text-lg leading-relaxed">
                  {product.description}
                </p>
              ) : null}
              <SpotlightBuy
                handle={product.handle}
                price={formatPrice(price)}
              />
            </Reveal>
          </div>
        )}

        {spotlight.beforeImage && spotlight.afterImage ? (
          <Reveal className="mx-auto mt-14 max-w-3xl">
            <BeforeAfterSlider
              before={spotlight.beforeImage}
              after={spotlight.afterImage}
              caption={spotlight.caption}
            />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

function SpotlightBuy({ handle, price }: { handle: string; price: string }) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-5">
      <Link to={`/products/${handle}`} className="btn btn-dark" prefetch="intent">
        See how it works
        <span className="btn-arrow" aria-hidden="true">
          <Icon name="arrow-right" size={16} strokeWidth={2.5} />
        </span>
      </Link>
      <p className="text-on-surface ed-display text-3xl">{price}</p>
    </div>
  );
}

function SpotlightStory({ spotlight }: { spotlight: Spotlight }) {
  const { product, steps } = spotlight;
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const fallbackImage =
    product.featuredImage ?? product.images.nodes[0] ?? null;
  // Each step gets its own photo: the step's image, else the product's nth photo.
  const stepImage = (step: Spotlight["steps"][number], index: number) =>
    step.image ?? product.images.nodes[index] ?? fallbackImage;

  useEffect(() => {
    const section = sectionRef.current;
    const line = lineRef.current;
    if (!section || !line) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    // Load GSAP only when the story is about to enter the viewport.
    const loader = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        loader.disconnect();
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const context = gsap.context(() => {
          gsap.fromTo(
            line,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top 60%",
                end: "bottom 70%",
                scrub: true,
              },
            },
          );
          const stepEls = section.querySelectorAll<HTMLElement>("[data-step]");
          const images =
            section.querySelectorAll<HTMLElement>("[data-step-image]");
          stepEls.forEach((step, index) => {
            ScrollTrigger.create({
              trigger: step,
              start: "top 62%",
              end: "bottom 62%",
              onToggle: (self) => {
                step.classList.toggle("is-active", self.isActive);
                if (self.isActive) {
                  images.forEach((image, imageIndex) => {
                    gsap.to(image, {
                      opacity: imageIndex === index ? 1 : 0,
                      scale: imageIndex === index ? 1 : 0.96,
                      duration: 0.5,
                      ease: "power2.out",
                    });
                  });
                }
              },
            });
          });
        }, section);
        cleanup = () => context.revert();
      },
      { rootMargin: "400px 0px" },
    );
    loader.observe(section);

    return () => {
      cancelled = true;
      loader.disconnect();
      cleanup?.();
    };
  }, []);

  return (
    <div ref={sectionRef} className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="lg:sticky lg:top-24 lg:h-[min(40rem,calc(100vh-8rem))] lg:self-start">
        <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-[2rem] bg-white shadow-[var(--shadow-xl)] lg:aspect-auto lg:h-full lg:max-w-none">
          {steps.map((step, index) => {
            const image = stepImage(step, index);
            if (!image) return null;
            return (
              <img
                key={step.title}
                data-step-image
                src={shopifyImageUrl(image.url, { width: 900 })}
                srcSet={responsiveSrcSet(image.url, [600, 900, 1200], image.width)}
                sizes="(min-width: 1024px) 42vw, 90vw"
                alt={index === 0 ? image.altText || product.title : ""}
                aria-hidden={index === 0 ? undefined : true}
                className={`absolute inset-0 h-full w-full object-contain ${
                  index === 0 ? "" : "max-lg:hidden lg:opacity-0"
                }`}
                loading="lazy"
              />
            );
          })}
        </div>
      </div>

      <div className="relative">
        <span
          aria-hidden="true"
          className="bg-gold/30 absolute top-2 bottom-2 left-[1.375rem] w-px max-lg:hidden"
        />
        <span
          ref={lineRef}
          aria-hidden="true"
          className="bg-gold absolute top-2 bottom-2 left-[1.375rem] w-0.5 origin-top max-lg:hidden"
        />
        <ol className="relative grid gap-6 lg:gap-[12vh] lg:py-[6vh]">
          {steps.map((step, index) => (
            <li
              key={step.title}
              data-step
              className="spotlight-step flex gap-5 lg:opacity-55 lg:transition-opacity lg:duration-500 lg:[&.is-active]:opacity-100"
            >
              <span className="bg-surface relative z-10 shrink-0 py-1">
                <span className="ed-display ed-italic text-burgundy/35 block w-12 text-5xl leading-none transition-colors duration-500 lg:[.is-active_&]:text-[var(--color-burgundy)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </span>
              <div className="pt-1.5">
                <h3 className="ed-display ed-sm text-on-surface">
                  {step.title}
                </h3>
                {step.body ? (
                  <p className="text-on-surface-secondary mt-2 text-lg leading-relaxed">
                    {step.body}
                  </p>
                ) : null}
                {index > 0 ? <StepPhoto image={stepImage(step, index)} /> : null}
              </div>
            </li>
          ))}
        </ol>
        <SpotlightBuy
          handle={product.handle}
          price={formatPrice(product.priceRange.minVariantPrice)}
        />
      </div>
    </div>
  );
}

function StepPhoto({ image }: { image: { url: string } | null }) {
  if (!image) return null;
  return (
    <img
      src={shopifyImageUrl(image.url, { width: 640 })}
      alt=""
      className="mt-4 aspect-square w-full rounded-2xl bg-white object-contain lg:hidden"
      loading="lazy"
    />
  );
}
