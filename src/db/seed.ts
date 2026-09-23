import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import * as schema from "./schema";
import {
  LEIPZIG_PROPERTY_SEED,
  SEED_PHOTOS,
  SEED_AMENITIES,
  SEED_HOUSE_RULES,
} from "./seed-data";

dotenv.config();

async function runSeed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("sample")) {
    console.log("⚠️ DATABASE_URL not set or contains placeholder. Skipping live Neon migration.");
    console.log("✅ Seed configuration ready for deployment.");
    return;
  }

  console.log("🌱 Connecting to Neon Database...");
  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });

  console.log("📦 Seeding default cancellation policy...");
  const [policy] = await db
    .insert(schema.cancellationPolicies)
    .values({
      name: "Flexible 14-Day",
      description: "Full refund up to 14 days before check-in. 50% refund between 14 and 7 days. Non-refundable within 7 days.",
      freeCancellationDays: 14,
      partialRefundDays: 7,
      partialRefundPercent: 50,
      isDefault: true,
    })
    .onConflictDoNothing()
    .returning();

  console.log("👤 Seeding admin user...");
  const adminPasswordHash = await bcrypt.hash("LeipzigAdmin2026!", 10);
  await db
    .insert(schema.users)
    .values({
      email: "admin@leipzigstay.de",
      passwordHash: adminPasswordHash,
      fullName: "LeipzigStay Property Management",
      phone: "+49 341 9998877",
      role: "ADMIN",
    })
    .onConflictDoNothing();

  console.log("🏠 Seeding Leipzig property...");
  const [property] = await db
    .insert(schema.properties)
    .values({
      ...LEIPZIG_PROPERTY_SEED,
      cancellationPolicyId: policy?.id,
    })
    .onConflictDoUpdate({
      target: schema.properties.slug,
      set: {
        name: LEIPZIG_PROPERTY_SEED.name,
        basePriceMinor: LEIPZIG_PROPERTY_SEED.basePriceMinor,
        cleaningFeeMinor: LEIPZIG_PROPERTY_SEED.cleaningFeeMinor,
      },
    })
    .returning();

  const propertyId = property ? property.id : LEIPZIG_PROPERTY_SEED.id;

  console.log("📸 Seeding property photos...");
  for (const photo of SEED_PHOTOS) {
    await db.insert(schema.propertyPhotos).values({
      propertyId,
      url: photo.url,
      caption: photo.caption,
      sortOrder: photo.sortOrder,
      isHero: photo.isHero,
    });
  }

  console.log("✨ Seeding amenities...");
  for (const am of SEED_AMENITIES) {
    const [inserted] = await db.insert(schema.amenities).values(am).returning();
    if (inserted) {
      await db.insert(schema.propertyAmenities).values({
        propertyId,
        amenityId: inserted.id,
      });
    }
  }

  console.log("📜 Seeding house rules...");
  for (const rule of SEED_HOUSE_RULES) {
    await db.insert(schema.houseRules).values({
      propertyId,
      title: rule.title,
      description: rule.description,
      ruleType: rule.ruleType,
      sortOrder: rule.sortOrder,
    });
  }

  console.log("🎉 Seeding complete successfully!");
}

runSeed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
