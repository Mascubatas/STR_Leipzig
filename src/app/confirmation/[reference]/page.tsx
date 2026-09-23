"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Printer,
  Mail,
  ShieldCheck,
  Key,
  Phone,
  FileText,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { formatMinorToEuro } from "@/lib/pricing";

interface BookingDetail {
  booking: {
    bookingReference: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    numberOfGuests: number;
    totalAmountMinor: number;
    currency: string;
    bookingStatus: string;
    paymentStatus: string;
    qrCodeDataUrl: string;
    breakdown: {
      baseAccommodationMinor: number;
      cleaningFeeMinor: number;
      touristTaxMinor: number;
      discountMinor: number;
      finalTotalMinor: number;
    };
  };
  property: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    checkInTime: string;
    checkOutTime: string;
  };
  checkInInstructions: {
    doorLockType: string;
    pinCode: string;
    accessInstructions: string;
    emergencyContact: string;
  };
}

export default function BookingConfirmationPage() {
  const params = useParams();
  const reference = params?.reference as string;

  const [data, setData] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showEmailView, setShowEmailView] = useState(false);

  useEffect(() => {
    if (!reference) return;
    fetch(`/api/bookings/${reference}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Reservation not found");
        }
        return res.json();
      })
      .then((resData) => setData(resData))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [reference]);

  const copyReference = () => {
    if (data?.booking.bookingReference) {
      navigator.clipboard.writeText(data.booking.bookingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-stone-500">Retrieving your confirmed reservation...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h1 className="font-serif text-2xl font-bold text-stone-900">Reservation Not Found</h1>
        <p className="text-sm text-stone-600">{error || "Please check your reference number."}</p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-full bg-amber-800 text-white text-sm font-medium"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const { booking, property, checkInInstructions } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 print:hidden">
        <Link
          href="/"
          className="text-xs text-stone-500 hover:text-stone-900 underline"
        >
          ← Return to LeipzigStay Home
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEmailView(!showEmailView)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            <Mail className="w-3.5 h-3.5 text-stone-500" />
            {showEmailView ? "View Normal Page" : "Preview Confirmation Email"}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Voucher / PDF
          </button>
        </div>
      </div>

      {/* Email Preview Modal Mode */}
      {showEmailView ? (
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-md space-y-6 max-w-2xl mx-auto">
          <div className="p-4 bg-stone-100 rounded-xl text-xs text-stone-600 font-mono">
            <strong>To:</strong> {booking.guestEmail} <br />
            <strong>Subject:</strong> Booking Confirmation #{booking.bookingReference} — The Augustus Loft Leipzig
          </div>
          <div className="border-t border-stone-200 pt-4 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Vielen Dank für Ihre Buchung, {booking.guestName}!
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              We are delighted to confirm your reservation at <strong>The Augustus Loft Leipzig</strong>. 
              Below are your reservation summary, keyless check-in instructions, and QR voucher.
            </p>
            <div className="bg-stone-50 p-4 rounded-xl text-xs space-y-2">
              <p><strong>Booking Ref:</strong> {booking.bookingReference}</p>
              <p><strong>Check-in:</strong> {booking.checkInDate} (from 15:00)</p>
              <p><strong>Check-out:</strong> {booking.checkOutDate} (by 11:00)</p>
              <p><strong>Guests:</strong> {booking.numberOfGuests}</p>
              <p><strong>Total Paid:</strong> {formatMinorToEuro(booking.totalAmountMinor)} (PAID)</p>
            </div>
            <div className="text-center py-4">
              <img
                src={booking.qrCodeDataUrl}
                alt="QR Code"
                className="w-40 h-40 mx-auto border border-stone-200 rounded-xl"
              />
              <span className="text-[11px] text-stone-500 mt-2 block">
                Show this QR code or booking reference upon arrival
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Confirmation View */
        <div className="space-y-8">
          {/* Success Banner */}
          <div className="bg-white rounded-3xl p-8 border border-emerald-200/80 shadow-sm text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold tracking-wide uppercase inline-block mb-2">
              Reservation Confirmed & Paid
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              You&apos;re Heading to Leipzig!
            </h1>
            <p className="mt-2 text-stone-600 text-sm max-w-lg mx-auto">
              A confirmation email and tax invoice have been dispatched to{" "}
              <strong className="text-stone-900">{booking.guestEmail}</strong>.
            </p>

            {/* Booking Reference Pill */}
            <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-stone-100 border border-stone-200">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                  Booking Reference
                </span>
                <span className="font-mono text-lg font-bold text-amber-950 tracking-wider">
                  {booking.bookingReference}
                </span>
              </div>
              <button
                onClick={copyReference}
                className="p-2 rounded-lg bg-white hover:bg-stone-50 text-stone-600 transition-colors shadow-xs"
                title="Copy reference"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Grid: Check-in Details & QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left 8 Cols: Access & Stay Information */}
            <div className="md:col-span-8 space-y-6">
              {/* Keyless Check-in Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-900">
                      Keyless 24/7 Check-in Instructions
                    </h2>
                    <span className="text-xs text-stone-500">Contactless & flexible arrival</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/50 space-y-2 text-xs text-amber-950">
                  <div className="flex justify-between font-semibold">
                    <span>Lock System:</span>
                    <span>{checkInInstructions.doorLockType}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Your PIN Code:</span>
                    <span className="font-mono text-amber-900">{checkInInstructions.pinCode}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {checkInInstructions.accessInstructions}
                </p>

                <div className="pt-2 flex items-center gap-2 text-xs text-stone-500">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>On-site host emergency phone: <strong>{checkInInstructions.emergencyContact}</strong></span>
                </div>
              </div>

              {/* Trip Schedule & Location */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  Reservation Details
                </h2>

                <div className="grid grid-cols-2 gap-4 pb-6 border-b border-stone-100 text-sm">
                  <div>
                    <span className="text-xs text-stone-500 uppercase font-semibold tracking-wider block">
                      Check-In
                    </span>
                    <span className="font-semibold text-stone-900 block mt-0.5">
                      {booking.checkInDate}
                    </span>
                    <span className="text-xs text-stone-500">From {property.checkInTime}</span>
                  </div>

                  <div>
                    <span className="text-xs text-stone-500 uppercase font-semibold tracking-wider block">
                      Check-Out
                    </span>
                    <span className="font-semibold text-stone-900 block mt-0.5">
                      {booking.checkOutDate}
                    </span>
                    <span className="text-xs text-stone-500">By {property.checkOutTime}</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span className="font-medium text-stone-800">Property:</span>
                    <span>{property.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-stone-800">Address:</span>
                    <span>{property.address}, {property.postalCode} {property.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-stone-800">Lead Guest:</span>
                    <span>{booking.guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-stone-800">Guests:</span>
                    <span>{booking.numberOfGuests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-stone-800">Nights:</span>
                    <span>{booking.nights} nights</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-stone-800">Payment Status:</span>
                    <span className="font-semibold text-emerald-700 uppercase">{booking.paymentStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Dynamic QR Code & Receipt Card */}
            <div className="md:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm text-center space-y-4">
                <span className="text-xs uppercase font-bold tracking-wider text-stone-500 block">
                  Check-in QR Pass
                </span>

                <div className="p-3 bg-stone-50 rounded-2xl inline-block border border-stone-200">
                  <img
                    src={booking.qrCodeDataUrl}
                    alt={`Reservation QR for ${booking.bookingReference}`}
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Scan at the main foyer entrance or present during property concierge check-in.
                </p>
              </div>

              {/* Price Paid Card */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3 text-xs">
                <h3 className="font-serif text-sm font-bold text-stone-900">
                  Payment Receipt
                </h3>
                <div className="flex justify-between text-stone-600">
                  <span>Accommodation:</span>
                  <span>{formatMinorToEuro(booking.breakdown.baseAccommodationMinor)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Cleaning Fee:</span>
                  <span>{formatMinorToEuro(booking.breakdown.cleaningFeeMinor)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Leipzig Gästetaxe (5%):</span>
                  <span>{formatMinorToEuro(booking.breakdown.touristTaxMinor)}</span>
                </div>
                {booking.breakdown.discountMinor > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount:</span>
                    <span>-{formatMinorToEuro(booking.breakdown.discountMinor)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-sm text-stone-900">
                  <span>Total Paid</span>
                  <span className="text-amber-950 font-serif">
                    {formatMinorToEuro(booking.totalAmountMinor)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
