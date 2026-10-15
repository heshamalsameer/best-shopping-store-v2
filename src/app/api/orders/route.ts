import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { checkoutSchema } from "@/utils/validationSchemas";
import { computeTotals } from "@/utils/pricing";
import { DECLINED_TEST_CARD, cardBrand, onlyDigits, validateCard } from "@/utils/payment";
import { newOrderNumber } from "@/utils/orders";

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) return NextResponse.json({ message: "only logged in user, access denied" }, { status: 401 });

    const all = user.isAdmin && request.nextUrl.searchParams.get("all") === "1";
    const orders = await prisma.order.findMany({
      where: all ? {} : { userId: user.id },
      include: { items: true, user: { select: { username: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) return NextResponse.json({ message: "only logged in user, access denied" }, { status: 401 });

    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
    }
    const data = validation.data;

    const cart = await prisma.cart.findMany({ where: { userId: user.id }, include: { product: true } });
    if (cart.length === 0) {
      return NextResponse.json({ message: "your cart is empty" }, { status: 400 });
    }

    const lines = cart.map((c) => ({
      title: c.product?.title ?? c.title,
      image: c.product?.image ?? c.image,
      price: c.product?.price ?? c.price,
      quantity: c.quantity,
      productId: c.productId,
    }));
    const totals = computeTotals(lines, data.coupon);

    let paid = false;
    let brand: string | null = null;
    let last4: string | null = null;
    if (data.paymentMethod === "CARD") {
      if (!data.card) return NextResponse.json({ message: "card details are required" }, { status: 400 });
      const cardError = validateCard(data.card);
      if (cardError) return NextResponse.json({ message: cardError }, { status: 400 });
      const digits = onlyDigits(data.card.number);
      if (digits === DECLINED_TEST_CARD) {
        return NextResponse.json({ message: "Your card was declined. Try another card." }, { status: 402 });
      }
      paid = true;
      brand = cardBrand(digits);
      last4 = digits.slice(-4);
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          number: newOrderNumber(),
          userId: user.id,
          status: paid ? "PAID" : "PENDING",
          paymentMethod: data.paymentMethod,
          paid,
          cardBrand: brand,
          cardLast4: last4,
          subtotal: totals.subtotal,
          shipping: totals.shipping,
          discount: totals.discount,
          total: totals.total,
          couponCode: totals.coupon,
          fullName: data.fullName,
          phone: data.phone,
          city: data.city,
          address: data.address,
          notes: data.notes || null,
          items: {
            create: lines.map((l) => ({
              title: l.title,
              image: l.image,
              price: parseFloat(String(l.price)) || 0,
              quantity: l.quantity,
              productId: l.productId,
            })),
          },
          history: {
            create: paid
              ? [{ status: "PENDING", note: "Order placed" }, { status: "PAID", note: `Paid with ${brand} •••• ${last4}` }]
              : [{ status: "PENDING", note: "Order placed — cash on delivery" }],
          },
        },
      });
      await tx.cart.deleteMany({ where: { userId: user.id } });
      return created;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "internal server error" }, { status: 500 });
  }
}
