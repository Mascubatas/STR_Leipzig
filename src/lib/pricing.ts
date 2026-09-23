import { differenceInCalendarDays, eachDayOfInterval, format, isFriday, isSaturday, parseISO } from "date-fns";

export interface PricingBreakdown {
  nightsCount: number;
  baseAccommodationMinor: number;
  weekendSurchargeMinor: number;
  cleaningFeeMinor: number;
  touristTaxMinor: number;
  discountMinor: number;
  finalTotalMinor: number;
  promoCodeApplied?: string;
  nightlyBreakdown: Array<{
    date: string;
    isWeekend: boolean;
    rateMinor: number;
  }>;
}

export interface PricingParams {
  basePriceMinor: number;
  cleaningFeeMinor: number;
  weekendSurchargeMinor: number;
  touristTaxRatePercent: number; // e.g. 5
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  numberOfGuests?: number;
  promoCode?: string;
  seasonalOverrides?: Array<{ startDate: string; endDate: string; nightlyRateMinor: number }>;
  nightlyOverrides?: Record<string, number>;
}

export function calculateBookingPrice(params: PricingParams): PricingBreakdown {
  const {
    basePriceMinor,
    cleaningFeeMinor,
    weekendSurchargeMinor,
    touristTaxRatePercent,
    checkInDate,
    checkOutDate,
    promoCode,
    seasonalOverrides = [],
    nightlyOverrides = {},
  } = params;

  const start = parseISO(checkInDate);
  const end = parseISO(checkOutDate);

  const nightsCount = differenceInCalendarDays(end, start);
  if (nightsCount <= 0) {
    throw new Error("Check-out date must be after check-in date");
  }

  // Calculate each night separately (excluding the day of checkout)
  const days = eachDayOfInterval({
    start,
    end: new Date(end.getTime() - 24 * 60 * 60 * 1000),
  });

  let baseAccommodationMinor = 0;
  let weekendSurchargeMinorTotal = 0;
  const nightlyBreakdown: PricingBreakdown["nightlyBreakdown"] = [];

  for (const day of days) {
    const dateStr = format(day, "yyyy-MM-dd");
    const isWeekendNight = isFriday(day) || isSaturday(day);

    let nightlyRate = basePriceMinor;

    // Check specific nightly override first
    if (nightlyOverrides[dateStr] !== undefined) {
      nightlyRate = nightlyOverrides[dateStr];
    } else {
      // Check seasonal overrides
      const seasonal = seasonalOverrides.find(
        (s) => dateStr >= s.startDate && dateStr <= s.endDate
      );
      if (seasonal) {
        nightlyRate = seasonal.nightlyRateMinor;
      }
    }

    baseAccommodationMinor += nightlyRate;

    let weekendAdd = 0;
    if (isWeekendNight) {
      weekendAdd = weekendSurchargeMinor;
      weekendSurchargeMinorTotal += weekendAdd;
    }

    nightlyBreakdown.push({
      date: dateStr,
      isWeekend: isWeekendNight,
      rateMinor: nightlyRate + weekendAdd,
    });
  }

  const accommodationSubtotal = baseAccommodationMinor + weekendSurchargeMinorTotal;

  // Promo code discounts
  let discountMinor = 0;
  let promoCodeApplied: string | undefined = undefined;

  if (promoCode) {
    const normalized = promoCode.trim().toUpperCase();
    if (normalized === "LEIPZIG10" || normalized === "WELCOME10") {
      discountMinor = Math.round((accommodationSubtotal * 10) / 100);
      promoCodeApplied = normalized;
    } else if (normalized === "BACH2026") {
      discountMinor = Math.round((accommodationSubtotal * 15) / 100);
      promoCodeApplied = normalized;
    }
  }

  const taxableAccommodation = Math.max(0, accommodationSubtotal - discountMinor);

  // Leipzig Gästetaxe (5% statutory tourist tax on accommodation)
  const touristTaxMinor = Math.round((taxableAccommodation * touristTaxRatePercent) / 100);

  const finalTotalMinor = taxableAccommodation + cleaningFeeMinor + touristTaxMinor;

  return {
    nightsCount,
    baseAccommodationMinor,
    weekendSurchargeMinor: weekendSurchargeMinorTotal,
    cleaningFeeMinor,
    touristTaxMinor,
    discountMinor,
    finalTotalMinor,
    promoCodeApplied,
    nightlyBreakdown,
  };
}

export function formatMinorToEuro(cents: number): string {
  const euros = cents / 100;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(euros);
}
