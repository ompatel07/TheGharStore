import { Link } from "react-router";

import { BRAND_NAME } from "~/components/Logo";
import { Icon } from "~/components/ui/Icon";
import { loadPolicies } from "~/lib/policies";
import { storefrontClientContext } from "~/lib/storefront";

import type { Route } from "./+types/policy";

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: `Policy not found · ${BRAND_NAME}` }];
  return [{ title: `${data.policy.title} · ${BRAND_NAME}` }];
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const policies = await loadPolicies(context.get(storefrontClientContext));
  const policy = policies.find(
    (candidate) => candidate.handle === params.handle,
  );
  if (!policy) throw new Response("Not Found", { status: 404 });
  return {
    policy,
    others: policies.filter((candidate) => candidate.handle !== policy.handle),
  };
}

export default function PolicyRoute({ loaderData }: Route.ComponentProps) {
  const { policy, others } = loaderData;
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="max-w-page px-margin mx-auto w-full flex-1 py-8 md:py-12"
    >
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="text-on-surface-secondary flex items-center gap-1.5 text-sm">
          <li>
            <Link to="/" className="hover:text-burgundy">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevron-right" size={14} />
          </li>
          <li>
            <Link to="/policies" className="hover:text-burgundy">
              Policies
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevron-right" size={14} />
          </li>
          <li aria-current="page" className="text-on-surface font-medium">
            {policy.title}
          </li>
        </ol>
      </nav>
      <div className="grid gap-8 lg:grid-cols-[1fr_16rem]">
        <article className="rounded-[var(--radius-xl)] bg-white p-6 shadow-[var(--shadow-sm)] md:p-10">
          <h1 className="type-heading-xl text-on-surface mb-6">
            {policy.title}
          </h1>
          <div
            className="prose-ghar max-w-prose"
            dangerouslySetInnerHTML={{ __html: policy.body }}
          />
        </article>
        {others.length > 0 ? (
          <aside
            aria-label="Other policies"
            className="lg:sticky lg:top-20 lg:self-start"
          >
            <h2 className="type-overline text-on-surface-secondary mb-3">
              Other policies
            </h2>
            <ul role="list" className="grid gap-2">
              {others.map((other) => (
                <li key={other.id}>
                  <Link
                    to={`/policies/${other.handle}`}
                    className="hover:bg-peach-soft flex min-h-11 items-center justify-between rounded-2xl bg-white px-4 font-semibold shadow-[var(--shadow-sm)]"
                  >
                    {other.title}
                    <Icon name="chevron-right" size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </main>
  );
}
