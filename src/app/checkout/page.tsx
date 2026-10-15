import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/utils/db";
import { verifyTokenForPage } from "@/utils/verifyToken";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { CartLine } from "@/utils/types";

export const metadata: Metadata = { title: "Checkout" };

const CheckoutPage = async ({ searchParams }: { searchParams: { coupon?: string } }) => {
  const token = cookies().get("jwtToken")?.value || "";
  const payload = verifyTokenForPage(token);
  if (!payload) redirect("/login");

  const lines = (await prisma.cart.findMany({
    where: { userId: payload.id },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  })) as CartLine[];
  if (lines.length === 0) redirect("/carts");

  return <CheckoutForm lines={lines} initialCoupon={searchParams.coupon || ""} username={payload.username} />;
};

export default CheckoutPage;
