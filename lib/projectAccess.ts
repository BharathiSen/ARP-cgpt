import prisma from "@/lib/prisma";

/**
 * Returns the project only if it belongs to this user.
 * Use this before writing simulations so users cannot target someone else's projectId.
 */
export async function findOwnedProject(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true, name: true, userId: true },
  });
}
