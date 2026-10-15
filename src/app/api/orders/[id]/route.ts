import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { orderStatusSchema } from "@/utils/validationSchemas";
import { canCancel, STATUS_LABEL } from "@/utils/orders";

interface Props {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const user = verifyToken(request);
    if (!user) return NextResponse.json({ message: "only logged in user, access denied" }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id: parseInt(params.id) },
      include: { items: true, history: { orderBy: { createdAt: "asc" } } },
    });
    if (!order || (!user.isAdmin && order.userId !== user.id)) {
      return NextResponse.json({ message: "order not found" }, { status: 404 });
    }
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const user = verifyToken(request);
    if (!user) return NextResponse.json({ message: "only logged in user, access denied" }, { status: 401 });

    const order = await prisma.order.findUnique({ where: { id: parseInt(params.id) } });
    if (!order || (!user.isAdmin && order.userId !== user.id)) {
      return NextResponse.json({ message: "order not found" }, { status: 404 });
    }

    const body = await request.json();

    if (body?.action === "cancel") {
      if (!canCancel(order.status)) {
        return NextResponse.json({ message: "this order can no longer be cancelled" }, { status: 400 });
      }
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          history: { create: { status: "CANCELLED", note: order.paid ? "Cancelled by customer — refund issued" : "Cancelled by customer" } },
        },
      });
      return NextResponse.json(updated, { status: 200 });
    }

    if (!user.isAdmin) return NextResponse.json({ message: "only admin, access denied" }, { status: 403 });

    const validation = orderStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
    }
    const { status, note } = validation.data;
    if (status === order.status) return NextResponse.json(order, { status: 200 });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status,
        paid: order.paid || status === "PAID" || status === "DELIVERED",
        history: { create: { status, note: note || `Status changed to ${STATUS_LABEL[status]}` } },
      },
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "internal server error" }, { status: 500 });
  }
}
