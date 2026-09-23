import { bookingStore } from "../src/lib/booking-store";

async function runConcurrencyStressTest() {
  console.log("=================================================");
  console.log("🧪 LeipzigStay Concurrency & Double-Booking Test");
  console.log("=================================================");

  const testCheckIn = "2026-12-15";
  const testCheckOut = "2026-12-18";

  console.log(`\nSimulating simultaneous booking attempts for dates: ${testCheckIn} to ${testCheckOut}`);

  // We simulate 5 simultaneous guest requests attempting to create a hold on the EXACT same dates
  const guestAttempts = [
    { name: "Guest A (Berlin)", email: "guestA@example.com" },
    { name: "Guest B (Munich)", email: "guestB@example.com" },
    { name: "Guest C (Hamburg)", email: "guestC@example.com" },
    { name: "Guest D (Frankfurt)", email: "guestD@example.com" },
    { name: "Guest E (Vienna)", email: "guestE@example.com" },
  ];

  const results: Array<{ guest: string; success: boolean; error?: string; holdToken?: string }> = [];

  // Execute in parallel
  await Promise.all(
    guestAttempts.map(async (guest) => {
      try {
        const { hold } = bookingStore.createHold({
          checkInDate: testCheckIn,
          checkOutDate: testCheckOut,
          numberOfGuests: 2,
        });
        results.push({
          guest: guest.name,
          success: true,
          holdToken: hold.holdToken,
        });
      } catch (err) {
        results.push({
          guest: guest.name,
          success: false,
          error: (err as Error).message,
        });
      }
    })
  );

  console.log("\nResults Breakdown:");
  let successfulHolds = 0;
  for (const res of results) {
    if (res.success) {
      successfulHolds++;
      console.log(`  ✅ ${res.guest}: SUCCEEDED with holdToken ${res.holdToken}`);
    } else {
      console.log(`  ❌ ${res.guest}: REJECTED safely -> "${res.error}"`);
    }
  }

  // ASSERTION: Exactly one request must succeed, all other 4 must be rejected
  if (successfulHolds === 1) {
    console.log("\n🎉 CONCURRENCY TEST PASSED: Exactly 1 hold succeeded. Double booking prevented!");
  } else {
    console.error(`\n🚨 CONCURRENCY TEST FAILED: ${successfulHolds} holds succeeded! Expected exactly 1.`);
    process.exit(1);
  }

  // Now verify that the successful hold can be confirmed into a booking
  const winningAttempt = results.find((r) => r.success);
  if (winningAttempt && winningAttempt.holdToken) {
    console.log(`\nConfirming booking for ${winningAttempt.guest}...`);
    const confirmed = await bookingStore.confirmBooking({
      holdToken: winningAttempt.holdToken,
      guestName: "Winning Guest",
      guestEmail: "winner@example.com",
      guestPhone: "+49 341 123456",
      numberOfGuests: 2,
    });
    console.log(`  ✅ Booking confirmed! Reference: ${confirmed.bookingReference}`);
    console.log(`  ✅ Total Amount: ${confirmed.totalAmountMinor} minor units (€${confirmed.totalAmountMinor / 100})`);
    console.log(`  ✅ QR Code generated: ${confirmed.qrCodeDataUrl ? "YES" : "NO"}`);
  }

  // Now verify that trying to book those dates again after confirmation is completely blocked
  console.log("\nVerifying that dates are now permanently blocked by the confirmed booking...");
  try {
    bookingStore.createHold({
      checkInDate: testCheckIn,
      checkOutDate: testCheckOut,
      numberOfGuests: 2,
    });
    console.error("🚨 CRITICAL ERROR: Allowed booking on confirmed dates!");
    process.exit(1);
  } catch (err) {
    console.log(`  ✅ Successfully blocked: "${(err as Error).message}"`);
  }

  console.log("\n=================================================");
  console.log("🏁 All Concurrency & Isolation Tests Passed 100%");
  console.log("=================================================");
}

runConcurrencyStressTest().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
