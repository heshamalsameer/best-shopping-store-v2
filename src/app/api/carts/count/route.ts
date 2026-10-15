import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (user === null) {
      return NextResponse.json({ message: "only logged in user, access denied" }, { status: 401 });
    }

    const items = await prisma.cart.findMany({ where: { userId: user.id }, select: { quantity: true } });
    const cartsCount = items.reduce((s, i) => s + i.quantity, 0);

    return NextResponse.json({ cartsCount }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "internal server error" }, { status: 500 });
  }
}
