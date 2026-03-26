import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { status: 401, errorType: "auth_error", message: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json(
        { status: 401, errorType: "auth_error", message: "User not found" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        {
          status: 400,
          errorType: "validation_error",
          message: "Missing projectId",
        },
        { status: 400 },
      );
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    });

    if (!project) {
      return NextResponse.json(
        { status: 404, errorType: "not_found", message: "Project not found" },
        { status: 404 },
      );
    }

    const simulations = await prisma.simulation.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    const exportData = {
      project: project.name,
      exportedAt: new Date().toISOString(),
      totalSimulations: simulations.length,
      simulations,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="report_${projectId}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      {
        status: 500,
        errorType: "server_error",
        message: "Failed to generate report",
      },
      { status: 500 },
    );
  }
}
