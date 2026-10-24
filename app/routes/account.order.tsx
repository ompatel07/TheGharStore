import { gql } from "@shopify/hydrogen/customer-account";
import { Link } from "react-router";

import { BRAND_NAME } from "~/components/Logo";
import { Icon } from "~/components/ui/Icon";
import { customerAccountContext } from "~/lib/customer-account";
import { shopifyImageUrl } from "~/lib/image";
import { formatPrice } from "~/lib/money";

import type { Route } from "./+types/account.order";

const ORDER_QUERY = gql(`
  query AccountOrder($id: ID!) {
    order(id: $id) {
      id
      name
      processedAt
      cancelledAt
      financialStatus
      fulfillmentStatus
      statusPageUrl
      subtotal {
        amount
        currencyCode
      }
      totalShipping {
        amount
        currencyCode
      }
      totalTax {
        amount
        currencyCode
      }
      totalPrice {
        amount
        currencyCode
      }
      shippingAddress {
        name
        formatted(withName: false)
      }
      fulfillments(first: 5) {
        nodes {
          status
          latestShipmentStatus
          trackingInformation {
            company
            number
            url
          }
        }
      }
      lineItems(first: 50) {
        nodes {
          title
          variantTitle
          quantity
          image {
            url
            altText
          }
          totalPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`);

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
});

function label(value: string | null | undefined) {
  return value
    ? value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase())
    : null;
}

export function meta({ data }: Route.MetaArgs) {
  const name = data && "order" in data ? data.order.name : "Order";
  return [
    { title: `${name} · ${BRAND_NAME}` },
    { name: "robots", content: "noindex" },
  ];
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const customerAccount = context.get(customerAccountContext);
  if (!customerAccount) throw new Response("Not Found", { status: 404 });

  const { client, session, sessionManager, requestContext } = customerAccount;
  const accessToken = await session.getOrRefreshAccessToken(
    sessionManager,
    requestContext,
  );
  if (!accessToken) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/account/login?return_to=${encodeURIComponent(`/account/orders/${params.id}`)}`,
      },
    });
  }

  const id = params.id?.startsWith("gid://")
    ? params.id
    : `gid://shopify/Order/${params.id}`;
  const { data, errors } = await client.graphql(ORDER_QUERY, {
    accessToken,
    variables: { id },
  });
  if (errors || !data.order) throw new Response("Not Found", { status: 404 });
  return { order: data.order };
}

export default function AccountOrderRoute({
  loaderData,
}: Route.ComponentProps) {
  const { order } = loaderData;
  const tracking = order.fulfillments.nodes.flatMap(
    (fulfillment) => fulfillment.trackingInformation,
  );

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="max-w-page px-margin mx-auto w-full flex-1 py-10"
    >
      <Link
        to="/account"
        className="text-burgundy inline-flex min-h-11 items-center gap-1.5 font-semibold"
      >
        <Icon name="chevron-left" size={18} />
        My account
      </Link>
      <header className="mt-2 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-heading-xl text-on-surface">
            Order {order.name}
          </h1>
          <p className="text-on-surface-secondary mt-1">
            Placed on {dateFormat.format(new Date(order.processedAt))}
            {order.cancelledAt ? " · Cancelled" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {label(order.financialStatus) ? (
            <span className="bg-peach-soft text-chocolate rounded-full px-3 py-1 text-sm font-semibold">
              {label(order.financialStatus)}
            </span>
          ) : null}
          {label(order.fulfillmentStatus) ? (
            <span className="bg-cream-deep text-chocolate rounded-full px-3 py-1 text-sm font-semibold">
              {label(order.fulfillmentStatus)}
            </span>
          ) : null}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <section
          aria-label="Items"
          className="rounded-[var(--radius-xl)] bg-white px-5 shadow-[var(--shadow-sm)]"
        >
          <ul
            role="list"
            className="divide-y divide-[color-mix(in_oklab,var(--color-gold)_35%,transparent)]"
          >
            {order.lineItems.nodes.map((item, index) => (
              <li
                key={`${item.title}-${index}`}
                className="flex items-center gap-4 py-4"
              >
                <div className="bg-cream-deep size-16 shrink-0 overflow-hidden rounded-xl">
                  {item.image ? (
                    <img
                      src={shopifyImageUrl(item.image.url, { width: 128 })}
                      alt={item.image.altText || item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-on-surface font-semibold">{item.title}</p>
                  <p className="text-on-surface-secondary text-sm">
                    {item.variantTitle && item.variantTitle !== "Default Title"
                      ? `${item.variantTitle} · `
                      : ""}
                    Qty {item.quantity}
                  </p>
                </div>
                {item.totalPrice ? (
                  <p className="font-bold">{formatPrice(item.totalPrice)}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <aside
          className="bg-cream-deep grid gap-6 rounded-[var(--radius-xl)] p-6"
          aria-label="Order summary"
        >
          <dl className="grid gap-1.5">
            {order.subtotal ? (
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{formatPrice(order.totalShipping)}</dd>
            </div>
            {order.totalTax ? (
              <div className="flex justify-between">
                <dt>Tax</dt>
                <dd>{formatPrice(order.totalTax)}</dd>
              </div>
            ) : null}
            <div className="mt-2 flex justify-between text-lg font-bold">
              <dt>Total</dt>
              <dd>{formatPrice(order.totalPrice)}</dd>
            </div>
          </dl>
          {order.shippingAddress ? (
            <div>
              <h2 className="type-overline text-on-surface-secondary mb-1">
                Shipping to
              </h2>
              <p className="font-semibold">{order.shippingAddress.name}</p>
              <p className="text-on-surface-secondary text-sm">
                {order.shippingAddress.formatted.join(", ")}
              </p>
            </div>
          ) : null}
          {tracking.length > 0 ? (
            <div>
              <h2 className="type-overline text-on-surface-secondary mb-1">
                Tracking
              </h2>
              <ul role="list" className="grid gap-1">
                {tracking.map((info) => (
                  <li key={info.number ?? info.url ?? info.company}>
                    {info.url ? (
                      <a
                        href={info.url}
                        rel="noopener"
                        className="text-burgundy font-semibold underline"
                      >
                        {info.company ?? "Track"} {info.number}
                      </a>
                    ) : (
                      <span>
                        {info.company} {info.number}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <a
            href={order.statusPageUrl}
            rel="noopener"
            className="button-cta w-full"
          >
            View order status
          </a>
        </aside>
      </div>
    </main>
  );
}
