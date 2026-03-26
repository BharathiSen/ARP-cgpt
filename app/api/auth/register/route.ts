import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name,
      },
    });

    // Send Welcome Email asynchronously
    await sendWelcomeEmail(normalizedEmail, name || "Developer");

    return NextResponse.json({
      message: "User created successfully",
      userId: user.id,
    });
  } catch (err) {
    console.error("Registration failed:", err);

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Server misconfigured: DATABASE_URL is missing." },
        { status: 500 },
      );
    }

    const prismaCode =
      typeof err === "object" && err && "code" in err
        ? String((err as { code?: unknown }).code)
        : "";

    if (prismaCode === "P1000" || prismaCode === "P1001") {
      return NextResponse.json(
        { error: "Database unavailable. Please try again in a moment." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
