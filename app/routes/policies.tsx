import { Link } from "react-router";

import { BRAND_NAME } from "~/components/Logo";
import { Icon, type IconName } from "~/components/ui/Icon";
import { loadPolicies } from "~/lib/policies";
import { storefrontClientContext } from "~/lib/storefront";

import type { Route } from "./+types/policies";

export function meta() {
  return [
    { title: `Policies · ${BRAND_NAME}` },
    {
      name: "description",
      content: `Shipping, returns, privacy and terms at ${BRAND_NAME}.`,
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  return { policies: await loadPolicies(context.get(storefrontClientContext)) };
}

const POLICY_ICON: [RegExp, IconName][] = [
  [/shipping/, "truck"],
  [/refund|return/, "refund"],
  [/privacy/, "shield"],
  [/terms/, "box"],
];

export default function PoliciesRoute({ loaderData }: Route.ComponentProps) {
  const { policies } = loaderData;
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="max-w-page px-margin mx-auto w-full flex-1 py-8 md:py-12"
    >
      <header className="mb-8">
        <p className="type-hand text-terracotta-deep text-2xl">saaf baat</p>
        <h1 className="type-heading-xl text-on-surface text-[clamp(2rem,1.4rem+2vw,3rem)]">
          Our policies
        </h1>
      </header>
      {policies.length === 0 ? (
        <p className="text-on-surface-secondary">
          Policies will be published here soon.
        </p>
      ) : (
        <ul role="list" className="grid gap-5 sm:grid-cols-2">
          {policies.map((policy) => (
            <li key={policy.id}>
              <Link
                to={`/policies/${policy.handle}`}
                className="surface-card group flex items-center gap-4 p-6 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
              >
                <span className="icon-chip [--chip-size:3.25rem]">
                  <Icon
                    name={
                      POLICY_ICON.find(([pattern]) =>
                        pattern.test(policy.handle),
                      )?.[1] ?? "sparkle"
                    }
                    size={26}
                  />
                </span>
                <span className="text-on-surface flex-1 text-lg font-bold">
                  {policy.title}
                </span>
                <Icon name="arrow-right" size={20} className="text-burgundy" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
