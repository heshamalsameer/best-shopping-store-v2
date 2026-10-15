"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { FiCreditCard, FiDollarSign, FiLock, FiInfo } from "react-icons/fi";
import { CartLine } from "@/utils/types";
import { computeTotals, formatPrice, toNumber } from "@/utils/pricing";
import { cardBrand, formatCardNumber, formatExpiry, onlyDigits, validateCard } from "@/utils/payment";
import { DOMAIN } from "@/utils/constants";
import { AppDispatch } from "@/app/store/store";
import { clearCart } from "@/app/store/cart";
import ButtonSpinner from "../ButtonSpinner";

interface Props {
  lines: CartLine[];
  initialCoupon: string;
  username: string;
}

type Errors = Partial<Record<"fullName" | "phone" | "city" | "address" | "card", string>>;

const inputCls = (err?: string) =>
  `w-full border-2 rounded-lg p-2.5 text-lg outline-none transition bg-white ${err ? "border-red-500" : "border-gray-300 focus:border-blue-600"}`;

const CheckoutForm = ({ lines, initialCoupon, username }: Props) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState({ fullName: "", phone: "", city: "", address: "", notes: "" });
  const [method, setMethod] = useState<"CARD" | "CASH">("CARD");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const totals = useMemo(
    () => computeTotals(lines.map((l) => ({ price: l.product?.price ?? l.price, quantity: l.quantity })), initialCoupon),
    [lines, initialCoupon]
  );
  const brand = cardBrand(card.number);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const e: Errors = {};
    if (form.fullName.trim().length < 2) e.fullName = "Full name is required";
    if (!/^[+\d][\d\s-]{6,20}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    if (form.city.trim().length < 2) e.city = "City is required";
    if (form.address.trim().length < 5) e.address = "Street, building and apartment";
    if (method === "CARD") {
      const c = validateCard({ ...card, number: onlyDigits(card.number) });
      if (c) e.card = c;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please check the highlighted fields");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${DOMAIN}/api/orders`, {
        ...form,
        coupon: initialCoupon || undefined,
        paymentMethod: method,
        card: method === "CARD" ? { ...card, number: onlyDigits(card.number) } : undefined,
      });
      dispatch(clearCart());
      router.push(`/orders/${res.data.id}?placed=1`);
      router.refresh();
    } catch (error: any) {
      const msg = error?.response?.data.message || "Payment failed, please try again";
      if (method === "CARD" && error?.response?.status === 402) setErrors({ card: msg });
      toast.error(msg);
      setLoading(false);
    }
  };

  const fill = (n: string) => setCard({ number: formatCardNumber(n), expiry: "12/30", cvc: "123", name: card.name || form.fullName || username });

  return (
    <section className="container fix-height m-auto px-5 py-8">
      <Link href="/carts" className="text-blue-700 font-semibold hover:underline">← Back to cart</Link>
      <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-6">Checkout</h1>

      <form onSubmit={submit} noValidate className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="space-y-6">
          <fieldset className="fade-up bg-white rounded-lg border-2 border-gray-300 p-5">
            <legend className="sr-only">Shipping details</legend>
            <h2 className="text-xl font-bold text-gray-900 mb-4"><span className="text-blue-700">1.</span> Shipping details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Full name</span>
                <input className={inputCls(errors.fullName)} value={form.fullName} onChange={set("fullName")} autoComplete="name" placeholder="Sara Ahmad" />
                {errors.fullName && <span className="text-red-600 text-sm">{errors.fullName}</span>}
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Phone</span>
                <input className={inputCls(errors.phone)} value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="+965 5000 0000" />
                {errors.phone && <span className="text-red-600 text-sm">{errors.phone}</span>}
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">City</span>
                <input className={inputCls(errors.city)} value={form.city} onChange={set("city")} autoComplete="address-level2" placeholder="Kuwait City" />
                {errors.city && <span className="text-red-600 text-sm">{errors.city}</span>}
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Address</span>
                <input className={inputCls(errors.address)} value={form.address} onChange={set("address")} autoComplete="street-address" placeholder="Block 3, Street 12, House 7" />
                {errors.address && <span className="text-red-600 text-sm">{errors.address}</span>}
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-gray-700">Delivery notes <span className="font-normal text-gray-500">(optional)</span></span>
                <textarea className={`${inputCls()} resize-none`} rows={2} value={form.notes} onChange={set("notes")} placeholder="Call me when you arrive" />
              </label>
            </div>
          </fieldset>

          <fieldset className="fade-up bg-white rounded-lg border-2 border-gray-300 p-5" style={{ ["--i" as string]: 1 }}>
            <legend className="sr-only">Payment</legend>
            <h2 className="text-xl font-bold text-gray-900 mb-4"><span className="text-blue-700">2.</span> Payment</h2>
            <div className="grid sm:grid-cols-2 gap-3" role="radiogroup">
              {[
                { v: "CARD" as const, icon: FiCreditCard, title: "Card payment", text: "Visa, Mastercard, Amex" },
                { v: "CASH" as const, icon: FiDollarSign, title: "Cash on delivery", text: "Pay when it arrives" },
              ].map((o) => (
                <button
                  type="button"
                  key={o.v}
                  role="radio"
                  aria-checked={method === o.v}
                  onClick={() => { setMethod(o.v); setErrors((er) => ({ ...er, card: undefined })); }}
                  className={`flex items-center gap-3 text-left p-4 rounded-lg border-2 transition ${method === o.v ? "border-blue-600 bg-blue-50" : "border-gray-300 hover:border-gray-500"}`}
                >
                  <span className={`w-5 h-5 rounded-full border-2 grid place-items-center ${method === o.v ? "border-blue-600" : "border-gray-400"}`}>
                    {method === o.v && <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                  </span>
                  <o.icon className="text-2xl text-gray-700" />
                  <span>
                    <strong className="block text-gray-900">{o.title}</strong>
                    <span className="text-sm text-gray-600">{o.text}</span>
                  </span>
                </button>
              ))}
            </div>

            {method === "CARD" ? (
              <div className="mt-5 fade-up">
                <div className="grid sm:grid-cols-[1fr_120px_100px] gap-3">
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Card number</span>
                    <div className="relative">
                      <input
                        className={`${inputCls(errors.card)} pr-24 tracking-wider`}
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="4242 4242 4242 4242"
                        value={card.number}
                        onChange={(e) => { setCard({ ...card, number: formatCardNumber(e.target.value) }); setErrors((er) => ({ ...er, card: undefined })); }}
                      />
                      {card.number && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-800">{brand}</span>}
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Expiry</span>
                    <input className={inputCls(errors.card)} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">CVC</span>
                    <input className={inputCls(errors.card)} inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} value={card.cvc} onChange={(e) => setCard({ ...card, cvc: onlyDigits(e.target.value).slice(0, 4) })} />
                  </label>
                  <label className="block sm:col-span-3">
                    <span className="text-sm font-semibold text-gray-700">Name on card</span>
                    <input className={inputCls()} autoComplete="cc-name" placeholder="SARA AHMAD" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
                  </label>
                </div>
                {errors.card && <p className="text-red-600 text-sm mt-2">{errors.card}</p>}
                <div className="mt-4 rounded-lg bg-[#eef3f8] border-2 border-[#b4cadc] p-3 text-sm text-gray-700">
                  <p className="flex items-center gap-2 font-semibold text-gray-900"><FiInfo /> Demo payment — no real money is charged</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button type="button" onClick={() => fill("4242424242424242")} className="px-2 py-1 rounded border border-gray-400 bg-white hover:border-blue-600 font-mono">4242 4242 4242 4242 · approved</button>
                    <button type="button" onClick={() => fill("4000000000000002")} className="px-2 py-1 rounded border border-gray-400 bg-white hover:border-blue-600 font-mono">4000 0000 0000 0002 · declined</button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-gray-700 fade-up">You’ll pay <strong>{formatPrice(totals.total)}</strong> in cash when the courier arrives. Your order starts as <em>Pending</em> until it is confirmed.</p>
            )}
          </fieldset>
        </div>

        <aside className="fade-up bg-white rounded-lg border-2 border-gray-300 p-5 lg:sticky lg:top-5" style={{ ["--i" as string]: 2 }}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your order</h2>
          <ul className="space-y-3 max-h-72 overflow-auto pr-1">
            {lines.map((l) => {
              const price = l.product?.price ?? l.price;
              return (
                <li key={l.id} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <Image src={l.product?.image ?? l.image} alt="" width={56} height={56} className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                    <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-gray-700 text-white text-xs grid place-items-center">{l.quantity}</span>
                  </div>
                  <span className="flex-1 min-w-0 font-semibold text-gray-800 line-clamp-1">{l.product?.title ?? l.title}</span>
                  <span className="font-semibold text-gray-900">{formatPrice(toNumber(price) * l.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <dl className="space-y-2 text-gray-700 border-t-2 border-gray-200 mt-4 pt-4">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-semibold text-gray-900">{formatPrice(totals.subtotal)}</dd></div>
            {totals.discount > 0 && <div className="flex justify-between text-green-700"><dt>Discount ({totals.coupon})</dt><dd className="font-semibold">−{formatPrice(totals.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Shipping</dt><dd className="font-semibold text-gray-900">{totals.shipping ? formatPrice(totals.shipping) : "Free"}</dd></div>
            <div className="flex justify-between border-t-2 border-gray-200 pt-3 mt-3 text-lg">
              <dt className="font-bold text-gray-900">Total</dt><dd className="font-bold text-gray-900 text-2xl">{formatPrice(totals.total)}</dd>
            </div>
          </dl>
          <button
            disabled={loading}
            className="mt-5 w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-70 text-white text-lg font-bold p-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? <ButtonSpinner /> : <><FiLock /> {method === "CARD" ? `Pay ${formatPrice(totals.total)}` : "Place order"}</>}
          </button>
          <p className="text-xs text-gray-500 text-center mt-3">Only the last 4 digits of your card are stored.</p>
        </aside>
      </form>
    </section>
  );
};

export default CheckoutForm;
