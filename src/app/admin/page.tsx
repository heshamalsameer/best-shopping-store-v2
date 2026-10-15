import Link from "next/link";
import AddProductForm from "./AddProductForm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyTokenForPage } from "@/utils/verifyToken";
import prisma from "@/utils/db";
import { formatPrice } from "@/utils/pricing";

const AdminPage = async () => {
  const token = cookies().get("jwtToken")?.value;
  if (!token) redirect("/");

  const payload = verifyTokenForPage(token);
  if (!payload?.isAdmin) redirect("/");

  const [products, orders, pending] = await Promise.all([
    prisma.product.count(),
    prisma.order.findMany({ where: { status: { not: "CANCELLED" } }, select: { total: true, paid: true } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "PAID", "PROCESSING"] } } }),
  ]);
  const revenue = orders.filter((o) => o.paid).reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: "Products", value: products, href: "/admin/products-table?pageNumber=1" },
    { label: "Orders", value: orders.length, href: "/admin/orders" },
    { label: "To fulfil", value: pending, href: "/admin/orders?status=PAID" },
    { label: "Revenue (paid)", value: formatPrice(revenue), href: "/admin/orders" },
  ];

  return (
    <div className="fix-height px-5 lg:px-20 py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <Link key={s.label} href={s.href} className="fade-up shadow p-4 bg-purple-200 rounded hover:bg-purple-300 transition" style={{ ["--i" as string]: i }}>
            <span className="text-gray-700 font-semibold">{s.label}</span>
            <strong className="block text-3xl text-gray-900 mt-1">{s.value}</strong>
          </Link>
        ))}
      </div>
      <div className="shadow p-4 bg-purple-200 rounded w-full fade-up">
        <h2 className="text-xl lg:text-2xl text-gray-700 font-semibold mb-4">
          Add New Product
        </h2>
        <AddProductForm />
      </div>
    </div>
  );
};

export default AdminPage;
