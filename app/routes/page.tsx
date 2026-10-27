import { Cache, gql } from "@shopify/hydrogen";
import { Link, useRouteLoaderData } from "react-router";

import { BRAND_NAME, BRAND_TAGLINE, Logo } from "~/components/Logo";
import { Icon, type IconName } from "~/components/ui/Icon";
import { storefrontClientContext } from "~/lib/storefront";
import type { StoreProfile } from "~/lib/site-content";
import type { loader as rootLoader } from "~/root";

import type { Route } from "./+types/page";

const PAGE_QUERY = gql(`
  query ContentPage($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    page(handle: $handle) {
      id
      handle
      title
      body
      bodySummary
      seo {
        title
        description
      }
    }
  }
`);

export function meta({ data }: Route.MetaArgs) {
  if (!data?.page) return [{ title: `Page not found · ${BRAND_NAME}` }];
  const { page } = data;
  return [
    { title: `${page.seo?.title || page.title} · ${BRAND_NAME}` },
    {
      name: "description",
      content:
        page.seo?.description ||
        (page.bodySummary && page.bodySummary.length >= 70
          ? page.bodySummary
          : `${page.title} · ${BRAND_NAME}. ${page.bodySummary || BRAND_TAGLINE}`),
    },
  ];
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const handle = params.handle;
  if (!handle) throw new Response("Not Found", { status: 404 });
  const storefrontClient = context.get(storefrontClientContext);
  const { data } = await storefrontClient.graphql(PAGE_QUERY, {
    variables: { handle },
    cache: Cache.long(),
  });
  if (!data?.page) throw new Response("Not Found", { status: 404 });
  return { page: data.page };
}

export default function PageRoute({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const profile = rootData?.siteContent.storeProfile ?? null;
  const isContact = page.handle === "contact";
  const isAbout = page.handle === "about" || page.handle === "about-us";
  const hasBody = page.body.replace(/<[^>]*>/g, "").trim().length > 0;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="max-w-page px-margin mx-auto w-full flex-1 py-8 md:py-12"
    >
      <header className="bg-cream-deep curve-bottom relative overflow-hidden rounded-t-[var(--radius-xl)] px-6 pt-10 pb-14 text-center md:pt-14 md:pb-20">
        {isAbout ? <Logo height={96} className="mx-auto mb-4" /> : null}
        <p className="type-hand text-terracotta-deep text-2xl">
          {isContact
            ? "baat karte hain"
            : isAbout
              ? BRAND_TAGLINE.toLowerCase()
              : BRAND_NAME}
        </p>
        <h1 className="type-heading-xl text-on-surface mx-auto mt-1 max-w-3xl text-[clamp(2rem,1.4rem+2vw,3.2rem)]">
          {page.title}
        </h1>
      </header>

      <div className="mx-auto mt-10 max-w-3xl">
        {isContact ? <ContactOptions profile={profile} /> : null}
        {hasBody ? (
          <div
            className="prose-ghar mt-8 rounded-[var(--radius-xl)] bg-white p-6 text-lg shadow-[var(--shadow-sm)] md:p-10"
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        ) : null}
        {isContact ? <GrievanceDetails profile={profile} /> : null}
      </div>
    </main>
  );
}

function ContactOptions({ profile }: { profile: StoreProfile | null }) {
  const options: {
    icon: IconName;
    title: string;
    text: string;
    href?: string;
    external?: boolean;
  }[] = [];
  if (profile?.whatsappNumber) {
    options.push({
      icon: "whatsapp",
      title: "WhatsApp",
      text: profile.whatsappNumber,
      href: `https://wa.me/${profile.whatsappNumber.replace(/\D/g, "")}`,
      external: true,
    });
  }
  if (profile?.supportPhone) {
    options.push({
      icon: "phone",
      title: "Call us",
      text: profile.supportPhone,
      href: `tel:${profile.supportPhone.replace(/[^+\d]/g, "")}`,
    });
  }
  if (profile?.supportEmail) {
    options.push({
      icon: "mail",
      title: "Email",
      text: profile.supportEmail,
      href: `mailto:${profile.supportEmail}`,
    });
  }
  if (profile?.supportHours)
    options.push({ icon: "clock", title: "Hours", text: profile.supportHours });
  if (profile?.registeredAddress)
    options.push({
      icon: "map-pin",
      title: "Address",
      text: profile.registeredAddress,
    });

  if (options.length === 0) {
    return (
      <p className="text-on-surface-secondary rounded-[var(--radius-xl)] bg-white p-6 text-center shadow-[var(--shadow-sm)]">
        Our contact details are being updated. Please check back shortly.
      </p>
    );
  }

  return (
    <ul role="list" className="grid gap-4 sm:grid-cols-2">
      {options.map((option) => {
        const body = (
          <>
            <span className="icon-chip [--chip-size:3rem]">
              <Icon name={option.icon} size={24} />
            </span>
            <span className="min-w-0">
              <span className="text-on-surface block font-bold">
                {option.title}
              </span>
              <span className="text-on-surface-secondary block break-words whitespace-pre-line">
                {option.text}
              </span>
            </span>
          </>
        );
        return (
          <li key={option.title}>
            {option.href ? (
              <a
                href={option.href}
                rel={option.external ? "noopener" : undefined}
                className="surface-card flex h-full items-start gap-4 p-5 motion-safe:transition-transform motion-safe:hover:-translate-y-0.5"
              >
                {body}
              </a>
            ) : (
              <div className="surface-card flex h-full items-start gap-4 p-5">
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function GrievanceDetails({ profile }: { profile: StoreProfile | null }) {
  const officer = profile?.grievanceOfficer;
  if (!officer) return null;
  return (
    <section
      aria-labelledby="grievance-title"
      className="mt-8 rounded-[var(--radius-xl)] p-6 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-gold)_50%,transparent)]"
    >
      <h2 id="grievance-title" className="type-heading-md text-on-surface">
        Grievance officer
      </h2>
      <p className="text-on-surface-secondary mt-1 text-sm">
        As required under the Consumer Protection (E-Commerce) Rules, 2020.
      </p>
      <p className="text-on-surface mt-3 font-semibold">
        {officer.name}
        {officer.designation ? `, ${officer.designation}` : ""}
      </p>
      {officer.email ? (
        <p>
          <a
            href={`mailto:${officer.email}`}
            className="text-burgundy underline underline-offset-4"
          >
            {officer.email}
          </a>
        </p>
      ) : null}
      {officer.phone ? <p>{officer.phone}</p> : null}
      <Link
        to="/policies"
        className="text-burgundy mt-3 inline-flex min-h-11 items-center font-semibold"
      >
        Read our policies
      </Link>
    </section>
  );
}
