import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  // Not logged in → send to login
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isPaid: true, isAdmin: true },
  });

  if (!user) {
    redirect("/login");
  }

  // Free + Pro both get the dashboard. Rate limits enforce the plan.
  return <DashboardClient user={user} />;
}
