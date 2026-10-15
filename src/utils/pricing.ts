import { COUPONS, FREE_SHIPPING_OVER, SHIPPING_FEE } from "./constants";

export type PricedLine = { price: string | number; quantity: number };

const round = (n: number) => Math.round(n * 100) / 100;

export const toNumber = (price: string | number) => {
  const n = typeof price === "number" ? price : parseFloat(String(price).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const formatPrice = (n: string | number) => `$${toNumber(n).toFixed(2).replace(/\.00$/, "")}`;

export function computeTotals(lines: PricedLine[], couponCode?: string | null) {
  const subtotal = round(lines.reduce((s, l) => s + toNumber(l.price) * l.quantity, 0));
  const code = couponCode?.trim().toUpperCase() || "";
  const percent = code && COUPONS[code] ? COUPONS[code] : 0;
  const discount = round((subtotal * percent) / 100);
  const shipping = subtotal === 0 || subtotal - discount >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const total = round(subtotal - discount + shipping);
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  return { subtotal, discount, shipping, total, count, coupon: percent ? code : null, percent };
}
