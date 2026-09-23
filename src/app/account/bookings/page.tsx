"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  Key,
  FileText,
  AlertCircle,
  XCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { formatMinorToEuro } from "@/lib/pricing";

interface BookingItem {
  id: string;
  bookingReference: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  numberOfGuests: number;
  totalAmountMinor: number;
  bookingStatus: string;
  paymentStatus: string;
  cancellationReason?: string;
  refundAmountMinor?: number;
  createdAt: string;
}

export function GuestBookingsPage() {
  const [user, setUser] = useState<{ email: string; fullName: string } | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingRef, setCancellingRef] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchBookings = (email: string) => {
    fetch("/api/availability") // or fetch user bookings
      .then(() => {
        // Fetch specific bookings from store
        return fetch("/api/admin/bookings"); // If admin or fetch by email
      })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          // Filter to user's bookings
          const userBookings = (data.bookings || []).filter(
            (b: { guestEmail: string }) => b.guestEmail.toLowerCase() === email.toLowerCase()
          );
          setBookings(userBookings);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          fetchBookings(data.user.email);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const openCancelModal = (reference: string) => {
    setCancellingRef(reference);
    setCancelReason("Change of travel plans");
    setCancelModalOpen(true);
    setFeedbackMessage(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingRef) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: cancellingRef,
          reason: cancelReason,
          guestEmail: user?.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Cancellation failed");
      }
      setFeedbackMessage(
        `Booking ${cancellingRef} cancelled successfully. Refund: ${formatMinorToEuro(
          data.refundAmountMinor
        )}. ${data.policyMessage}`
      );
      setCancelModalOpen(false);
      if (user) fetchBookings(user.email);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-stone-500">Loading your reservations...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-800 mx-auto" />
        <h1 className="font-serif text-2xl font-bold text-stone-900">Sign In Required</h1>
        <p className="text-sm text-stone-600">
          Please sign in to view your bookings and access your contactless check-in PIN.
        </p>
        <Link
          href="/account/login"
          className="inline-block px-6 py-2.5 rounded-full bg-amber-800 text-white text-sm font-medium"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
          Welcome back, {user.fullName}
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Account: {user.email} • Your Leipzig reservations & access passes
        </p>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <p>{feedbackMessage}</p>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto" />
          <h2 className="font-serif text-xl font-semibold text-stone-800">No Reservations Yet</h2>
          <p className="text-sm text-stone-500 max-w-sm mx-auto">
            You don&apos;t have any active bookings at The Augustus Loft Leipzig.
          </p>
          <Link
            href="/#calendar"
            className="inline-block px-6 py-2.5 rounded-full bg-amber-800 hover:bg-amber-900 text-white text-sm font-medium shadow-sm transition-all"
          >
            Explore Available Dates
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const isCancelled = booking.bookingStatus === "CANCELLED";
            return (
              <div
                key={booking.bookingReference}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-amber-950 px-3 py-1 rounded-lg bg-stone-100">
                      {booking.bookingReference}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        isCancelled
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {booking.bookingStatus}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      Paid: {formatMinorToEuro(booking.totalAmountMinor)}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    The Augustus Loft Leipzig — Zentrum
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {booking.checkInDate} → {booking.checkOutDate} ({booking.nights} nights)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      Grimmaische Str. 18, Leipzig
                    </span>
                  </div>

                  {isCancelled && (
                    <div className="text-xs text-red-600 mt-2">
                      Reason: {booking.cancellationReason || "Cancelled"} • Refunded:{" "}
                      {formatMinorToEuro(booking.refundAmountMinor || 0)}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap md:flex-col items-end gap-3 shrink-0">
                  <Link
                    href={`/confirmation/${booking.bookingReference}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Voucher & Pass
                  </Link>

                  {!isCancelled && (
                    <button
                      onClick={() => openCancelModal(booking.bookingReference)}
                      className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-red-700 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fadeIn">
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Cancel Reservation {cancellingRef}?
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your refund will be calculated automatically based on LeipzigStay&apos;s cancellation policy:
            </p>

            <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1 text-stone-600 border border-stone-200">
              <p>• <strong>14+ days before arrival:</strong> 100% full refund</p>
              <p>• <strong>7 to 14 days before arrival:</strong> 50% accommodation + 100% cleaning fee</p>
              <p>• <strong>Within 7 days:</strong> Cleaning fee refunded</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Reason for Cancellation
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
              >
                Keep Reservation
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuestBookingsPageWrapper() {
  return <GuestBookingsPage />;
}
