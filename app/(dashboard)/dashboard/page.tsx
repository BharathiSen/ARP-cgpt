import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";
import UpgradeLock from "@/components/dashboard/UpgradeLock";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  // 1. Not logged in
  if (!session?.user?.email) {
    redirect("/login");
  }

  // 2. Fetch from DB (IMPORTANT)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isPaid: true, isAdmin: true },
  });

  // 3. Access control
  if (!user?.isPaid && !user?.isAdmin) {
    return <UpgradeLock />;
  }

  // 4. REAL DASHBOARD LOGIC DELEGATED TO CLIENT
  return <DashboardClient user={user} />;
}
