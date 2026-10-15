import { NextRequest, NextResponse } from "next/server";
import { CreateProductDto, UpdateProductDto } from "@/utils/dtos";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { Product } from "@prisma/client";
import { createProductSchema } from "@/utils/validationSchemas";

interface Props {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        comments: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}


export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const user = verifyToken(request); 
    if (user === null || user.isAdmin === false) {
      return NextResponse.json(
        { message: "only admin, access denied" },
        { status: 403 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!product) {
      return NextResponse.json(
        { message: "product not found" },
        { status: 404 }
      );
    }
  
    const body = (await request.json()) as UpdateProductDto;

    const validation = createProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const updatedProduct: Product = await prisma.product.update({
      where:{id:parseInt(params.id)},
      data: {
        title: body.title,
        description: body.description,
        price:body.price,
        image:body.image
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const user = verifyToken(request);
    if (user === null || user.isAdmin === false) {
      return NextResponse.json(
        { message: "only admin, access denied" },
        { status: 403 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
      include: { comments: true },
    });
    if (!product) {
      return NextResponse.json(
        { message: "product not found" },
        { status: 404 }
      );
    }

   
    await prisma.product.delete({ where: { id: parseInt(params.id) } });

    const commentIds: number[] = product?.comments.map((comment) => comment.id);
    await prisma.comment.deleteMany({
      where: { id: { in: commentIds } },
    });

    return NextResponse.json({ message: "product deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
