import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { updateCartSchema } from "@/utils/validationSchemas";

interface Props {
  params: { id: string };
}

const loadOwned = async (request: NextRequest, id: string) => {
  const user = verifyToken(request);
  if (user === null) return { error: NextResponse.json({ message: "no token provided, access denied" }, { status: 401 }) };
  const item = await prisma.cart.findUnique({ where: { id: parseInt(id) } });
  if (!item) return { error: NextResponse.json({ message: "cart item not found" }, { status: 404 }) };
  if (!user.isAdmin && user.id !== item.userId) {
    return { error: NextResponse.json({ message: "you are not allowed, access denied" }, { status: 403 }) };
  }
  return { item };
};

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { item, error } = await loadOwned(request, params.id);
    if (error) return error;

    const body = await request.json();
    const validation = updateCartSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
    }

    const updated = await prisma.cart.update({
      where: { id: item!.id },
      data: { quantity: validation.data.quantity },
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { item, error } = await loadOwned(request, params.id);
    if (error) return error;

    await prisma.cart.delete({ where: { id: item!.id } });
    return NextResponse.json({ message: "Cart item deleted", id: item!.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "internal server error" }, { status: 500 });
  }
}
