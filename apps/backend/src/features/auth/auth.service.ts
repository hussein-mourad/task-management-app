import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): {
  userId: string;
  role: string;
} {
  return jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
}