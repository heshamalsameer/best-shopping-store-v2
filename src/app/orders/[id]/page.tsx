import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { FiCheckCircle, FiCreditCard, FiDollarSign, FiMapPin, FiMessageCircle } from "react-icons/fi";
import prisma from "@/utils/db";
import { verifyTokenForPage } from "@/utils/verifyToken";
import StatusBadge from "@/components/orders/StatusBadge";
import OrderTracker from "@/components/orders/OrderTracker";
import OrderActions from "@/components/orders/OrderActions";
import { formatPrice } from "@/utils/pricing";
import { canCancel, STATUS_LABEL, STATUS_TEXT } from "@/utils/orders";

export const metadata: Metadata = { title: "Order details" };

interface Props {
  params: { id: string };
  searchParams: { placed?: string };
}

const OrderPage = async ({ params, searchParams }: Props) => {
  const token = cookies().get("jwtToken")?.value || "";
  const payload = verifyTokenForPage(token);
  if (!payload) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id: parseInt(params.id) || 0 },
    include: { items: true, history: { orderBy: { createdAt: "asc" } } },
  });
  if (!order || (order.userId !== payload.id && !payload.isAdmin)) notFound();

  const fmt = (d: Date) => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <section className="container fix-height m-auto px-5 py-8 max-w-5xl">
      {searchParams.placed && (
        <div className="fade-up no-print mb-6 rounded-lg bg-green-50 border-2 border-green-300 p-5 flex gap-4 items-center">
          <FiCheckCircle className="text-4xl text-green-600 pop shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Thank you, your order is confirmed!</h2>
            <p className="text-gray-700">
              {order.paid ? "Payment received." : "You’ll pay on delivery."} We’ll keep this page updated as your order moves.
            </p>
          </div>
        </div>
      )}

      <Link href="/orders" className="no-print text-blue-700 font-semibold hover:underline">← All orders</Link>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order {order.number}</h1>
          <p className="text-gray-500">Placed {fmt(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="fade-up bg-white rounded-lg border-2 border-gray-300 p-5 mb-6">
        <OrderTracker status={order.status} />
        <p className="text-center text-gray-700 mt-4">{STATUS_TEXT[order.status]}</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="bg-white rounded-lg border-2 border-gray-300 fade-up" style={{ ["--i" as string]: 1 }}>
          <h2 className="text-lg font-bold text-gray-900 p-5 pb-3">Items</h2>
          <ul className="divide-y-2 divide-gray-100">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center gap-4 px-5 py-3">
                <Image src={it.image} alt={it.title} width={64} height={64} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                <div className="flex-1 min-w-0">
                  {it.productId ? (
                    <Link href={`/products/${it.productId}`} className="font-semibold text-gray-900 hover:text-blue-700 line-clamp-1">{it.title}</Link>
                  ) : (
                    <span className="font-semibold text-gray-900">{it.title}</span>
                  )}
                  <p className="text-sm text-gray-500">{it.quantity} × {formatPrice(it.price)}</p>
                </div>
                <span className="font-bold text-gray-900">{formatPrice(it.price * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 text-gray-700 border-t-2 border-gray-200 p-5">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-semibold text-gray-900">{formatPrice(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-green-700"><dt>Discount ({order.couponCode})</dt><dd>−{formatPrice(order.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Shipping</dt><dd className="font-semibold text-gray-900">{order.shipping ? formatPrice(order.shipping) : "Free"}</dd></div>
            <div className="flex justify-between text-lg pt-2"><dt className="font-bold text-gray-900">Total</dt><dd className="font-bold text-gray-900 text-2xl">{formatPrice(order.total)}</dd></div>
          </dl>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border-2 border-gray-300 p-5 fade-up" style={{ ["--i" as string]: 2 }}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Delivery & payment</h2>
            <p className="flex gap-2 text-gray-700"><FiMapPin className="mt-1 shrink-0" /><span><strong className="text-gray-900">{order.fullName}</strong><br />{order.address}, {order.city}<br />{order.phone}</span></p>
            {order.notes && <p className="text-sm text-gray-600 mt-2 italic">“{order.notes}”</p>}
            <p className="flex items-center gap-2 text-gray-700 mt-4">
              {order.paymentMethod === "CARD" ? <FiCreditCard /> : <FiDollarSign />}
              {order.paymentMethod === "CARD" ? `${order.cardBrand} •••• ${order.cardLast4}` : "Cash on delivery"}
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded ${order.paid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{order.paid ? "PAID" : "UNPAID"}</span>
            </p>
          </div>

          <div className="bg-white rounded-lg border-2 border-gray-300 p-5 fade-up" style={{ ["--i" as string]: 3 }}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">History</h2>
            <ol className="relative border-l-2 border-gray-200 ml-2 space-y-4">
              {order.history.map((h) => (
                <li key={h.id} className="ml-4">
                  <span className="absolute -left-[7px] mt-1.5 w-3 h-3 rounded-full bg-blue-600" />
                  <p className="font-semibold text-gray-900">{STATUS_LABEL[h.status]}</p>
                  {h.note && <p className="text-sm text-gray-600">{h.note}</p>}
                  <time className="text-xs text-gray-500">{fmt(h.createdAt)}</time>
                </li>
              ))}
            </ol>
          </div>

          {order.userId === payload.id && (
            <Link
              href={`/support?order=${order.number}`}
              className="no-print group flex items-center gap-3 rounded-lg border-2 border-blue-600 bg-blue-50 p-4 hover:bg-blue-600 hover:text-white transition fade-up"
              style={{ ["--i" as string]: 4 }}
            >
              <FiMessageCircle className="text-2xl text-blue-600 group-hover:text-white transition" />
              <span>
                <b className="block">Need help with this order?</b>
                <span className="text-sm opacity-80">Chat with our support team</span>
              </span>
            </Link>
          )}

          <OrderActions orderId={order.id} cancellable={order.userId === payload.id && canCancel(order.status)} />
        </div>
      </div>
    </section>
  );
};

export default OrderPage;
