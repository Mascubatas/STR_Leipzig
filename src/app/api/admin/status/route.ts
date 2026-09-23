import { NextRequest, NextResponse } from "next/server";
import { bookingStore } from "@/lib/booking-store";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { reference, status } = await req.json();
    if (!reference || !status) {
      return NextResponse.json({ error: "Reference and status are required" }, { status: 400 });
    }

    const updated = bookingStore.updateBookingStatus(reference, status);
    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to update status" },
      { status: 400 }
    );
  }
}
