"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Calendar as CalendarIcon, Users, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { formatMinorToEuro, PricingBreakdown } from "@/lib/pricing";

interface BookingPriceCardProps {
  checkIn: string | null;
  checkOut: string | null;
  basePriceMinor: number;
  minStayNights: number;
  onDatesChange?: (checkIn: string | null, checkOut: string | null) => void;
}

export function BookingPriceCard({
  checkIn: externalCheckIn,
  checkOut: externalCheckOut,
  basePriceMinor,
  minStayNights,
  onDatesChange,
}: BookingPriceCardProps) {
  const router = useRouter();

  // Internal state kept in sync with external props
  const [internalCheckIn, setInternalCheckIn] = useState(externalCheckIn || "");
  const [internalCheckOut, setInternalCheckOut] = useState(externalCheckOut || "");
  const [guests, setGuests] = useState(2);
  const [promoCode, setPromoCode] = useState("");
  const [breakdown, setBreakdown] = useState<PricingBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Today in YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (externalCheckIn) setInternalCheckIn(externalCheckIn);
  }, [externalCheckIn]);

  useEffect(() => {
    if (externalCheckOut) setInternalCheckOut(externalCheckOut);
  }, [externalCheckOut]);

  const activeCheckIn = externalCheckIn || internalCheckIn;
  const activeCheckOut = externalCheckOut || internalCheckOut;

  useEffect(() => {
    if (activeCheckIn && activeCheckOut) {
      setLoading(true);
      setError(null);

      fetch("/api/pricing/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkInDate: activeCheckIn,
          checkOutDate: activeCheckOut,
          numberOfGuests: guests,
          promoCode: promoCode.trim() || undefined,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Failed to calculate quote");
          }
          setBreakdown(data.breakdown);
        })
        .catch((err) => {
          setError(err.message);
          setBreakdown(null);
        })
        .finally(() => setLoading(false));
    } else {
      setBreakdown(null);
      setError(null);
    }
  }, [activeCheckIn, activeCheckOut, guests, promoCode]);

  const handleCheckInChange = (newIn: string) => {
    setInternalCheckIn(newIn);
    let newOut = activeCheckOut;
    // If checkOut is before or equal to checkIn, advance it by minStayNights
    if (newOut && newOut <= newIn) {
      const inDate = new Date(newIn);
      inDate.setDate(inDate.getDate() + minStayNights);
      newOut = inDate.toISOString().split("T")[0];
      setInternalCheckOut(newOut);
    }
    if (onDatesChange) {
      onDatesChange(newIn, newOut || null);
    }
  };

  const handleCheckOutChange = (newOut: string) => {
    setInternalCheckOut(newOut);
    if (onDatesChange) {
      onDatesChange(activeCheckIn || null, newOut);
    }
  };

  const handleProceedToCheckout = () => {
    if (!activeCheckIn || !activeCheckOut) {
      alert("Please select both check-in and check-out dates first.");
      return;
    }
    const params = new URLSearchParams({
      checkIn: activeCheckIn,
      checkOut: activeCheckOut,
      guests: guests.toString(),
      ...(promoCode ? { promo: promoCode } : {}),
    });
    router.push(`/book?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xl sticky top-28">
      {/* Price header */}
      <div className="flex items-baseline justify-between pb-6 border-b border-stone-100">
        <div>
          <span className="text-3xl font-serif font-bold text-stone-900">
            {formatMinorToEuro(basePriceMinor)}
          </span>
          <span className="text-sm text-stone-500 font-normal"> / night</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Direct Booking Perk</span>
        </div>
      </div>

      {/* Date & Guest Inputs */}
      <div className="mt-6 space-y-3">
        <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-200 shadow-xs">
          <div className="grid grid-cols-2 divide-x divide-stone-200">
            {/* Interactive Check-in date input */}
            <div className="p-3 bg-stone-50/70 hover:bg-stone-50 transition-colors">
              <label htmlFor="card-checkin" className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block mb-1">
                Check-in
              </label>
              <input
                id="card-checkin"
                type="date"
                min={todayStr}
                value={activeCheckIn}
                onChange={(e) => handleCheckInChange(e.target.value)}
                className="w-full text-xs font-semibold text-stone-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>

            {/* Interactive Check-out date input */}
            <div className="p-3 bg-stone-50/70 hover:bg-stone-50 transition-colors">
              <label htmlFor="card-checkout" className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block mb-1">
                Check-out
              </label>
              <input
                id="card-checkout"
                type="date"
                min={activeCheckIn || todayStr}
                value={activeCheckOut}
                onChange={(e) => handleCheckOutChange(e.target.value)}
                className="w-full text-xs font-semibold text-stone-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3 bg-white">
            <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
              Guests
            </label>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-medium text-stone-800">
                {guests} {guests === 1 ? "Guest" : "Guests"} (Max 4)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  disabled={guests <= 1}
                  className="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center text-xs font-bold text-stone-600 disabled:opacity-30 cursor-pointer"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setGuests(Math.min(4, guests + 1))}
                  disabled={guests >= 4}
                  className="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center text-xs font-bold text-stone-600 disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar quick jump helper */}
        <div className="flex items-center justify-between pt-1 px-1">
          <a
            href="#calendar"
            className="text-[11px] text-amber-800 hover:text-amber-900 font-medium flex items-center gap-1 underline"
          >
            <CalendarIcon className="w-3 h-3" />
            Pick from visual calendar below
          </a>
          <span className="text-[11px] text-stone-400">Min. {minStayNights} nights</span>
        </div>

        {/* Promo code field */}
        <div className="pt-2">
          <input
            type="text"
            placeholder="Promo code (e.g. WELCOME10)"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Calculated Breakdown */}
      {breakdown && !loading && (
        <div className="mt-6 pt-6 border-t border-stone-100 space-y-2.5 text-xs text-stone-600">
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
            <span className="flex items-center gap-1">
              Leipzig Guest Tax (5% Gästetaxe)
            </span>
            <span className="font-medium text-stone-900">
              {formatMinorToEuro(breakdown.touristTaxMinor)}
            </span>
          </div>

          {breakdown.discountMinor > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Discount ({breakdown.promoCodeApplied})</span>
              <span>-{formatMinorToEuro(breakdown.discountMinor)}</span>
            </div>
          )}

          <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-sm font-semibold text-stone-900">
            <span>Total Amount</span>
            <span className="text-xl font-bold text-amber-950 font-serif">
              {formatMinorToEuro(breakdown.finalTotalMinor)}
            </span>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleProceedToCheckout}
          disabled={!activeCheckIn || !activeCheckOut || Boolean(error)}
          className="w-full py-4 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Reserve Dates & Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-4 text-center text-[11px] text-stone-500">
        You won&apos;t be charged yet. Dates will be held for 10 minutes during checkout.
      </p>

      {/* Trust badges */}
      <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-center gap-4 text-[11px] text-stone-700 font-medium">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          Free 14-Day Cancellation
        </span>
        <span>•</span>
        <span>Best Direct Rate</span>
      </div>
    </div>
  );
}
