import { NextRequest, NextResponse } from "next/server";
import { bookingStore } from "@/lib/booking-store";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const searchParams = req.nextUrl.searchParams;
    const cronSecret = process.env.CRON_SECRET;

    // Check authorization: Bearer CRON_SECRET or ?key=CRON_SECRET
    const providedSecret =
      authHeader?.replace("Bearer ", "") || searchParams.get("key") || searchParams.get("secret");

    if (cronSecret && providedSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }

    const releasedCount = bookingStore.releaseExpiredHolds();

    return NextResponse.json({
      success: true,
      releasedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Cron job failed" },
      { status: 500 }
    );
  }
}
