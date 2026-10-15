import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/utils/db";
import { verifyTokenForPage } from "@/utils/verifyToken";
import SupportClient from "./SupportClient";

export const metadata: Metadata = { title: "Help & support" };

const SupportPage = async ({ searchParams }: { searchParams: { order?: string } }) => {
  const token = cookies().get("jwtToken")?.value || "";
  const payload = verifyTokenForPage(token);
  if (!payload) redirect("/login");
  if (payload.isAdmin) redirect("/admin/support");

  const orders = await prisma.order.findMany({
    where: { userId: payload.id },
    select: { id: true, number: true, status: true, total: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const asked = searchParams.order
    ? (await prisma.order.findFirst({ where: { number: searchParams.order, userId: payload.id }, select: { number: true } }))?.number
    : undefined;

  return (
    <SupportClient
      username={payload.username}
      orders={JSON.parse(JSON.stringify(orders))}
      initialOrder={asked}
    />
  );
};

export default SupportPage;
