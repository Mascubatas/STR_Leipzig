import { NextResponse } from "next/server";
import { bookingStore } from "@/lib/booking-store";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const logs = bookingStore.getAuditLogs();
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load audit logs" },
      { status: 500 }
    );
  }
}
