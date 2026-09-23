import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  index,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// -------------------------------------------------------------
// 1. Users & Authentication
// -------------------------------------------------------------
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    role: varchar("role", { length: 20 }).notNull().default("GUEST"), // "GUEST" | "ADMIN"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_users_email").on(table.email),
    index("idx_users_role").on(table.role),
  ]
);

// -------------------------------------------------------------
// 2. Cancellation Policies
// -------------------------------------------------------------
export const cancellationPolicies = pgTable(
  "cancellation_policies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description").notNull(),
    freeCancellationDays: integer("free_cancellation_days").notNull().default(14),
    partialRefundDays: integer("partial_refund_days").notNull().default(7),
    partialRefundPercent: integer("partial_refund_percent").notNull().default(50),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// -------------------------------------------------------------
// 3. Properties (Supports multiple, initial Leipzig property)
// -------------------------------------------------------------
export const properties = pgTable(
  "properties",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    headline: text("headline").notNull(),
    description: text("description").notNull(),
    address: text("address").notNull(),
    city: varchar("city", { length: 100 }).notNull().default("Leipzig"),
    postalCode: varchar("postal_code", { length: 20 }).notNull(),
    country: varchar("country", { length: 50 }).notNull().default("Germany"),
    latitude: varchar("latitude", { length: 30 }),
    longitude: varchar("longitude", { length: 30 }),
    maxGuests: integer("max_guests").notNull().default(4),
    bedrooms: integer("bedrooms").notNull().default(2),
    beds: integer("beds").notNull().default(2),
    bathrooms: integer("bathrooms").notNull().default(1),
    checkInTime: varchar("check_in_time", { length: 20 }).notNull().default("15:00"),
    checkOutTime: varchar("check_out_time", { length: 20 }).notNull().default("11:00"),
    basePriceMinor: integer("base_price_minor").notNull(), // cents, e.g. 14900 = 149.00 EUR
    cleaningFeeMinor: integer("cleaning_fee_minor").notNull().default(6500),
    weekendSurchargeMinor: integer("weekend_surcharge_minor").notNull().default(2000),
    touristTaxRatePercent: integer("tourist_tax_rate_percent").notNull().default(5), // Leipzig Gästetaxe: 5%
    minStayNights: integer("min_stay_nights").notNull().default(2),
    leadTimeHours: integer("lead_time_hours").notNull().default(12),
    cancellationPolicyId: uuid("cancellation_policy_id").references(() => cancellationPolicies.id),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_properties_slug").on(table.slug),
    index("idx_properties_city").on(table.city),
  ]
);

// -------------------------------------------------------------
// 4. Property Photos
// -------------------------------------------------------------
export const propertyPhotos = pgTable(
  "property_photos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    caption: varchar("caption", { length: 255 }),
    sortOrder: integer("sort_order").notNull().default(0),
    isHero: boolean("is_hero").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_photos_property").on(table.propertyId),
  ]
);

// -------------------------------------------------------------
// 5. Amenities & Property Amenities
// -------------------------------------------------------------
export const amenities = pgTable(
  "amenities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(), // "Essentials", "Kitchen", "Bathroom", "Location", "Safety"
    iconName: varchar("icon_name", { length: 50 }).notNull(),
  }
);

export const propertyAmenities = pgTable(
  "property_amenities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
    amenityId: uuid("amenity_id").notNull().references(() => amenities.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("idx_prop_amenity").on(table.propertyId, table.amenityId),
  ]
);

// -------------------------------------------------------------
// 6. House Rules
// -------------------------------------------------------------
export const houseRules = pgTable(
  "house_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 150 }).notNull(),
    description: text("description"),
    ruleType: varchar("rule_type", { length: 50 }).notNull().default("STANDARD"), // "CHECKIN", "NO_SMOKING", "QUIET_HOURS", "PETS", "PARTIES"
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    index("idx_house_rules_prop").on(table.propertyId),
  ]
);

// -------------------------------------------------------------
// 7. Availability Rules & Blocked Dates
// -------------------------------------------------------------
export const blockedDates = pgTable(
  "blocked_dates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    reason: text("reason").notNull().default("Owner Block"),
    blockedBy: varchar("blocked_by", { length: 50 }).notNull().default("ADMIN"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_blocked_dates_prop_range").on(table.propertyId, table.startDate, table.endDate),
  ]
);

export const seasonalRates = pgTable(
  "seasonal_rates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    nightlyRateMinor: integer("nightly_rate_minor").notNull(),
    minStayNights: integer("min_stay_nights"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_seasonal_prop_range").on(table.propertyId, table.startDate, table.endDate),
  ]
);

export const nightlyRates = pgTable(
  "nightly_rates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    nightlyRateMinor: integer("nightly_rate_minor").notNull(),
  },
  (table) => [
    uniqueIndex("idx_nightly_rate_date").on(table.propertyId, table.date),
  ]
);

export const minimumStays = pgTable(
  "minimum_stays",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    minNights: integer("min_nights").notNull(),
  },
  (table) => [
    index("idx_min_stays_prop_range").on(table.propertyId, table.startDate, table.endDate),
  ]
);

// -------------------------------------------------------------
// 8. Promo Codes
// -------------------------------------------------------------
export const promoCodes = pgTable(
  "promo_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    discountPercent: integer("discount_percent").default(0),
    discountMinor: integer("discount_minor").default(0),
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").notNull().default(0),
    validFrom: timestamp("valid_from", { withTimezone: true }),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// -------------------------------------------------------------
// 9. Bookings & Holds
// -------------------------------------------------------------
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingReference: varchar("booking_reference", { length: 30 }).notNull().unique(), // e.g. LPG-2026-8F4K2
    propertyId: uuid("property_id").notNull().references(() => properties.id),
    userId: uuid("user_id").references(() => users.id),
    guestName: varchar("guest_name", { length: 255 }).notNull(),
    guestEmail: varchar("guest_email", { length: 255 }).notNull(),
    guestPhone: varchar("guest_phone", { length: 50 }).notNull(),
    checkInDate: date("check_in_date").notNull(),
    checkOutDate: date("check_out_date").notNull(),
    nights: integer("nights").notNull(),
    numberOfGuests: integer("number_of_guests").notNull().default(1),
    totalAmountMinor: integer("total_amount_minor").notNull(), // in cents
    currency: varchar("currency", { length: 10 }).notNull().default("EUR"),
    bookingStatus: varchar("booking_status", { length: 30 }).notNull().default("PENDING"),
    // PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, EXPIRED, REFUNDED, NO_SHOW
    paymentStatus: varchar("payment_status", { length: 30 }).notNull().default("PENDING"),
    // PENDING, AUTHORIZED, PAID, FAILED, CANCELLED, PARTIALLY_REFUNDED, REFUNDED
    cancellationReason: text("cancellation_reason"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    refundAmountMinor: integer("refund_amount_minor").default(0),
    specialRequests: text("special_requests"),
    qrCodeDataUrl: text("qr_code_data_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_bookings_reference").on(table.bookingReference),
    index("idx_bookings_prop_dates").on(table.propertyId, table.checkInDate, table.checkOutDate),
    index("idx_bookings_status").on(table.bookingStatus),
    index("idx_bookings_user").on(table.userId),
  ]
);

export const bookingGuests = pgTable(
  "booking_guests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    isLeadGuest: boolean("is_lead_guest").notNull().default(false),
    ageCategory: varchar("age_category", { length: 20 }).notNull().default("ADULT"), // ADULT, CHILD, INFANT
  },
  (table) => [
    index("idx_booking_guests_booking").on(table.bookingId),
  ]
);

export const bookingHolds = pgTable(
  "booking_holds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id").notNull().references(() => properties.id),
    checkInDate: date("check_in_date").notNull(),
    checkOutDate: date("check_out_date").notNull(),
    holdToken: varchar("hold_token", { length: 100 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("ACTIVE"), // ACTIVE, RELEASED, CONVERTED
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_holds_prop_dates").on(table.propertyId, table.checkInDate, table.checkOutDate),
    index("idx_holds_expires").on(table.expiresAt, table.status),
  ]
);

export const bookingNights = pgTable(
  "booking_nights",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    rateMinor: integer("rate_minor").notNull(),
  },
  (table) => [
    uniqueIndex("idx_booking_nights_unique").on(table.bookingId, table.date),
  ]
);

export const bookingPriceBreakdown = pgTable(
  "booking_price_breakdown",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id").notNull().unique().references(() => bookings.id, { onDelete: "cascade" }),
    nightsCount: integer("nights_count").notNull(),
    baseAccommodationMinor: integer("base_accommodation_minor").notNull(),
    weekendSurchargeMinor: integer("weekend_surcharge_minor").notNull().default(0),
    cleaningFeeMinor: integer("cleaning_fee_minor").notNull(),
    touristTaxMinor: integer("tourist_tax_minor").notNull(), // 5% Leipzig Gästetaxe
    discountMinor: integer("discount_minor").notNull().default(0),
    promoCodeUsed: varchar("promo_code_used", { length: 50 }),
    finalTotalMinor: integer("final_total_minor").notNull(),
  }
);

// -------------------------------------------------------------
// 10. Payments & Refunds
// -------------------------------------------------------------
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id").notNull().references(() => bookings.id),
    paymentProvider: varchar("payment_provider", { length: 50 }).notNull().default("STRIPE"),
    providerPaymentId: varchar("provider_payment_id", { length: 255 }).notNull(), // e.g. pi_xxx or cs_test_xxx
    idempotencyKey: varchar("idempotency_key", { length: 255 }).notNull().unique(),
    amountMinor: integer("amount_minor").notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("EUR"),
    status: varchar("status", { length: 30 }).notNull().default("PENDING"),
    // PENDING, AUTHORIZED, PAID, FAILED, CANCELLED, PARTIALLY_REFUNDED, REFUNDED
    paymentMethod: varchar("payment_method", { length: 50 }).default("card"),
    rawWebhookData: jsonb("raw_webhook_data"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_payments_idempotency").on(table.idempotencyKey),
    index("idx_payments_booking").on(table.bookingId),
    index("idx_payments_provider_id").on(table.providerPaymentId),
  ]
);

export const refunds = pgTable(
  "refunds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    paymentId: uuid("payment_id").notNull().references(() => payments.id),
    bookingId: uuid("booking_id").notNull().references(() => bookings.id),
    amountMinor: integer("amount_minor").notNull(),
    status: varchar("status", { length: 30 }).notNull().default("COMPLETED"), // PENDING, COMPLETED, FAILED
    reason: text("reason").notNull(),
    providerRefundId: varchar("provider_refund_id", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_refunds_payment").on(table.paymentId),
    index("idx_refunds_booking").on(table.bookingId),
  ]
);

// -------------------------------------------------------------
// 11. Audit Logs
// -------------------------------------------------------------
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actor_id"),
    actorEmail: varchar("actor_email", { length: 255 }),
    actorRole: varchar("actor_role", { length: 20 }).notNull().default("SYSTEM"),
    action: varchar("action", { length: 100 }).notNull(), // "BLOCK_DATES", "CANCEL_BOOKING", "UPDATE_PRICE", etc.
    entityType: varchar("entity_type", { length: 50 }).notNull(), // "BOOKING", "PROPERTY", "BLOCKED_DATES"
    entityId: varchar("entity_id", { length: 255 }),
    details: jsonb("details"),
    ipAddress: varchar("ip_address", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_audit_logs_action").on(table.action),
    index("idx_audit_logs_entity").on(table.entityType, table.entityId),
  ]
);

// -------------------------------------------------------------
// Relations
// -------------------------------------------------------------
export const propertiesRelations = relations(properties, ({ many, one }) => ({
  photos: many(propertyPhotos),
  propertyAmenities: many(propertyAmenities),
  houseRules: many(houseRules),
  blockedDates: many(blockedDates),
  seasonalRates: many(seasonalRates),
  nightlyRates: many(nightlyRates),
  bookings: many(bookings),
  cancellationPolicy: one(cancellationPolicies, {
    fields: [properties.cancellationPolicyId],
    references: [cancellationPolicies.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  property: one(properties, {
    fields: [bookings.propertyId],
    references: [properties.id],
  }),
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  guests: many(bookingGuests),
  nights: many(bookingNights),
  breakdown: one(bookingPriceBreakdown, {
    fields: [bookings.id],
    references: [bookingPriceBreakdown.bookingId],
  }),
  payments: many(payments),
  refunds: many(refunds),
  holds: many(bookingHolds),
}));
