export const PRODUCT_PER_PAGE = 6;

const VERCEL_DOMAIN = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;

export const DOMAIN =
  process.env.NEXT_PUBLIC_DOMAIN ||
  (VERCEL_DOMAIN ? `https://${VERCEL_DOMAIN}` : "http://localhost:3000");

export const SHIPPING_FEE = 5;
export const FREE_SHIPPING_OVER = 100;
export const MAX_QTY = 10;

export const COUPONS: Record<string, number> = {
  WELCOME10: 10,
  DEV20: 20,
};

export const DEMO_ACCOUNTS = [
  { label: "Customer", email: "demo@bestshopping.dev", password: "demo1234" },
  { label: "Admin", email: "admin@gmail.com", password: "123456" },
];
