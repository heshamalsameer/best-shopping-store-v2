import { createProductSchema } from "@/utils/validationSchemas";
import { NextRequest, NextResponse } from "next/server";
import { Product } from "@prisma/client";
import prisma from "@/utils/db";
import { PRODUCT_PER_PAGE } from "@/utils/constants";
import { verifyToken } from "@/utils/verifyToken";
import { CreateProductDto } from "@/utils/dtos";

export async function GET(request: NextRequest) {
  try {
    const pageNumber = request.nextUrl.searchParams.get("pageNumber") || "1";

    const products = await prisma.product.findMany({
      skip: PRODUCT_PER_PAGE * (parseInt(pageNumber) - 1),
      take: PRODUCT_PER_PAGE,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}



export async function POST(request: NextRequest) {

  try {
    const user = verifyToken(request);
    if (user === null || user.isAdmin === false) {
      return NextResponse.json(
        { message: "only admin, access denied" },
        { status: 403 }
      );
    }
    
    const body = (await request.json()) as CreateProductDto;
    const validation = createProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.errors[0].message },
        { status: 400 }
      );
    }
  
    const newProduct: Product = await prisma.product.create({
      data: {
        title: body.title,
        description: body.description,
        price:body.price,
        image:body.image
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error",error },
      { status: 500 }
    );
  }
}
