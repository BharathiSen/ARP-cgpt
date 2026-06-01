import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import crypto from "crypto";

import { getCachedOrFetch } from "@/lib/cache";
import { redisClient } from "@/lib/redis";

const projectSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  simulations: {
    select: {
      id: true,
      endpoint: true,
      status: true,
      avgLatency: true,
      insight: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" as const },
  },
};

const projectListQuery = {
  where: {} as { userId: string },
  select: projectSelect,
};

class DuplicateProjectNameError extends Error {
  constructor() {
    super("DUPLICATE");
    this.name = "DuplicateProjectNameError";
  }
}

const isDuplicateProjectNameError = (error: unknown) =>
  error instanceof DuplicateProjectNameError ||
  (error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002");

const normalizeProjectName = (name: string) => name.trim().toLowerCase();

const getProjectNameLockId = (userId: string, name: string) => {
  const digest = crypto
    .createHash("sha256")
    .update(`${userId}:${normalizeProjectName(name)}`)
    .digest("hex")
    .slice(0, 16);
  const unsigned = BigInt(`0x${digest}`);
  const maxSignedBigInt = BigInt("0x7fffffffffffffff");

  return unsigned > maxSignedBigInt
    ? unsigned - BigInt("0x10000000000000000")
    : unsigned;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const cacheKey = `user_projects:${userId}`;

    // Fetch projects from cache or database (15s TTL)
    let projects;
    try {
      projects = await getCachedOrFetch(
        cacheKey,
        async () => {
          return prisma.project.findMany({
            ...projectListQuery,
            where: { userId },
          });
        },
        15,
      );
    } catch (cacheOrFetchError) {
      console.warn(
        "Cache path failed, falling back to DB fetch:",
        cacheOrFetchError,
      );
      projects = await prisma.project.findMany({
        ...projectListQuery,
        where: { userId },
      });
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const description =
      typeof body?.description === "string" ? body.description : undefined;

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 },
      );
    }

    // Use an advisory transaction lock per (userId + name) to atomically
    // check for duplicates and create the project. This serializes concurrent
    // attempts and prevents duplicates without relying solely on Redis or a
    // DB unique index being present.
    const lockId = getProjectNameLockId(userId, name);

    let project;
    try {
      project = await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockId})`;

        const dup = await tx.project.findFirst({
          where: { userId, name: { equals: name, mode: "insensitive" } },
          select: { id: true },
        });

        if (dup) {
          throw new DuplicateProjectNameError();
        }

        const created = await tx.project.create({ data: { name, description, userId }, select: { id: true } });
        const full = await tx.project.findUnique({ where: { id: created.id }, select: projectSelect });
        return full;
      });
    } catch (e: unknown) {
      if (isDuplicateProjectNameError(e)) {
        return NextResponse.json({ error: "A project with this name already exists." }, { status: 409 });
      }
      throw e;
    }

    if (!project) {
      return NextResponse.json(
        { error: "Project created, but failed to fetch details." },
        { status: 500 },
      );
    }

    // Invalidate Redis Cache since data mutated
    if (redisClient.isAvailable) {
      await redisClient.del(`user_projects:${userId}`);
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const id = typeof body?.id === "string" ? body.id : "";
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;
    const description =
      typeof body?.description === "string" ? body.description : undefined;

    if (!id) {
      return NextResponse.json(
        { error: "Project id is required" },
        { status: 400 },
      );
    }

    const existing = await prisma.project.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // If renaming, use an advisory lock per (userId + newName) to serialize
    // the check-and-update operation and prevent duplicates.
    if (typeof name === "string" && name.length > 0) {
      const lockId = getProjectNameLockId(userId, name);

      try {
        const updated = await prisma.$transaction(async (tx) => {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockId})`;

          const duplicate = await tx.project.findFirst({
            where: {
              userId,
              id: { not: id },
              name: { equals: name, mode: "insensitive" },
            },
            select: { id: true },
          });

          if (duplicate) {
            throw new DuplicateProjectNameError();
          }

          return tx.project.update({
            where: { id },
            data: {
              ...(typeof name === "string" && name.length ? { name } : {}),
              ...(typeof description === "string" ? { description } : {}),
            },
          });
        });

        if (redisClient.isAvailable) {
          await redisClient.del(`user_projects:${userId}`);
        }

        return NextResponse.json(updated);
      } catch (e: unknown) {
        if (isDuplicateProjectNameError(e)) {
          return NextResponse.json({ error: "A project with this name already exists." }, { status: 409 });
        }
        throw e;
      }
    }

    // If not renaming, just update description or other fields normally.
    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(typeof description === "string" ? { description } : {}),
      },
    });

    if (redisClient.isAvailable) {
      await redisClient.del(`user_projects:${userId}`);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const id = typeof body?.id === "string" ? body.id : "";

    if (!id) {
      return NextResponse.json({ error: "Project id is required" }, { status: 400 });
    }

    const existing = await prisma.project.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete simulations first to avoid FK issues, then delete project.
    await prisma.simulation.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    if (redisClient.isAvailable) {
      await redisClient.del(`user_projects:${userId}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
