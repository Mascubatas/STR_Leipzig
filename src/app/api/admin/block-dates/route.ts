import { NextRequest, NextResponse } from "next/server";
import { bookingStore } from "@/lib/booking-store";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { startDate, endDate, reason } = await req.json();
    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 });
    }

    const blocked = bookingStore.blockDates(startDate, endDate, reason || "Owner Block");
    return NextResponse.json({ success: true, blocked });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to block dates" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Block ID is required" }, { status: 400 });
    }

    const unblocked = bookingStore.unblockDates(id);
    return NextResponse.json({ success: unblocked });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to unblock dates" },
      { status: 400 }
    );
  }
}
