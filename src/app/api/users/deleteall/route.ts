import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";

export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (user === null || user.isAdmin === false) {
      return NextResponse.json({ message: "only admin, access denied" }, { status: 403 });
    }
    const result = await prisma.user.deleteMany({ where: { isAdmin: false } });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "internal server error" }, { status: 500 });
  }
}
