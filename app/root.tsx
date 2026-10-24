import { handleShopifyRedirects, handleShopifyRoutes } from "@shopify/hydrogen";
import { ShopifyScripts } from "@shopify/hydrogen/react";
import type { ComponentProps, ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
  useNavigation,
  useRouteLoaderData,
} from "react-router";

import { CartAnalyticsTracker, PageViewedTracker } from "~/components/AnalyticsTrackers";
import { AnnouncementBar } from "~/components/AnnouncementBar";
import { CartDrawer } from "~/components/CartDrawer";
import { ErrorScreen } from "~/components/ErrorScreen";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { SearchDrawer } from "~/components/SearchDrawer";
import { CartProvider } from "~/lib/cart";
import { cartHandlers } from "~/lib/cart-handlers";
import { createRequestCustomerAccount, customerAccountContext } from "~/lib/customer-account";
import { envContext } from "~/lib/env";
import { predictiveSearchHandlers } from "~/lib/predictive-search-handlers";
import { loadRootLayout } from "~/lib/root-layout";
import { loadSiteContent, type SiteContent } from "~/lib/site-content";
import { routeTemplates } from "~/lib/route-templates";
import { createEphemeralSessionManager } from "~/lib/session";
import { analyticsConsent, resolveShopIdentity, storefrontConfig } from "~/lib/shop";
import type { StorefrontShop } from "~/lib/storefront-shop";
import {
  createRequestStorefrontClient,
  storefrontClientContext,
  storefrontRequestContext,
} from "~/lib/storefront";

import type { Route } from "./+types/root";

import appStylesHref from "./app.css?url";

export const links: Route.LinksFunction = () => [
  {
    rel: "preload",
    href: "/fonts/outfit-latin-var.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  {
    rel: "preload",
    href: "/fonts/dmsans-latin-var.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  { rel: "stylesheet", href: appStylesHref },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

export const middleware: Route.MiddlewareFunction[] = [
  async ({ context, request }, next) => {
    const env = context.get(envContext);
    const storefrontClient = createRequestStorefrontClient(
      request,
      env,
      context.cache,
      context.waitUntil,
    );
    const requestContext = storefrontClient.requestContext;
    const customerAccount = await createRequestCustomerAccount(request, env, requestContext);
    const sessionManager =
      customerAccount?.customerAccount.sessionManager ?? createEphemeralSessionManager(request);

    const shopifyRoute = handleShopifyRoutes({
      request,
      requestContext,
      sessionManager,
      storefrontClient,
      routeTemplates,
      handlers: customerAccount
        ? [cartHandlers, predictiveSearchHandlers, customerAccount.handlers]
        : [cartHandlers, predictiveSearchHandlers],
    });

    if (shopifyRoute) return shopifyRoute;

    context.set(storefrontClientContext, storefrontClient);
    context.set(storefrontRequestContext, requestContext);
    context.set(customerAccountContext, customerAccount?.customerAccount ?? null);

    const response = await next();
    const sessionHeaders = new Headers((await sessionManager.commit?.()) ?? undefined);
    for (const [name, value] of sessionHeaders) response.headers.append(name, value);
    if (response.status === 404) {
      const redirect = await handleShopifyRedirects({
        request,
        storefrontClient,
        routeTemplates,
      });

      if (redirect) return redirect;
    }

    requestContext.applyResponseHeaders(response.headers);
    return response;
  },
];

export async function loader({ context, request }: Route.LoaderArgs) {
  const env = context.get(envContext);
  const storefrontClient = context.get(storefrontClientContext);
  const [cartResult, layout, siteContent] = await Promise.all([
    cartHandlers.get({ storefrontClient, request }),
    loadRootLayout(storefrontClient),
    loadSiteContent(storefrontClient, env.PUBLIC_STORE_DOMAIN),
  ]);

  return {
    cartData: cartResult.data,
    shopInfo: layout.shopInfo,
    shopIdentity: resolveShopIdentity(env, layout.shopId),
    currency: layout.currency,
    siteContent,
  };
}

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  // Absent when the root loader failed (error page only).
  const rootData = useRouteLoaderData<typeof loader>("root");

  return (
    <html lang="en-IN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FFF8EF" />
        {rootData ? (
          <ShopifyScripts
            i18n={{ ...storefrontConfig.i18n, currency: rootData.currency }}
            shop={rootData.shopIdentity.scriptShop}
            analytics={{ channel: rootData.shopIdentity.analyticsShop.channel }}
            shopifyAnalytics={rootData.shopIdentity.shopifyAnalytics}
            consent={analyticsConsent}
            navigate={navigate}
            routes={routeTemplates}
          />
        ) : null}
        <Meta />
        <Links />
      </head>
      <body className="grain bg-surface text-on-surface font-body flex min-h-svh flex-col antialiased">
        <a
          href="#main-content"
          className="focus-visible:bg-interactive focus-visible:text-interactive-text sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:start-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded focus-visible:px-4 focus-visible:py-2"
        >
          Skip to content
        </a>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <SiteShell
      cartData={loaderData.cartData}
      shopInfo={loaderData.shopInfo}
      siteContent={loaderData.siteContent}
    >
      <Outlet />
    </SiteShell>
  );
}

/** Thin terracotta bar while the next page loads (no spinners on content). */
function NavProgress() {
  const navigation = useNavigation();
  if (navigation.state === "idle") return null;
  return <div className="nav-progress" role="progressbar" aria-label="Loading page" />;
}

function SiteShell({
  cartData,
  shopInfo,
  siteContent,
  children,
}: {
  cartData: ComponentProps<typeof CartProvider>["initialData"];
  shopInfo: StorefrontShop;
  siteContent: SiteContent;
  children: ReactNode;
}) {
  return (
    <CartProvider initialData={cartData}>
      <NavProgress />
      <PageViewedTracker />
      <CartAnalyticsTracker />
      <AnnouncementBar
        announcements={siteContent.announcements}
        festive={siteContent.festiveMode}
      />
      <Header mainMenu={siteContent.mainMenu} collections={siteContent.collections} />
      {children}
      <Footer
        shopInfo={shopInfo}
        collections={siteContent.collections}
        footerMenu={siteContent.footerMenu}
        policies={siteContent.policies}
        storeProfile={siteContent.storeProfile}
      />
      <CartDrawer />
      <SearchDrawer />
    </CartProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Present when only a child route failed (e.g. a missing product); then the
  // error page keeps the full header and footer.
  const rootData = useRouteLoaderData<typeof loader>("root");

  let status = 500;
  let details: string | undefined;
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  if (!rootData) {
    return <ErrorScreen status={status} details={details} stack={stack} standalone />;
  }

  return (
    <SiteShell
      cartData={rootData.cartData}
      shopInfo={rootData.shopInfo}
      siteContent={rootData.siteContent}
    >
      <ErrorScreen status={status} details={details} stack={stack} />
    </SiteShell>
  );
}
