"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { FiArrowRight, FiShoppingCart, FiTag, FiTruck } from "react-icons/fi";
import { AppDispatch } from "@/app/store/store";
import { addCartProducts } from "@/app/store/cart";
import CartItem from "@/components/cart/CartItem";
import { CartLine } from "@/utils/types";
import { computeTotals, formatPrice } from "@/utils/pricing";
import { COUPONS, FREE_SHIPPING_OVER } from "@/utils/constants";

interface CartClientPageProps {
  productsCart: CartLine[];
}

const priceOf = (l: CartLine) => l.product?.price ?? l.price;

const CartClientPage = ({ productsCart }: CartClientPageProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [lines, setLines] = useState(productsCart);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    setLines(productsCart);
    dispatch(addCartProducts(productsCart));
  }, [productsCart, dispatch]);

  const totals = useMemo(() => computeTotals(lines.map((l) => ({ price: priceOf(l), quantity: l.quantity })), coupon), [lines, coupon]);
  const toFree = Math.max(0, FREE_SHIPPING_OVER - (totals.subtotal - totals.discount));

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) return;
    if (COUPONS[c]) {
      setCoupon(c);
      setCouponError("");
    } else {
      setCoupon(null);
      setCouponError("This code isn’t valid");
    }
  };

  if (lines.length === 0) {
    return (
      <section className="container fix-height m-auto px-5 flex flex-col items-center justify-center text-center">
        <div className="fade-up w-24 h-24 rounded-full bg-[#b4cadc] grid place-items-center text-5xl text-[rgb(19,19,126)]">
          <FiShoppingCart />
        </div>
        <h1 className="fade-up font-bold text-4xl mt-6 text-gray-900" style={{ ["--i" as string]: 1 }}>Your cart is empty</h1>
        <p className="fade-up text-gray-600 text-lg mt-2" style={{ ["--i" as string]: 2 }}>Find something you like and it will wait for you here.</p>
        <Link href="/products?pageNumber=1" className="fade-up mt-6 bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-2 px-6 rounded-lg transition" style={{ ["--i" as string]: 3 }}>
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <section className="container fix-height m-auto px-5 py-8">
      <div className="flex items-end justify-between flex-wrap gap-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Your cart <span className="text-gray-500 font-normal text-2xl">({totals.count} {totals.count === 1 ? "item" : "items"})</span>
        </h1>
        <Link href="/products?pageNumber=1" className="text-blue-700 font-semibold hover:underline">← Continue shopping</Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="bg-white rounded-lg border-2 border-gray-300 divide-y-2 divide-gray-200">
          {lines.map((item, index) => (
            <CartItem
              key={item.id}
              product={item}
              index={index}
              onQuantity={(q) => setLines((ls) => ls.map((l) => (l.id === item.id ? { ...l, quantity: q } : l)))}
              onRemoved={() => {
                setLines((ls) => ls.filter((l) => l.id !== item.id));
                router.refresh();
              }}
            />
          ))}
        </div>

        <aside className="bg-white rounded-lg border-2 border-gray-300 p-5 lg:sticky lg:top-5 fade-up">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order summary</h2>

          {toFree > 0 ? (
            <div className="mb-4 text-sm text-gray-700">
              <p className="flex items-center gap-2"><FiTruck /> Add <strong>{formatPrice(toFree)}</strong> more for free shipping</p>
              <div className="h-2 rounded bg-gray-200 mt-2 overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${Math.min(100, ((totals.subtotal - totals.discount) / FREE_SHIPPING_OVER) * 100)}%` }} />
              </div>
            </div>
          ) : (
            <p className="mb-4 text-sm text-green-700 font-semibold flex items-center gap-2"><FiTruck /> You get free shipping</p>
          )}

          <dl className="space-y-2 text-gray-700">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-semibold text-gray-900">{formatPrice(totals.subtotal)}</dd></div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-green-700"><dt>Discount ({coupon})</dt><dd className="font-semibold">−{formatPrice(totals.discount)}</dd></div>
            )}
            <div className="flex justify-between"><dt>Shipping</dt><dd className="font-semibold text-gray-900">{totals.shipping ? formatPrice(totals.shipping) : "Free"}</dd></div>
            <div className="flex justify-between border-t-2 border-gray-200 pt-3 mt-3 text-lg">
              <dt className="font-bold text-gray-900">Total</dt><dd className="font-bold text-gray-900 text-2xl">{formatPrice(totals.total)}</dd>
            </div>
          </dl>

          <form onSubmit={applyCoupon} className="mt-5">
            <label htmlFor="coupon" className="text-sm font-semibold text-gray-700 flex items-center gap-1"><FiTag /> Discount code</label>
            <div className="flex gap-2 mt-1">
              <input
                id="coupon"
                value={code}
                onChange={(e) => { setCode(e.target.value); setCouponError(""); }}
                placeholder="WELCOME10"
                className="flex-1 min-w-0 border-2 border-gray-300 rounded-lg p-2 uppercase outline-none focus:border-blue-600 transition"
              />
              <button className="border-2 border-gray-700 text-gray-800 font-bold px-4 rounded-lg hover:bg-gray-100 transition">Apply</button>
            </div>
            {couponError && <p className="text-red-600 text-sm mt-1">{couponError}</p>}
            {coupon && <p className="text-green-700 text-sm mt-1">{coupon} applied — {COUPONS[coupon]}% off</p>}
          </form>

          <Link
            href={`/checkout${coupon ? `?coupon=${coupon}` : ""}`}
            className="mt-5 w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-lg font-bold p-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            Proceed to checkout <FiArrowRight />
          </Link>
          <p className="text-xs text-gray-500 text-center mt-3">Card or cash on delivery · you can cancel before shipping</p>
        </aside>
      </div>
    </section>
  );
};

export default CartClientPage;
