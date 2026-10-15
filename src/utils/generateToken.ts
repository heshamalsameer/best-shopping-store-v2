import jwt, { JwtPayload } from "jsonwebtoken"; 
import { JWTPayload } from "./types";
import { serialize } from "cookie";
import { cookies } from "next/headers";
import { verifyTokenForPage } from "./verifyToken";

export function generateJWT(jwtPayload: JWTPayload): string {
  const privateKey = process.env.JWT_SECRET as string;

  const token = jwt.sign(jwtPayload, privateKey, {
    expiresIn: "30d",
  });

  return token;
}

export function setCookie(jwtPayload: JWTPayload): string {
  const token = generateJWT(jwtPayload);

  const cookie = serialize("jwtToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, 
  });

  return cookie;
}
