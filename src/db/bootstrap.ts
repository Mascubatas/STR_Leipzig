import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "./connection";
import { LEIPZIG_PROPERTY_SEED } from "./seed-data";

let isBootstrapped = false;

export async function ensureNeonTables(force = false) {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    return { success: false, reason: "No database connection URL found (neither DATABASE_URL nor POSTGRES_URL)" };
  }
  if (isBootstrapped && !force) {
    return { success: true, reason: "Already bootstrapped" };
  }

  try {
    const sql = neon(connectionString);

    // Create tables if they do not exist yet
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'GUEST',
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        headline TEXT NOT NULL,
        description TEXT NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL DEFAULT 'Leipzig',
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(50) NOT NULL DEFAULT 'Germany',
        max_guests INTEGER NOT NULL DEFAULT 4,
        bedrooms INTEGER NOT NULL DEFAULT 2,
        beds INTEGER NOT NULL DEFAULT 2,
        bathrooms INTEGER NOT NULL DEFAULT 1,
        check_in_time VARCHAR(20) NOT NULL DEFAULT '15:00',
        check_out_time VARCHAR(20) NOT NULL DEFAULT '11:00',
        base_price_minor INTEGER NOT NULL,
        cleaning_fee_minor INTEGER NOT NULL DEFAULT 6500,
        weekend_surcharge_minor INTEGER NOT NULL DEFAULT 2500,
        tourist_tax_rate_percent INTEGER NOT NULL DEFAULT 5,
        min_stay_nights INTEGER NOT NULL DEFAULT 2,
        lead_time_hours INTEGER NOT NULL DEFAULT 12,
        is_published BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_reference VARCHAR(30) UNIQUE NOT NULL,
        property_id UUID,
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(50) NOT NULL,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        nights INTEGER NOT NULL,
        number_of_guests INTEGER NOT NULL DEFAULT 1,
        total_amount_minor INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
        booking_status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
        payment_status VARCHAR(30) NOT NULL DEFAULT 'PAID',
        cancellation_reason TEXT,
        cancelled_at TIMESTAMPTZ,
        refund_amount_minor INTEGER DEFAULT 0,
        special_requests TEXT,
        qr_code_data_url TEXT,
        payment_provider_id VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS booking_price_breakdown (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID,
        booking_reference VARCHAR(30),
        nights_count INTEGER NOT NULL,
        base_accommodation_minor INTEGER NOT NULL,
        weekend_surcharge_minor INTEGER NOT NULL DEFAULT 0,
        cleaning_fee_minor INTEGER NOT NULL,
        tourist_tax_minor INTEGER NOT NULL,
        discount_minor INTEGER NOT NULL DEFAULT 0,
        promo_code_used VARCHAR(50),
        final_total_minor INTEGER NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS blocked_dates (
        id VARCHAR(100) PRIMARY KEY,
        property_id UUID,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT NOT NULL DEFAULT 'Owner Block',
        blocked_by VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(100) PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        actor_email VARCHAR(255),
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(255),
        details JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;

    // Ensure initial Leipzig property exists in Neon
    await sql`
      INSERT INTO properties (
        id, slug, name, headline, description, address, city, postal_code, country,
        max_guests, bedrooms, beds, bathrooms, check_in_time, check_out_time,
        base_price_minor, cleaning_fee_minor, weekend_surcharge_minor, tourist_tax_rate_percent, min_stay_nights
      ) VALUES (
        '00000000-0000-0000-0000-000000000001'::uuid,
        ${LEIPZIG_PROPERTY_SEED.slug},
        ${LEIPZIG_PROPERTY_SEED.name},
        ${LEIPZIG_PROPERTY_SEED.headline},
        ${LEIPZIG_PROPERTY_SEED.description},
        ${LEIPZIG_PROPERTY_SEED.address},
        ${LEIPZIG_PROPERTY_SEED.city},
        ${LEIPZIG_PROPERTY_SEED.postalCode},
        ${LEIPZIG_PROPERTY_SEED.country},
        ${LEIPZIG_PROPERTY_SEED.maxGuests},
        ${LEIPZIG_PROPERTY_SEED.bedrooms},
        ${LEIPZIG_PROPERTY_SEED.beds},
        ${LEIPZIG_PROPERTY_SEED.bathrooms},
        ${LEIPZIG_PROPERTY_SEED.checkInTime},
        ${LEIPZIG_PROPERTY_SEED.checkOutTime},
        ${LEIPZIG_PROPERTY_SEED.basePriceMinor},
        ${LEIPZIG_PROPERTY_SEED.cleaningFeeMinor},
        ${LEIPZIG_PROPERTY_SEED.weekendSurchargeMinor},
        ${LEIPZIG_PROPERTY_SEED.touristTaxRatePercent},
        ${LEIPZIG_PROPERTY_SEED.minStayNights}
      )
      ON CONFLICT (slug) DO NOTHING;
    `;

    isBootstrapped = true;
    console.log("✅ Neon PostgreSQL schema & property bootstrapped successfully.");
    return { success: true };
  } catch (err) {
    console.warn("⚠️ Neon bootstrap notice:", err);
    return { success: false, error: (err as Error).message };
  }
}
