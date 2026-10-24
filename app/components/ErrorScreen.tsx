import { Link } from "react-router";

import { Logo } from "~/components/Logo";
import { Icon } from "~/components/ui/Icon";

type ErrorScreenProps = {
  status: number;
  /** Developer details, only passed in development. */
  details?: string;
  stack?: string;
  /** Show the logo (when the page renders without the site header). */
  standalone?: boolean;
};

export function ErrorScreen({ status, details, stack, standalone = false }: ErrorScreenProps) {
  const notFound = status === 404;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="max-w-page px-margin mx-auto flex w-full flex-1 flex-col items-center py-16 text-center md:py-24"
    >
      {standalone ? <Logo height={96} className="mb-10" /> : null}

      <div className="relative mb-8 grid place-items-center">
        <span
          aria-hidden="true"
          className="bg-peach-soft absolute size-40 rounded-full shadow-[inset_0_0_0_1px_var(--color-gold)]"
        />
        <Icon
          name={notFound ? "home" : "sparkle"}
          size={72}
          strokeWidth={1.4}
          className="text-terracotta-deep relative"
        />
      </div>

      <p className="type-overline text-burgundy">{notFound ? "Error 404" : `Error ${status}`}</p>
      <h1 className="type-heading-xl text-on-surface mt-3 max-w-xl">
        {notFound ? "This room seems to be empty" : "Something went wrong on our side"}
      </h1>
      <p className="text-on-surface-secondary mt-4 max-w-md text-lg">
        {notFound
          ? "The page you’re looking for has moved or doesn’t exist. Let’s get you back home."
          : "Please refresh the page or try again in a minute. Your cart is safe."}
      </p>
      <p className="type-hand text-terracotta-deep mt-3 text-xl" aria-hidden="true">
        {notFound ? "chalo, ghar chalte hain!" : "thoda sa intezaar…"}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="button-cta">
          <Icon name="home" size={20} />
          Back to home
        </Link>
        <Link
          to="/collections"
          className="button-outline border-burgundy text-burgundy hover:bg-peach-soft inline-flex items-center gap-2 border-2"
        >
          Browse categories
        </Link>
      </div>

      {details ? (
        <p className="text-critical mt-10 max-w-2xl text-sm">{details}</p>
      ) : null}
      {stack ? (
        <pre className="border-border mt-4 w-full max-w-3xl overflow-x-auto rounded-2xl border bg-white p-4 text-start text-xs">
          <code>{stack}</code>
        </pre>
      ) : null}
    </main>
  );
}
