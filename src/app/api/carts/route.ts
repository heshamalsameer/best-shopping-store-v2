import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { AddToCartDto } from "@/utils/dtos";
import { addToCartSchema } from "@/utils/validationSchemas";
import { MAX_QTY } from "@/utils/constants";

export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "only logged in user, access denied" },
        { status: 401 }
      );
    }

    const raw = await request.json();
    const body: AddToCartDto = { productId: Number(raw.productId ?? raw.id), quantity: raw.quantity };

    const validation = addToCartSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id: body.productId } });
    if (!product) {
      return NextResponse.json({ message: "product not found" }, { status: 404 });
    }

    const qty = body.quantity ?? 1;
    const existing = await prisma.cart.findFirst({
      where: { userId: user.id, productId: product.id },
    });

    if (existing) {
      const quantity = Math.min(MAX_QTY, existing.quantity + qty);
      const updated = await prisma.cart.update({
        where: { id: existing.id },
        data: { quantity, price: product.price, image: product.image, title: product.title },
      });
      return NextResponse.json(updated, { status: 200 });
    }

    const newCart = await prisma.cart.create({
      data: {
        title: product.title,
        description: product.description,
        image: product.image,
        price: product.price,
        quantity: Math.min(MAX_QTY, qty),
        productId: product.id,
        userId: user.id,
      },
    });
    return NextResponse.json(newCart, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (user === null) {
      return NextResponse.json(
        { message: "only logged in user, access denied" },
        { status: 401 }
      );
    }

    const carts = await prisma.cart.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(carts, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
