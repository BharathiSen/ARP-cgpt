"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DashboardHeaderProps {
  userName?: string | null;
  planLabel: string;
  showUpgradeLink: boolean;
}

export function DashboardHeader({
  userName,
  planLabel,
  showUpgradeLink,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-10 pt-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "#9AA6C4" }}>
          Welcome back,{" "}
          <span style={{ color: "#00C8FF" }}>{userName}</span>
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              color: "#00C8FF",
              background: "rgba(0,200,255,0.12)",
              border: "1px solid rgba(0,200,255,0.25)",
            }}
          >
            {planLabel}
          </span>
          {showUpgradeLink && (
            <a
              href="/pricing"
              className="text-xs underline"
              style={{ color: "#9AA6C4" }}
            >
              Raise limits with Pro →
            </a>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm px-4 py-2"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </Button>
    </div>
  );
}
