import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import prisma from "@/utils/db";
import { verifyTokenForPage } from "@/utils/verifyToken";
import { formatPrice } from "@/utils/pricing";
import { STATUS_LABEL } from "@/utils/orders";
import StatusBadge from "@/components/orders/StatusBadge";
import OrderStatusSelect from "./OrderStatusSelect";

const filters: (OrderStatus | "ALL")[] = ["ALL", "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const AdminOrdersPage = async ({ searchParams }: { searchParams: { status?: string } }) => {
  const token = cookies().get("jwtToken")?.value;
  if (!token) redirect("/");
  const payload = verifyTokenForPage(token);
  if (!payload?.isAdmin) redirect("/");

  const active = (filters.includes(searchParams.status as OrderStatus) ? searchParams.status : "ALL") as OrderStatus | "ALL";
  const orders = await prisma.order.findMany({
    where: active === "ALL" ? {} : { status: active },
    include: { items: true, user: { select: { username: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="p-5">
      <h1 className="mb-5 text-2xl font-semibold text-gray-700">Orders</h1>
      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map((f) => (
          <Link
            key={f}
            href={f === "ALL" ? "/admin/orders" : `/admin/orders?status=${f}`}
            className={`px-3 py-1 rounded-full border-2 text-sm font-semibold transition ${active === f ? "bg-purple-600 border-purple-600 text-white" : "border-gray-400 text-gray-700 hover:border-purple-600"}`}
          >
            {f === "ALL" ? "All" : STATUS_LABEL[f]}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-600 py-10">No orders here yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full text-left">
            <thead className="border-t-2 border-b-2 border-gray-500 lg:text-lg">
              <tr>
                <th className="p-2">Order</th>
                <th className="p-2">Customer</th>
                <th className="p-2 hidden lg:table-cell">Date</th>
                <th className="p-2">Total</th>
                <th className="p-2">Payment</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-300 hover:bg-purple-50 transition">
                  <td className="p-2">
                    <Link href={`/orders/${o.id}`} className="font-bold text-blue-700 hover:underline">{o.number}</Link>
                    <div className="text-xs text-gray-500">{o.items.reduce((s, i) => s + i.quantity, 0)} items</div>
                  </td>
                  <td className="p-2 text-gray-700">
                    <div className="font-semibold capitalize">{o.fullName}</div>
                    <div className="text-xs text-gray-500">{o.user.email}</div>
                  </td>
                  <td className="p-2 text-gray-700 hidden lg:table-cell">{new Date(o.createdAt).toDateString()}</td>
                  <td className="p-2 font-bold text-gray-900">{formatPrice(o.total)}</td>
                  <td className="p-2 text-sm text-gray-700">
                    {o.paymentMethod === "CARD" ? `${o.cardBrand} ••${o.cardLast4}` : "Cash"}
                    <div className={o.paid ? "text-green-700 font-semibold" : "text-yellow-700 font-semibold"}>{o.paid ? "Paid" : "Unpaid"}</div>
                  </td>
                  <td className="p-2">
                    <div className="flex flex-col gap-1 items-start">
                      <StatusBadge status={o.status} />
                      <OrderStatusSelect orderId={o.id} status={o.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminOrdersPage;
