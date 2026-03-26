import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

import { getCachedOrFetch } from "@/lib/cache";
import { redisClient } from "@/lib/redis";

const projectListQuery = {
  where: {} as { userId: string },
  select: {
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
  },
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

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId,
      },
    });

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

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(typeof name === "string" && name.length ? { name } : {}),
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
