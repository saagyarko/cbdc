// SECURITY: This endpoint allows user registration. In production, implement rate limiting, email verification, and stricter validation.
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const prisma = new PrismaClient();

// In-memory rate limiter (per IP, 5 requests per 10 minutes)
const rateLimitMap = new Map<string, { count: number; last: number }>();
const WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

const RegisterSchema = z.object({
  name: z.string().min(2).max(50),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8),
  role: z.enum(["admin", "auditor", "bank_staff"])
});

export async function POST(req: NextRequest) {
  // In-memory rate limiting
  /* const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, last: now };
  if (now - entry.last > WINDOW) {
    entry.count = 0;
    entry.last = now;
  }
  entry.count += 1;
  rateLimitMap.set(ip, entry);
  if (entry.count > MAX_REQUESTS) {
    return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 });
  } */

  // SECURITY: Validate all input fields strictly to prevent injection attacks.
  const body = await req.json();
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => `${issue.path.join('.')} - ${issue.message}`)
      .join('; ');
    return NextResponse.json({ error: `Invalid input: ${errorDetails}` }, { status: 400 });
  }
  const { name, username, password, role } = parsed.data;
  // SECURITY: Check for existing user to prevent duplicate accounts.
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
  }
  // SECURITY: Hash passwords before storing. Use a strong salt factor.
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, username, password: hashed, role },
  });
  // Log registration to AuditLog
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'Register',
      details: `User ${username} registered with role ${role}`,
    },
  });
  return NextResponse.json({ success: true });
} 