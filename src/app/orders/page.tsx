import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FiPackage } from "react-icons/fi";
import prisma from "@/utils/db";
import { verifyTokenForPage } from "@/utils/verifyToken";
import StatusBadge from "@/components/orders/StatusBadge";
import { formatPrice } from "@/utils/pricing";

export const metadata: Metadata = { title: "My orders" };

const OrdersPage = async () => {
  const token = cookies().get("jwtToken")?.value || "";
  const payload = verifyTokenForPage(token);
  if (!payload) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: payload.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="container fix-height m-auto px-5 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My orders</h1>

      {orders.length === 0 ? (
        <div className="fade-up bg-white rounded-lg border-2 border-gray-300 p-10 text-center">
          <FiPackage className="text-5xl mx-auto text-[rgb(19,19,126)]" />
          <h2 className="text-2xl font-bold text-gray-900 mt-4">No orders yet</h2>
          <p className="text-gray-600 mt-1">When you place an order you can follow it here.</p>
          <Link href="/products?pageNumber=1" className="inline-block mt-5 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition">Start shopping</Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o, i) => (
            <li key={o.id} className="fade-up" style={{ ["--i" as string]: i }}>
              <Link href={`/orders/${o.id}`} className="block bg-white rounded-lg border-2 border-gray-300 hover:border-blue-600 hover:shadow-lg transition p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-gray-900">Order {o.number}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                      {o.items.reduce((s, it) => s + it.quantity, 0)} items · {o.paymentMethod === "CARD" ? `${o.cardBrand} •••• ${o.cardLast4}` : "Cash on delivery"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={o.status} />
                    <span className="text-xl font-bold text-gray-900">{formatPrice(o.total)}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  {o.items.slice(0, 5).map((it) => (
                    <Image key={it.id} src={it.image} alt={it.title} width={56} height={56} className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                  ))}
                  {o.items.length > 5 && <span className="w-14 h-14 rounded-lg bg-gray-100 grid place-items-center text-gray-600 font-semibold">+{o.items.length - 5}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default OrdersPage;
