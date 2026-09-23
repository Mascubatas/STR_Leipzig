import { NextRequest, NextResponse } from "next/server";
import { bookingStore } from "@/lib/booking-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    if (!reference) {
      return NextResponse.json({ error: "Reference missing" }, { status: 400 });
    }

    let booking = bookingStore.getBookingByReference(reference);
    if (!booking) {
      await bookingStore.syncFromNeon();
      booking = bookingStore.getBookingByReference(reference);
    }

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found with this reference." },
        { status: 404 }
      );
    }

    const property = bookingStore.getProperty();

    return NextResponse.json({
      booking,
      property: {
        name: property.name,
        address: property.address,
        city: property.city,
        postalCode: property.postalCode,
        checkInTime: property.checkInTime,
        checkOutTime: property.checkOutTime,
        houseRules: property.houseRules,
      },
      checkInInstructions: {
        doorLockType: "Digital Keypad Smart Lock",
        pinCode: "Will be activated 24h prior to check-in (sent via SMS & email)",
        accessInstructions:
          "Enter through the main portal at Grimmaische Str. 18 using your PIN, take the glass elevator to the 3rd floor, apartment on the left marked 'The Augustus Loft'.",
        emergencyContact: "+49 341 9998877",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load booking" },
      { status: 500 }
    );
  }
}
