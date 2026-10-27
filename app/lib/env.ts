import { createContext } from "react-router";

export type Env = {
  MOCK_SHOP?: string;
  PRIVATE_STOREFRONT_API_TOKEN?: string;
  PUBLIC_CHECKOUT_DOMAIN?: string;
  PUBLIC_STORE_DOMAIN?: string;
  PUBLIC_STOREFRONT_ID?: string;
  PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID?: string;
  SESSION_SECRET?: string;
  SHOP_ID?: string;
  /** Judge.me private API token (server only). Enables on-site reviews. */
  JUDGEME_PRIVATE_TOKEN?: string;
  /** Optional: myshopify domain for Judge.me if PUBLIC_STORE_DOMAIN is a custom domain. */
  JUDGEME_SHOP_DOMAIN?: string;
};

export const envContext = createContext<Env>();
