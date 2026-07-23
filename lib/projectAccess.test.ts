import { beforeEach, describe, expect, it, vi } from "vitest";

const findFirst = vi.fn();

vi.mock("@/lib/prisma", () => ({
  default: {
    project: {
      findFirst: (...args: unknown[]) => findFirst(...args),
    },
  },
}));

describe("findOwnedProject", () => {
  beforeEach(() => {
    findFirst.mockReset();
  });

  it("returns the project when userId matches", async () => {
    findFirst.mockResolvedValue({
      id: "proj_1",
      name: "Demo",
      userId: "user_a",
    });

    const { findOwnedProject } = await import("@/lib/projectAccess");
    const project = await findOwnedProject("proj_1", "user_a");

    expect(findFirst).toHaveBeenCalledWith({
      where: { id: "proj_1", userId: "user_a" },
      select: { id: true, name: true, userId: true },
    });
    expect(project?.id).toBe("proj_1");
  });

  it("returns null when the project is not owned by the user", async () => {
    findFirst.mockResolvedValue(null);

    const { findOwnedProject } = await import("@/lib/projectAccess");
    const project = await findOwnedProject("proj_other", "user_a");

    expect(project).toBeNull();
  });
});
