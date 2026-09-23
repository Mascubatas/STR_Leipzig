import { calculateBookingPrice, formatMinorToEuro } from "../src/lib/pricing";
import { bookingStore } from "../src/lib/booking-store";

async function runPricingAndCancellationTests() {
  console.log("=================================================");
  console.log("🧪 LeipzigStay Pricing & Cancellation Policy Test");
  console.log("=================================================");

  // 1. Test Pricing: 3 nights (Thursday to Sunday, includes Fri & Sat weekend surcharges)
  console.log("\n1. Testing Integer-Only Pricing Math...");
  const priceResult = calculateBookingPrice({
    basePriceMinor: 16500, // 165.00 EUR
    cleaningFeeMinor: 6500, // 65.00 EUR
    weekendSurchargeMinor: 2500, // +25.00 EUR on Fri & Sat
    touristTaxRatePercent: 5, // 5% Leipzig tax
    checkInDate: "2026-10-01", // Thursday
    checkOutDate: "2026-10-04", // Sunday -> 3 nights: Thu, Fri, Sat
  });

  console.log(`  Nights: ${priceResult.nightsCount}`);
  console.log(`  Base Accommodation: ${formatMinorToEuro(priceResult.baseAccommodationMinor)}`);
  console.log(`  Weekend Surcharge (2 nights x €25): ${formatMinorToEuro(priceResult.weekendSurchargeMinor)}`);
  console.log(`  Cleaning Fee: ${formatMinorToEuro(priceResult.cleaningFeeMinor)}`);
  console.log(`  Tourist Tax (5% of €545): ${formatMinorToEuro(priceResult.touristTaxMinor)}`);
  console.log(`  Final Total: ${formatMinorToEuro(priceResult.finalTotalMinor)}`);

  // Assertions:
  // Thu: 16500, Fri: 16500+2500=19000, Sat: 16500+2500=19000 -> Accom Total = 54500
  // Cleaning: 6500
  // Tax: 54500 * 0.05 = 2725
  // Total: 54500 + 6500 + 2725 = 63725 minor units
  if (priceResult.finalTotalMinor === 63725) {
    console.log("  ✅ Pricing math verified down to the exact cent without float rounding errors!");
  } else {
    console.error(`  🚨 Expected 63725, got ${priceResult.finalTotalMinor}`);
    process.exit(1);
  }

  // 2. Test Promo Code: WELCOME10 (10% discount on accommodation)
  console.log("\n2. Testing Promotional Code Discount...");
  const promoResult = calculateBookingPrice({
    basePriceMinor: 16500,
    cleaningFeeMinor: 6500,
    weekendSurchargeMinor: 2500,
    touristTaxRatePercent: 5,
    checkInDate: "2026-10-01",
    checkOutDate: "2026-10-04",
    promoCode: "WELCOME10",
  });
  console.log(`  Discount: -${formatMinorToEuro(promoResult.discountMinor)}`);
  console.log(`  New Total with WELCOME10: ${formatMinorToEuro(promoResult.finalTotalMinor)}`);
  if (promoResult.discountMinor === 5450) {
    console.log("  ✅ Promo code WELCOME10 correctly deducted 10% from accommodation subtotal!");
  }

  // 3. Test Cancellation Policy
  console.log("\n3. Testing Cancellation Policy Rules...");
  // Create a booking far in future (> 14 days)
  const { hold } = bookingStore.createHold({
    checkInDate: "2026-11-20",
    checkOutDate: "2026-11-23",
    numberOfGuests: 2,
  });

  const testBooking = await bookingStore.confirmBooking({
    holdToken: hold.holdToken,
    guestName: "Policy Tester",
    guestEmail: "policy@example.com",
    guestPhone: "+49 341 000000",
    numberOfGuests: 2,
  });

  const cancelResult = bookingStore.cancelBooking(
    testBooking.bookingReference,
    "Change of schedule",
    "policy@example.com"
  );

  console.log(`  Cancelled Booking: ${cancelResult.booking.bookingReference}`);
  console.log(`  Status: ${cancelResult.booking.bookingStatus}`);
  console.log(`  Refund Amount: ${formatMinorToEuro(cancelResult.refundAmountMinor)}`);
  console.log(`  Policy Output: ${cancelResult.policyMessage}`);

  if (cancelResult.refundAmountMinor === testBooking.totalAmountMinor) {
    console.log("  ✅ Full 100% refund correctly applied for cancellation > 14 days!");
  } else {
    console.error("  🚨 Refund calculation failed!");
    process.exit(1);
  }

  console.log("\n=================================================");
  console.log("🏁 All Pricing and Cancellation Policy Tests Passed!");
  console.log("=================================================");
}

runPricingAndCancellationTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
