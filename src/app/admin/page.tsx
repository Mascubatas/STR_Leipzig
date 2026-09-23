"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Search,
  Filter,
  Calendar,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle,
  Clock,
  FileText,
  Activity,
} from "lucide-react";
import { formatMinorToEuro } from "@/lib/pricing";

interface BookingRecord {
  id: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  numberOfGuests: number;
  totalAmountMinor: number;
  bookingStatus: string;
  paymentStatus: string;
  qrCodeDataUrl: string;
  createdAt: string;
}

interface BlockedDate {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  blockedBy: string;
}

interface AuditLog {
  id: string;
  action: string;
  actorEmail: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [session, setSession] = useState<{ email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Data
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [metrics, setMetrics] = useState({
    totalRevenueMinor: 0,
    confirmedBookingsCount: 0,
    totalNightsBooked: 0,
    totalBookingsRecorded: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Block Dates Form
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockSubmitting, setBlockSubmitting] = useState(false);

  const loadAdminData = () => {
    fetch("/api/admin/bookings")
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setBookings(data.bookings || []);
        setBlockedDates(data.blockedDates || []);
        if (data.metrics) setMetrics(data.metrics);
      })
      .catch(() => setAuthError(true));

    fetch("/api/admin/audit-logs")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.logs) setAuditLogs(data.logs);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user && data.user.role === "ADMIN") {
          setSession(data.user);
          loadAdminData();
        } else {
          setAuthError(true);
        }
      })
      .catch(() => setAuthError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleBlockDates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockStart || !blockEnd) return;
    setBlockSubmitting(true);

    try {
      const res = await fetch("/api/admin/block-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: blockStart,
          endDate: blockEnd,
          reason: blockReason || "Owner Maintenance",
        }),
      });
      if (res.ok) {
        setBlockStart("");
        setBlockEnd("");
        setBlockReason("");
        loadAdminData();
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setBlockSubmitting(false);
    }
  };

  const handleUnblockDates = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/block-dates?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) loadAdminData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleUpdateStatus = async (reference: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, status: newStatus }),
      });
      if (res.ok) loadAdminData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-stone-500">Checking administrator privileges...</p>
      </div>
    );
  }

  if (authError || !session || session.role !== "ADMIN") {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Shield className="w-12 h-12 text-amber-800 mx-auto" />
        <h1 className="font-serif text-2xl font-bold text-stone-900">Administrator Access Only</h1>
        <p className="text-sm text-stone-600">
          This portal is reserved for the owner and property management of LeipzigStay.
        </p>
        <Link
          href="/account/login"
          className="inline-block px-6 py-2.5 rounded-full bg-stone-900 text-white text-sm font-medium"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesQuery =
      b.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guestEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || b.bookingStatus === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-800 text-white">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-900">
              Admin & Owner Dashboard
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
            The Augustus Loft Leipzig
          </h1>
          <p className="text-xs text-stone-500">
            Manager: {session.email} • Real-time occupancy & reservations
          </p>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 transition-colors self-start sm:self-auto"
        >
          ← View Public Customer Website
        </Link>
      </div>

      {/* 1. Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs text-stone-500 font-medium">Total Gross Revenue</span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-stone-900">
              {formatMinorToEuro(metrics.totalRevenueMinor)}
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs text-stone-500 font-medium">Confirmed Reservations</span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-stone-900">
              {metrics.confirmedBookingsCount}
            </span>
            <CheckCircle className="w-5 h-5 text-amber-800" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs text-stone-500 font-medium">Nights Booked</span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-stone-900">
              {metrics.totalNightsBooked}
            </span>
            <Calendar className="w-5 h-5 text-stone-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs text-stone-500 font-medium">Manual Blocked Ranges</span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-2xl font-bold text-stone-900">
              {blockedDates.length}
            </span>
            <Lock className="w-5 h-5 text-amber-700" />
          </div>
        </div>
      </div>

      {/* 2. Main Workspace: Bookings Table & Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Reservations & Guests
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Showing {filteredBookings.length} bookings
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference or guest..."
                className="pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 w-48 sm:w-64"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CHECKED_IN">CHECKED_IN</option>
              <option value="CHECKED_OUT">CHECKED_OUT</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-y border-stone-200">
              <tr>
                <th className="py-3 px-4">Ref</th>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Guests</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBookings.map((b) => (
                <tr key={b.bookingReference} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-950">
                    <Link
                      href={`/confirmation/${b.bookingReference}`}
                      className="hover:underline flex items-center gap-1"
                    >
                      {b.bookingReference}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-stone-900 block">{b.guestName}</span>
                    <span className="text-[11px] text-stone-500">{b.guestEmail}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-stone-800 font-medium block">
                      {b.checkInDate} → {b.checkOutDate}
                    </span>
                    <span className="text-[11px] text-stone-500">{b.nights} nights</span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-700">{b.numberOfGuests}</td>
                  <td className="py-3.5 px-4 font-semibold text-stone-900">
                    {formatMinorToEuro(b.totalAmountMinor)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.bookingStatus === "CONFIRMED"
                          ? "bg-emerald-100 text-emerald-800"
                          : b.bookingStatus === "CHECKED_IN"
                          ? "bg-blue-100 text-blue-800"
                          : b.bookingStatus === "CHECKED_OUT"
                          ? "bg-stone-100 text-stone-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {b.bookingStatus === "CONFIRMED" && (
                      <button
                        onClick={() => handleUpdateStatus(b.bookingReference, "CHECKED_IN")}
                        className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
                      >
                        Check In
                      </button>
                    )}
                    {b.bookingStatus === "CHECKED_IN" && (
                      <button
                        onClick={() => handleUpdateStatus(b.bookingReference, "CHECKED_OUT")}
                        className="px-2.5 py-1 rounded bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium"
                      >
                        Check Out
                      </button>
                    )}
                    {b.bookingStatus !== "CANCELLED" && (
                      <button
                        onClick={() => handleUpdateStatus(b.bookingReference, "CANCELLED")}
                        className="px-2.5 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Date Blocking & Calendar Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 cols: Block Dates Tool */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Manual Date Blocker
              </h2>
              <p className="text-xs text-stone-500">
                Block specific dates for maintenance, personal use, or repairs
              </p>
            </div>
          </div>

          <form onSubmit={handleBlockDates} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 uppercase mb-1">
                Reason / Note
              </label>
              <input
                type="text"
                placeholder="e.g. Annual Stucco Inspection or Owner Stay"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
              />
            </div>

            <button
              type="submit"
              disabled={blockSubmitting}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
            >
              {blockSubmitting ? "Blocking..." : "Block Selected Range"}
            </button>
          </form>

          {/* Existing Blocked Dates list */}
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <span className="text-xs font-semibold text-stone-700 block">
              Currently Blocked Ranges ({blockedDates.length})
            </span>
            {blockedDates.map((block) => (
              <div
                key={block.id}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs"
              >
                <div>
                  <span className="font-semibold text-stone-900 block">
                    {block.startDate} → {block.endDate}
                  </span>
                  <span className="text-[11px] text-stone-500">{block.reason}</span>
                </div>
                <button
                  onClick={() => handleUnblockDates(block.id)}
                  className="p-1.5 text-stone-400 hover:text-red-700"
                  title="Unblock dates"
                >
                  <Unlock className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right 6 cols: Audit Trail */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-stone-100 text-stone-800">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Administrative Audit Trail
              </h2>
              <p className="text-xs text-stone-500">
                Immutable record of actions and modifications
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-stone-100 bg-stone-50/50 text-xs space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-950 font-mono text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-stone-600 text-[11px]">
                  Actor: <span className="font-medium text-stone-800">{log.actorEmail}</span> • Entity: {log.entityType} ({log.entityId})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
