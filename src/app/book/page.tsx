"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  Lock,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { formatMinorToEuro, PricingBreakdown } from "@/lib/pricing";

function BookingCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [checkInDate, setCheckInDate] = useState(searchParams.get("checkIn") || "");
  const [checkOutDate, setCheckOutDate] = useState(searchParams.get("checkOut") || "");
  const [numberOfGuests, setNumberOfGuests] = useState(
    Number(searchParams.get("guests")) || 2
  );
  const [promoCode, setPromoCode] = useState(searchParams.get("promo") || "");

  // Hold State
  const [holdToken, setHoldToken] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(600); // 10 minutes
  const [breakdown, setBreakdown] = useState<PricingBreakdown | null>(null);
  const [holdingLoading, setHoldingLoading] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);

  // Guest Details
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Payment Form (Test Mode)
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [cardName, setCardName] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Pre-fill user if logged in
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setGuestName(data.user.fullName || "");
          setGuestEmail(data.user.email || "");
          setCardName(data.user.fullName || "");
        }
      })
      .catch(() => {});
  }, []);

  // Request 10-minute hold whenever dates are selected
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      setHoldingLoading(true);
      setHoldError(null);

      fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkInDate,
          checkOutDate,
          numberOfGuests,
          promoCode: promoCode.trim() || undefined,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Could not reserve dates");
          }
          setHoldToken(data.holdToken);
          const expires = new Date(data.expiresAt);
          setHoldExpiresAt(expires);
          setBreakdown(data.priceBreakdown);
          const diff = Math.max(0, Math.floor((expires.getTime() - Date.now()) / 1000));
          setTimeLeftSeconds(diff);
        })
        .catch((err) => {
          setHoldError(err.message);
          setHoldToken(null);
          setBreakdown(null);
        })
        .finally(() => setHoldingLoading(false));
    }
  }, [checkInDate, checkOutDate, numberOfGuests, promoCode]);

  // Live Hold Countdown Timer
  useEffect(() => {
    if (!holdExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((holdExpiresAt.getTime() - Date.now()) / 1000));
      setTimeLeftSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setHoldError("Your 10-minute hold has expired. Please refresh to re-reserve dates.");
        setHoldToken(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCompleteBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holdToken) {
      setPaymentError("Active booking hold required. Please re-select dates.");
      return;
    }
    if (!guestName || !guestEmail || !guestPhone) {
      setPaymentError("Please provide all required guest contact fields.");
      return;
    }

    setProcessingPayment(true);
    setPaymentError(null);

    try {
      const res = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holdToken,
          guestName,
          guestEmail,
          guestPhone,
          numberOfGuests,
          promoCode: promoCode.trim() || undefined,
          specialRequests,
          paymentId: `sim_stripe_${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment and booking verification failed");
      }

      router.push(`/confirmation/${data.bookingReference}`);
    } catch (err) {
      setPaymentError((err as Error).message);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Property Overview
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column (7 cols): Checkout Form & Live Hold Banner */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
              Confirm & Pay Securely
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              The Augustus Loft Leipzig • Direct reservation with best rate guarantee
            </p>
          </div>

          {/* 10-Minute Hold Banner */}
          {holdToken && !holdError && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-800 text-white shrink-0">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-900 block">
                    Dates Held Exclusively For You
                  </span>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Other guests cannot book these dates while your hold is active.
                  </p>
                </div>
              </div>
              <div className="text-right pl-4">
                <span className="font-mono text-xl font-bold text-amber-950">
                  {formatCountdown(timeLeftSeconds)}
                </span>
                <span className="text-[10px] text-amber-800 block">minutes left</span>
              </div>
            </div>
          )}

          {/* Hold Error Banner */}
          {holdError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{holdError}</p>
                <Link href="/#calendar" className="text-xs underline font-medium mt-1 inline-block">
                  Click here to return to the calendar and pick new dates
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleCompleteBooking} className="space-y-8">
            {/* Step 1: Guest Information */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
              <h2 className="font-serif text-lg font-semibold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-sans font-bold">
                  1
                </span>
                Guest Contact Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => {
                      setGuestName(e.target.value);
                      if (!cardName) setCardName(e.target.value);
                    }}
                    placeholder="e.g. Dr. Clara Schumann"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="clara@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Your keycode & confirmation voucher will be sent here
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+49 170 1234567"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Number of Guests
                  </label>
                  <select
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 bg-white"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests (Max)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Special Requests / Arrival Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Estimated arrival time from Leipzig Hbf, bedding requests, etc."
                  className="w-full px-4 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                />
              </div>
            </div>

            {/* Step 2: Payment Details (Test Mode) */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-sans font-bold">
                    2
                  </span>
                  Payment Method (Stripe Test Mode)
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Test Sandbox
                </span>
              </div>

              {/* Test mode notice */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                  Stripe Test Mode Activated
                </p>
                <p className="text-amber-800/90 leading-relaxed">
                  Use any valid test card (e.g. 4242 4242 4242 4242). No real charges will be made.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Name as it appears on card"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 •••• •••• 4242"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 pr-10 font-mono"
                    />
                    <CreditCard className="w-5 h-5 text-stone-400 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 font-mono"
                    />
                  </div>
                </div>
              </div>

              {paymentError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={processingPayment || !holdToken || Boolean(holdError)}
                className="w-full py-4 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {processingPayment ? (
                  <span>Authorizing Test Payment...</span>
                ) : (
                  <span>
                    Pay & Confirm Reservation {breakdown && `(${formatMinorToEuro(breakdown.finalTotalMinor)})`}
                  </span>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  256-bit TLS Encrypted
                </span>
                <span>•</span>
                <span>Instant Confirmation & PIN</span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column (5 cols): Reservation Summary & Itemized Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm sticky top-28 space-y-6">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Booking Summary
            </h2>

            {/* Property mini card */}
            <div className="flex gap-4 items-center pb-6 border-b border-stone-100">
              <img
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80"
                alt="Augustus Loft"
                className="w-20 h-20 rounded-2xl object-cover shrink-0"
              />
              <div>
                <h3 className="font-serif text-base font-semibold text-stone-900 leading-tight">
                  The Augustus Loft Leipzig
                </h3>
                <p className="text-xs text-stone-500 mt-1">Zentrum • Grimmaische Str. 18</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-amber-800 font-semibold">
                  <span>★ 4.98</span>
                  <span className="text-stone-400 font-normal">• 2 Bed • 88 m²</span>
                </div>
              </div>
            </div>

            {/* Selected Trip Details */}
            <div className="space-y-3 text-xs text-stone-600">
              <div className="flex justify-between py-1">
                <span className="font-medium text-stone-800">Check-in:</span>
                <span>{checkInDate || "Not chosen"} (from 15:00)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-stone-800">Check-out:</span>
                <span>{checkOutDate || "Not chosen"} (by 11:00)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-stone-800">Guests:</span>
                <span>{numberOfGuests} {numberOfGuests === 1 ? "Guest" : "Guests"}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="pt-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1">
                Promotional Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
                />
              </div>
            </div>

            {/* Itemized Transparent Breakdown */}
            {breakdown && (
              <div className="pt-6 border-t border-stone-100 space-y-2.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>
                    Accommodation ({breakdown.nightsCount} nights)
                  </span>
                  <span className="font-medium text-stone-900">
                    {formatMinorToEuro(breakdown.baseAccommodationMinor + breakdown.weekendSurchargeMinor)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Professional Cleaning Fee</span>
                  <span className="font-medium text-stone-900">
                    {formatMinorToEuro(breakdown.cleaningFeeMinor)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Leipzig Gästetaxe (5% Guest Tax)</span>
                  <span className="font-medium text-stone-900">
                    {formatMinorToEuro(breakdown.touristTaxMinor)}
                  </span>
                </div>

                {breakdown.discountMinor > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount Applied ({breakdown.promoCodeApplied})</span>
                    <span>-{formatMinorToEuro(breakdown.discountMinor)}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline text-sm font-semibold text-stone-900">
                  <span>Total Due Today</span>
                  <span className="text-2xl font-bold text-amber-950 font-serif">
                    {formatMinorToEuro(breakdown.finalTotalMinor)}
                  </span>
                </div>
              </div>
            )}

            {/* Cancellation Policy summary */}
            <div className="pt-4 border-t border-stone-100 space-y-1.5 text-[11px] text-stone-500">
              <span className="font-semibold text-stone-700 block">Cancellation Policy</span>
              <p>
                • 100% refund for cancellations up to 14 days before check-in.
              </p>
              <p>
                • 50% accommodation refund between 14 and 7 days.
              </p>
              <p>
                • Non-refundable within 7 days of arrival.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-500">Loading booking checkout...</div>}>
      <BookingCheckoutContent />
    </Suspense>
  );
}
