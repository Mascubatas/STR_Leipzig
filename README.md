# LeipzigStay — Direct-Booking Platform for Luxury Serviced Apartments

A production-ready short-term rental booking web application for a legally operating holiday apartment in Leipzig, Germany: **The Augustus Loft Leipzig** (Zentrum & Gewandhaus).

Built by team **LeipzigStay** using Next.js 16 (App Router, TypeScript), Tailwind CSS, Neon serverless PostgreSQL, Drizzle ORM, secure session auth in `httpOnly` cookies, Stripe payments in test mode, dynamic check-in QR codes, and a comprehensive owner/admin management dashboard.

---

## 👥 The LeipzigStay Agent Team

The project architecture and implementation are maintained by three collaborative agents:

```
                      ┌──────────────────────────────────────────────┐
                      │                 LeipzigStay                  │
                      └──────────────────────┬───────────────────────┘
                                             │
         ┌───────────────────────────────────┼───────────────────────────────────┐
         ▼                                   ▼                                   ▼
┌──────────────────┐               ┌──────────────────┐               ┌──────────────────┐
│     Agent 1      │               │     Agent 2      │               │     Agent 3      │
│ Customer Website │               │ Database & Engine│               │ QA, Security &   │
│ & Booking UX     │               │ Architecture     │               │ Deployment       │
└──────────────────┘               └──────────────────┘               └──────────────────┘
```

1. **Agent 1 — Customer Website & Booking Agent**
   - Flagship property presentation (`/`) with high-res photo gallery modal, apartment specs, categorized amenities, Leipzig neighborhood guide, and FAQ.
   - Interactive availability calendar with live dates, price tags, and minimum-stay rules.
   - 10-minute pessimistic booking hold checkout (`/book`) with live countdown timer.
   - Booking confirmation with dynamic SVG QR code pass (`/confirmation/[reference]`) and printable voucher.
   - Guest account portal (`/account/bookings`) with self-service cancellation and refund calculator.
   - German statutory compliance pages: `/impressum`, `/datenschutz`, `/agb`, `/hausordnung`.

2. **Agent 2 — Database & Booking Engine Agent**
   - 20-table Neon PostgreSQL schema in Drizzle ORM (`src/db/schema.ts`) using UUID primary keys, UTC timestamps, and integer minor units (cents).
   - Server-side deterministic pricing engine (`src/lib/pricing.ts`) with weekend surcharges, seasonal overrides, and statutory Leipzig 5% Gästetaxe.
   - Concurrency locking with 10-minute pessimistic holds to prevent double-booking.
   - Auto-releasing cron endpoint (`/api/cron/release-holds`) protected by `CRON_SECRET`.
   - Stripe test payment engine with mock fallback simulator.
   - Rich Leipzig property seed dataset (`src/db/seed-data.ts`).

3. **Agent 3 — QA, Security & Deployment Agent**
   - Concurrency stress tests (`scripts/test-concurrency.ts`) verifying that 5 simultaneous requests for the same dates result in exactly 1 hold and 0 double-bookings.
   - Pricing & cancellation policy test suite (`scripts/test-pricing-and-cancellation.ts`).
   - Zero browser secret exposure: all private keys, database credentials, and payment secrets remain strictly server-side.
   - Vercel production build validation.

---

## 🏛️ Property Details (Seed Data)

- **Name:** The Augustus Loft Leipzig — Zentrum & Gewandhaus
- **Address:** Grimmaische Str. 18, 04109 Leipzig, Germany
- **Coordinates:** 51.3396° N, 12.3785° E (directly at Augustusplatz, Gewandhaus & Leipzig Opera)
- **Size & Capacity:** 88 m², up to 4 Guests, 2 King Bedrooms, 1 Spa Bathroom with walk-in rainfall shower
- **Rates:** Base €165.00/night, Friday/Saturday weekend surcharge +€25.00/night, Cleaning fee €65.00
- **Taxes:** Statutory 5% Leipzig Guest Tax (Beherbergungssteuer / Gästetaxe)
- **Check-in / Out:** 15:00 CET (24/7 digital smart lock PIN) / 11:00 CET
- **Minimum Stay:** 2 nights

---

## 🚀 Quick Start (Local Development)

### 1. Requirements
- Node.js >= 18 (Tested on Node.js v24)
- npm >= 9

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon serverless PostgreSQL connection string (pooled) |
| `DATABASE_MIGRATION_URL` | Direct unpooled Neon connection string for Drizzle migrations |
| `AUTH_SECRET` | 32+ character secret for JWT sessions in secure httpOnly cookies |
| `STRIPE_SECRET_KEY` | Stripe secret key in test mode (`sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `CRON_SECRET` | Bearer token protecting `/api/cron/release-holds` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for file and image uploads |

### 4. Database Setup & Seeding
To push the Drizzle schema to your live Neon database:
```bash
npm run db:push
npm run db:seed
```
*(Note: If you run locally without a database URL, LeipzigStay seamlessly operates in its robust in-memory store mode for instant prototyping and test runs).*

### 5. Running the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Automated Testing

### 1. Concurrency & Race-Condition Test
Simulates 5 guests attempting to reserve the exact same dates simultaneously:
```bash
npm run test:concurrency
```
**Expected Result:** Exactly 1 hold succeeds, the remaining 4 are rejected safely with clear conflict messages, and no double booking occurs.

### 2. Pricing & Cancellation Policy Test
Validates integer minor units, weekend surcharges, Leipzig guest tax, promo code deductions, and multi-tiered cancellation refunds:
```bash
npx tsx scripts/test-pricing-and-cancellation.ts
```

### 3. Production Build Validation
```bash
npm run build
```

---

## 🔑 Demo & Test Credentials

- **Guest Portal:**
  - URL: `/account/login`
  - Email: `guest@example.com`
  - Password: `GuestPassword2026!`
- **Admin / Owner Dashboard:**
  - URL: `/admin`
  - Email: `admin@leipzigstay.de`
  - Password: `LeipzigAdmin2026!`
- **Promotional Discount Codes:**
  - `WELCOME10` — 10% off accommodation
  - `BACH2026` — 15% off accommodation
- **Stripe Test Card:**
  - Number: `4242 4242 4242 4242`
  - Expiry: `12/28`
  - CVC: `888`

---

## ☁️ Vercel & Neon Deployment Guide

1. **Deploy to Vercel**:
   - Push repository to GitHub or run `vercel`.
   - In Vercel Marketplace, attach **Neon Serverless PostgreSQL**.
   - Attach **Vercel Blob** for property media.
2. **Configure Environment Variables**:
   - Add `AUTH_SECRET`, `CRON_SECRET`, and `STRIPE_SECRET_KEY` in Vercel project settings.
3. **Database Migration on Deployment**:
   - Add `npm run db:push && npm run db:seed` to your build command or run via GitHub Actions.
4. **Vercel Cron Job**:
   - Create a cron task in `vercel.json` to trigger `/api/cron/release-holds` every 5 or 10 minutes with the `Authorization: Bearer ${CRON_SECRET}` header.

---

## ⚖️ Legal & German Regulations

- **Impressum:** Available at `/impressum` (statutory disclosures according to § 5 TMG).
- **Datenschutz:** Available at `/datenschutz` (GDPR / DSGVO disclosures).
- **AGB:** Available at `/agb` (transparent booking and cancellation terms).
- **Hausordnung:** Available at `/hausordnung` (Saxon quiet hours 22:00–07:00, non-smoking policy).
