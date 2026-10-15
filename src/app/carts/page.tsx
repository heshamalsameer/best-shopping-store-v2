import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/utils/db";
import { verifyTokenForPage } from "@/utils/verifyToken";
import CartClientPage from "@/components/cart/CartClientPage";
import { CartLine } from "@/utils/types";

export const metadata: Metadata = { title: "Your cart" };

const CartPage = async () => {
  const token = cookies().get("jwtToken")?.value || "";
  const payload = verifyTokenForPage(token);
  if (!payload) redirect("/login");

  const rows = await prisma.cart.findMany({
    where: { userId: payload.id },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });
  const productsCart = JSON.parse(JSON.stringify(rows)) as CartLine[];

  return <CartClientPage productsCart={productsCart} />;
};

export default CartPage;
