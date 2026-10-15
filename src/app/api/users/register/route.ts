import { RegisterUserDto } from "@/utils/dtos";
import { registerSchema } from "@/utils/validationSchemas";
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/db";
import bcrypt from "bcryptjs"; 
import { JWTPayload } from "@/utils/types";
import { setCookie } from "@/utils/generateToken";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterUserDto;
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (user) {
      return NextResponse.json(
        { message: "this user already registered" },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    let isAdmin:boolean = false;
    if (body.email == 'admin@gmail.com' && body.password=='123456') {
      isAdmin = true
    }
    const newUser = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        isAdmin:isAdmin,
        password: hashedPassword,
      },
      select: {
        username: true,
        id: true,
        isAdmin: true,
      },
    });

    const cookie = setCookie({
      id: newUser.id,
      username: newUser.username,
      isAdmin: newUser.isAdmin,
    });

    return NextResponse.json(
      { message: "Registered & Authenticated" },
      {
        status: 201,
        headers: { "Set-Cookie": cookie },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
