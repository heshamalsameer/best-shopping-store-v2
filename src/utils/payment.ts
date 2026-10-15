export const DECLINED_TEST_CARD = "4000000000000002";

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function luhn(num: string) {
  const digits = onlyDigits(num);
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return digits.length >= 13 && sum % 10 === 0;
}

export function cardBrand(num: string) {
  const n = onlyDigits(num);
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^6/.test(n)) return "Discover";
  return "Card";
}

export function formatCardNumber(v: string) {
  return onlyDigits(v).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiry(v: string) {
  const d = onlyDigits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export type CardInput = { number: string; expiry: string; cvc: string; name: string };

export function validateCard(card: CardInput): string | null {
  if (!card.name || card.name.trim().length < 2) return "Enter the name on the card";
  if (!luhn(card.number)) return "Card number is not valid";
  const [mm, yy] = card.expiry.split("/").map((x) => parseInt(x, 10));
  if (!mm || mm < 1 || mm > 12 || yy === undefined || Number.isNaN(yy)) return "Expiry date should be MM/YY";
  const now = new Date();
  const exp = new Date(2000 + yy, mm, 0, 23, 59, 59);
  if (exp < now) return "This card has expired";
  if (!/^\d{3,4}$/.test(card.cvc)) return "CVC should be 3 or 4 digits";
  return null;
}
