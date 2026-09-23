import QRCode from "qrcode";
import { addMinutes, differenceInCalendarDays, isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { neon } from "@neondatabase/serverless";
import { ensureNeonTables } from "../db/bootstrap";
import { calculateBookingPrice, PricingBreakdown } from "./pricing";
import {
  LEIPZIG_PROPERTY_SEED,
  SEED_PHOTOS,
  SEED_AMENITIES,
  SEED_HOUSE_RULES,
  SEED_FAQS,
  SEED_LEIPZIG_GUIDE,
} from "../db/seed-data";

export interface BookingHoldRecord {
  id: string;
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  holdToken: string;
  expiresAt: Date;
  status: "ACTIVE" | "RELEASED" | "CONVERTED";
  createdAt: Date;
}

export interface BookingRecord {
  id: string;
  bookingReference: string; // e.g. LPG-2026-8F4K2
  propertyId: string;
  userId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  numberOfGuests: number;
  totalAmountMinor: number;
  currency: string;
  bookingStatus: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "EXPIRED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  breakdown: PricingBreakdown;
  specialRequests?: string;
  qrCodeDataUrl: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  refundAmountMinor?: number;
  paymentProviderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockedDateRecord {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  reason: string;
  blockedBy: string;
  createdAt: Date;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  actorEmail: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

// In-memory persistent state across requests in current process
class BookingMemoryStore {
  private property = { ...LEIPZIG_PROPERTY_SEED };
  private photos = [...SEED_PHOTOS];
  private amenities = [...SEED_AMENITIES];
  private houseRules = [...SEED_HOUSE_RULES];
  private faqs = [...SEED_FAQS];
  private leipzigGuide = [...SEED_LEIPZIG_GUIDE];
  
  private holds: Map<string, BookingHoldRecord> = new Map();
  private bookings: Map<string, BookingRecord> = new Map();
  private blockedDates: Map<string, BlockedDateRecord> = new Map();
  private auditLogs: AuditLogRecord[] = [];

  constructor() {
    // Add sample initial confirmed booking for realism (in next month)
    const sampleRef = "LPG-2026-EXMP1";
    this.bookings.set(sampleRef, {
      id: "sample-booking-1",
      bookingReference: sampleRef,
      propertyId: this.property.id,
      guestName: "Dr. Clara Schumann",
      guestEmail: "guest@example.com",
      guestPhone: "+49 341 5550192",
      checkInDate: "2026-10-10",
      checkOutDate: "2026-10-13",
      nights: 3,
      numberOfGuests: 2,
      totalAmountMinor: 58500,
      currency: "EUR",
      bookingStatus: "CONFIRMED",
      paymentStatus: "PAID",
      breakdown: {
        nightsCount: 3,
        baseAccommodationMinor: 49500,
        weekendSurchargeMinor: 2500,
        cleaningFeeMinor: 6500,
        touristTaxMinor: 2600,
        discountMinor: 0,
        finalTotalMinor: 58500,
        nightlyBreakdown: [
          { date: "2026-10-10", isWeekend: true, rateMinor: 19000 },
          { date: "2026-10-11", isWeekend: false, rateMinor: 16500 },
          { date: "2026-10-12", isWeekend: false, rateMinor: 16500 },
        ],
      },
      qrCodeDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      createdAt: new Date("2026-09-01T10:00:00Z"),
      updatedAt: new Date("2026-09-01T10:05:00Z"),
    });

    // Add a sample blocked date for maintenance
    this.blockedDates.set("block-1", {
      id: "block-1",
      propertyId: this.property.id,
      startDate: "2026-11-01",
      endDate: "2026-11-03",
      reason: "Annual Stucco & Heating Inspection",
      blockedBy: "ADMIN",
      createdAt: new Date(),
    });
  }

  getProperty() {
    return {
      ...this.property,
      photos: this.photos,
      amenities: this.amenities,
      houseRules: this.houseRules,
      faqs: this.faqs,
      leipzigGuide: this.leipzigGuide,
    };
  }

  // Release expired holds
  releaseExpiredHolds(): number {
    const now = new Date();
    let count = 0;
    for (const hold of this.holds.values()) {
      if (hold.status === "ACTIVE" && isAfter(now, hold.expiresAt)) {
        hold.status = "RELEASED";
        count++;
      }
    }
    return count;
  }

  // Check if dates conflict with any confirmed booking, blocked dates, or active hold
  checkDatesConflict(checkInStr: string, checkOutStr: string, excludeHoldToken?: string): {
    hasConflict: boolean;
    reason?: string;
  } {
    this.releaseExpiredHolds();

    const requestedStart = parseISO(checkInStr);
    const requestedEnd = parseISO(checkOutStr);

    // 1. Check against Confirmed Bookings
    for (const booking of this.bookings.values()) {
      if (
        booking.bookingStatus === "CONFIRMED" ||
        booking.bookingStatus === "CHECKED_IN"
      ) {
        const bookedStart = parseISO(booking.checkInDate);
        const bookedEnd = parseISO(booking.checkOutDate);

        // Date ranges overlap if: StartA < EndB and EndA > StartB
        if (isBefore(requestedStart, bookedEnd) && isAfter(requestedEnd, bookedStart)) {
          return {
            hasConflict: true,
            reason: `Dates conflict with existing confirmed reservation (${booking.checkInDate} to ${booking.checkOutDate})`,
          };
        }
      }
    }

    // 2. Check against Blocked Dates
    for (const blocked of this.blockedDates.values()) {
      const blockStart = parseISO(blocked.startDate);
      const blockEnd = parseISO(blocked.endDate);
      if (isBefore(requestedStart, blockEnd) && isAfter(requestedEnd, blockStart)) {
        return {
          hasConflict: true,
          reason: `Dates are blocked by management (${blocked.reason})`,
        };
      }
    }

    // 3. Check against Active Holds
    const now = new Date();
    for (const hold of this.holds.values()) {
      if (
        hold.status === "ACTIVE" &&
        isBefore(now, hold.expiresAt) &&
        hold.holdToken !== excludeHoldToken
      ) {
        const holdStart = parseISO(hold.checkInDate);
        const holdEnd = parseISO(hold.checkOutDate);
        if (isBefore(requestedStart, holdEnd) && isAfter(requestedEnd, holdStart)) {
          return {
            hasConflict: true,
            reason: "These dates are currently on a temporary 10-minute hold by another guest.",
          };
        }
      }
    }

    return { hasConflict: false };
  }

  // Create 10-minute temporary hold
  createHold(params: {
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    promoCode?: string;
  }): { hold: BookingHoldRecord; priceBreakdown: PricingBreakdown } {
    const today = startOfDay(new Date());
    const start = parseISO(params.checkInDate);
    const end = parseISO(params.checkOutDate);

    if (isBefore(start, today)) {
      throw new Error("Check-in date cannot be in the past");
    }

    const nights = differenceInCalendarDays(end, start);
    if (nights < this.property.minStayNights) {
      throw new Error(
        `Minimum stay requirement is ${this.property.minStayNights} nights for this luxury residence.`
      );
    }

    // Atomically verify availability
    const conflict = this.checkDatesConflict(params.checkInDate, params.checkOutDate);
    if (conflict.hasConflict) {
      throw new Error(conflict.reason || "Selected dates are no longer available.");
    }

    // Generate hold
    const holdToken = `hold_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = addMinutes(new Date(), 10); // 10 minutes hold

    const hold: BookingHoldRecord = {
      id: `hold-${Date.now()}`,
      propertyId: this.property.id,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      holdToken,
      expiresAt,
      status: "ACTIVE",
      createdAt: new Date(),
    };

    this.holds.set(holdToken, hold);

    // Calculate price breakdown
    const priceBreakdown = calculateBookingPrice({
      basePriceMinor: this.property.basePriceMinor,
      cleaningFeeMinor: this.property.cleaningFeeMinor,
      weekendSurchargeMinor: this.property.weekendSurchargeMinor,
      touristTaxRatePercent: this.property.touristTaxRatePercent,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      promoCode: params.promoCode,
    });

    return { hold, priceBreakdown };
  }

  // Get active hold by token
  getHold(holdToken: string): BookingHoldRecord | undefined {
    this.releaseExpiredHolds();
    const hold = this.holds.get(holdToken);
    if (!hold || hold.status !== "ACTIVE" || isAfter(new Date(), hold.expiresAt)) {
      return undefined;
    }
    return hold;
  }

  // Confirm booking
  async confirmBooking(params: {
    holdToken?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    numberOfGuests: number;
    promoCode?: string;
    specialRequests?: string;
    paymentId?: string;
  }): Promise<BookingRecord> {
    let checkIn = "";
    let checkOut = "";

    const hold = params.holdToken ? this.getHold(params.holdToken) : undefined;
    if (hold) {
      checkIn = hold.checkInDate;
      checkOut = hold.checkOutDate;
      hold.status = "CONVERTED";
    } else if (params.checkInDate && params.checkOutDate) {
      checkIn = params.checkInDate;
      checkOut = params.checkOutDate;
    } else {
      throw new Error("Your booking hold has expired or dates are missing. Please re-select your dates.");
    }

    // Double check availability excluding this hold
    const conflict = this.checkDatesConflict(
      checkIn,
      checkOut,
      params.holdToken
    );
    if (conflict.hasConflict) {
      throw new Error(conflict.reason || "Selected dates are no longer available.");
    }

    // Calculate guaranteed price on server
    const breakdown = calculateBookingPrice({
      basePriceMinor: this.property.basePriceMinor,
      cleaningFeeMinor: this.property.cleaningFeeMinor,
      weekendSurchargeMinor: this.property.weekendSurchargeMinor,
      touristTaxRatePercent: this.property.touristTaxRatePercent,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      promoCode: params.promoCode,
    });

    // Generate unique human-readable reference e.g. LPG-2026-8F4K2
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const bookingReference = `LPG-2026-${randomSuffix}`;

    // Generate QR Code data URL
    const qrPayload = JSON.stringify({
      ref: bookingReference,
      property: "The Augustus Loft Leipzig",
      guest: params.guestName,
      dates: `${checkIn} to ${checkOut}`,
      verifyUrl: `https://leipzigstay.de/confirmation/${bookingReference}`,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 280,
      margin: 2,
      color: {
        dark: "#1A202C",
        light: "#FFFFFF",
      },
    });

    if (hold) {
      hold.status = "CONVERTED";
    }

    const booking: BookingRecord = {
      id: `book-${Date.now()}-${randomSuffix}`,
      bookingReference,
      propertyId: this.property.id,
      guestName: params.guestName,
      guestEmail: params.guestEmail.toLowerCase().trim(),
      guestPhone: params.guestPhone,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nights: breakdown.nightsCount,
      numberOfGuests: params.numberOfGuests,
      totalAmountMinor: breakdown.finalTotalMinor,
      currency: "EUR",
      bookingStatus: "CONFIRMED",
      paymentStatus: "PAID",
      breakdown,
      specialRequests: params.specialRequests,
      qrCodeDataUrl,
      paymentProviderId: params.paymentId || `mock_pi_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.bookings.set(bookingReference, booking);

    // Persist directly to Neon PostgreSQL database if DATABASE_URL is configured
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl && !dbUrl.includes("sample")) {
        await ensureNeonTables();
        const sql = neon(dbUrl);
        await sql`
          INSERT INTO bookings (
            id, booking_reference, property_id, guest_name, guest_email, guest_phone,
            check_in_date, check_out_date, nights, number_of_guests, total_amount_minor,
            currency, booking_status, payment_status, special_requests, qr_code_data_url, payment_provider_id
          ) VALUES (
            gen_random_uuid(),
            ${booking.bookingReference},
            ${this.property.id}::uuid,
            ${booking.guestName},
            ${booking.guestEmail},
            ${booking.guestPhone},
            ${booking.checkInDate}::date,
            ${booking.checkOutDate}::date,
            ${booking.nights},
            ${booking.numberOfGuests},
            ${booking.totalAmountMinor},
            ${booking.currency},
            ${booking.bookingStatus},
            ${booking.paymentStatus},
            ${booking.specialRequests || null},
            ${booking.qrCodeDataUrl},
            ${booking.paymentProviderId || null}
          )
          ON CONFLICT (booking_reference) DO NOTHING;
        `;

        await sql`
          INSERT INTO booking_price_breakdown (
            id, booking_reference, nights_count, base_accommodation_minor,
            weekend_surcharge_minor, cleaning_fee_minor, tourist_tax_minor,
            discount_minor, promo_code_used, final_total_minor
          ) VALUES (
            gen_random_uuid(),
            ${booking.bookingReference},
            ${breakdown.nightsCount},
            ${breakdown.baseAccommodationMinor},
            ${breakdown.weekendSurchargeMinor},
            ${breakdown.cleaningFeeMinor},
            ${breakdown.touristTaxMinor},
            ${breakdown.discountMinor},
            ${breakdown.promoCodeApplied || null},
            ${breakdown.finalTotalMinor}
          );
        `;
      }
    } catch (neonErr) {
      console.warn("⚠️ Neon persistence notice:", neonErr);
    }

    this.addAuditLog({
      action: "BOOKING_CONFIRMED",
      actorEmail: params.guestEmail,
      entityType: "BOOKING",
      entityId: bookingReference,
      details: {
        totalAmountMinor: breakdown.finalTotalMinor,
        checkInDate: checkIn,
        checkOutDate: checkOut,
      },
    });

    return booking;
  }

  // Synchronize bookings from Neon PostgreSQL
  async syncFromNeon(): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || dbUrl.includes("sample")) return;

    try {
      await ensureNeonTables();
      const sql = neon(dbUrl);
      const rows = await sql`
        SELECT * FROM bookings ORDER BY created_at DESC;
      `;
      for (const row of rows) {
        const ref = row.booking_reference;
        if (!this.bookings.has(ref)) {
          this.bookings.set(ref, {
            id: String(row.id),
            bookingReference: ref,
            propertyId: String(row.property_id || this.property.id),
            guestName: String(row.guest_name),
            guestEmail: String(row.guest_email),
            guestPhone: String(row.guest_phone || ""),
            checkInDate: typeof row.check_in_date === "string" ? row.check_in_date : new Date(row.check_in_date).toISOString().split("T")[0],
            checkOutDate: typeof row.check_out_date === "string" ? row.check_out_date : new Date(row.check_out_date).toISOString().split("T")[0],
            nights: Number(row.nights),
            numberOfGuests: Number(row.number_of_guests),
            totalAmountMinor: Number(row.total_amount_minor),
            currency: String(row.currency || "EUR"),
            bookingStatus: row.booking_status as BookingRecord["bookingStatus"],
            paymentStatus: row.payment_status as BookingRecord["paymentStatus"],
            specialRequests: row.special_requests || undefined,
            qrCodeDataUrl: row.qr_code_data_url || "",
            cancellationReason: row.cancellation_reason || undefined,
            refundAmountMinor: row.refund_amount_minor ? Number(row.refund_amount_minor) : undefined,
            paymentProviderId: row.payment_provider_id || undefined,
            breakdown: {
              nightsCount: Number(row.nights),
              baseAccommodationMinor: Number(row.total_amount_minor) - 6500,
              weekendSurchargeMinor: 0,
              cleaningFeeMinor: 6500,
              touristTaxMinor: 0,
              discountMinor: 0,
              finalTotalMinor: Number(row.total_amount_minor),
              nightlyBreakdown: [],
            },
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
          });
        }
      }
    } catch (syncErr) {
      console.warn("⚠️ Neon sync notice:", syncErr);
    }
  }

  // Retrieve booking by reference
  getBookingByReference(reference: string): BookingRecord | undefined {
    return this.bookings.get(reference.toUpperCase());
  }

  // Retrieve all bookings for a guest email
  getBookingsByEmail(email: string): BookingRecord[] {
    const normalized = email.toLowerCase().trim();
    const result: BookingRecord[] = [];
    for (const b of this.bookings.values()) {
      if (b.guestEmail.toLowerCase() === normalized) {
        result.push(b);
      }
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Retrieve all bookings (for Admin)
  getAllBookings(): BookingRecord[] {
    return Array.from(this.bookings.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Cancel booking with policy calculation
  cancelBooking(reference: string, reason: string, actorEmail: string): {
    booking: BookingRecord;
    refundAmountMinor: number;
    policyMessage: string;
  } {
    const booking = this.getBookingByReference(reference);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.bookingStatus === "CANCELLED") {
      throw new Error("Booking is already cancelled");
    }

    const checkIn = parseISO(booking.checkInDate);
    const today = startOfDay(new Date());
    const daysUntilCheckIn = differenceInCalendarDays(checkIn, today);

    let refundAmountMinor = 0;
    let policyMessage = "";

    // Cancellation Policy:
    // > 14 days before: 100% refund
    // 7 - 14 days before: 50% accommodation + 100% cleaning fee
    // < 7 days before: 0% accommodation, cleaning fee refunded
    if (daysUntilCheckIn >= 14) {
      refundAmountMinor = booking.totalAmountMinor;
      policyMessage = "Full 100% refund applied (cancelled 14+ days before arrival).";
    } else if (daysUntilCheckIn >= 7) {
      const accomSubtotal = booking.breakdown.baseAccommodationMinor + booking.breakdown.weekendSurchargeMinor;
      const partialAccom = Math.round(accomSubtotal * 0.5);
      refundAmountMinor = partialAccom + booking.breakdown.cleaningFeeMinor;
      policyMessage = "50% accommodation refund + full cleaning fee refund applied (7 to 14 days before arrival).";
    } else {
      refundAmountMinor = booking.breakdown.cleaningFeeMinor;
      policyMessage = "Late cancellation within 7 days. Accommodation is non-refundable; cleaning fee has been refunded.";
    }

    booking.bookingStatus = "CANCELLED";
    booking.paymentStatus = refundAmountMinor === booking.totalAmountMinor ? "REFUNDED" : "PARTIALLY_REFUNDED";
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    booking.refundAmountMinor = refundAmountMinor;
    booking.updatedAt = new Date();

    this.addAuditLog({
      action: "BOOKING_CANCELLED",
      actorEmail,
      entityType: "BOOKING",
      entityId: booking.bookingReference,
      details: { refundAmountMinor, policyMessage, reason },
    });

    return { booking, refundAmountMinor, policyMessage };
  }

  // Admin Block Dates
  blockDates(startDate: string, endDate: string, reason: string): BlockedDateRecord {
    const id = `block-${Date.now()}`;
    const blocked: BlockedDateRecord = {
      id,
      propertyId: this.property.id,
      startDate,
      endDate,
      reason,
      blockedBy: "ADMIN",
      createdAt: new Date(),
    };
    this.blockedDates.set(id, blocked);

    this.addAuditLog({
      action: "DATES_BLOCKED",
      actorEmail: "admin@leipzigstay.de",
      entityType: "BLOCKED_DATES",
      entityId: id,
      details: { startDate, endDate, reason },
    });

    return blocked;
  }

  // Admin Unblock Dates
  unblockDates(id: string): boolean {
    const existed = this.blockedDates.delete(id);
    if (existed) {
      this.addAuditLog({
        action: "DATES_UNBLOCKED",
        actorEmail: "admin@leipzigstay.de",
        entityType: "BLOCKED_DATES",
        entityId: id,
      });
    }
    return existed;
  }

  getBlockedDates(): BlockedDateRecord[] {
    return Array.from(this.blockedDates.values());
  }

  // Admin update booking status (CHECKED_IN, CHECKED_OUT, etc.)
  updateBookingStatus(
    reference: string,
    newStatus: BookingRecord["bookingStatus"]
  ): BookingRecord {
    const booking = this.getBookingByReference(reference);
    if (!booking) {
      throw new Error("Booking not found");
    }
    booking.bookingStatus = newStatus;
    booking.updatedAt = new Date();

    this.addAuditLog({
      action: `STATUS_UPDATED_${newStatus}`,
      actorEmail: "admin@leipzigstay.de",
      entityType: "BOOKING",
      entityId: reference,
    });

    return booking;
  }

  // Audit logging
  addAuditLog(entry: Omit<AuditLogRecord, "id" | "createdAt">) {
    this.auditLogs.unshift({
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date(),
    });
  }

  getAuditLogs(): AuditLogRecord[] {
    return this.auditLogs.slice(0, 50);
  }
}

// Global singleton instance
declare global {
  // eslint-disable-next-line no-var
  var __bookingMemoryStore: BookingMemoryStore | undefined;
}

export const bookingStore = globalThis.__bookingMemoryStore || new BookingMemoryStore();
if (process.env.NODE_ENV !== "production") {
  globalThis.__bookingMemoryStore = bookingStore;
}
