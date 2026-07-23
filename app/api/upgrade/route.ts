import { NextResponse } from "next/server";

/**
 * Free "instant Pro" upgrades are disabled.
 * Pro is unlocked only through verified Razorpay payment.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Free upgrades are disabled. Use Razorpay checkout on /pricing to unlock Pro rate limits.",
      upgradePath: "/pricing",
    },
    { status: 403 },
  );
}
