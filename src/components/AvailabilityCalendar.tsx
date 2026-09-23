"use client";

import React, { useState, useEffect } from "react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isBefore,
  isSameDay,
  isAfter,
  parseISO,
  startOfDay,
  differenceInCalendarDays,
  isFriday,
  isSaturday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from "lucide-react";
import { formatMinorToEuro } from "@/lib/pricing";

interface AvailabilityCalendarProps {
  onSelectDates?: (checkIn: string | null, checkOut: string | null) => void;
  selectedCheckIn?: string | null;
  selectedCheckOut?: string | null;
}

export function AvailabilityCalendar({
  onSelectDates,
  selectedCheckIn: initialCheckIn,
  selectedCheckOut: initialCheckOut,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [checkIn, setCheckIn] = useState<string | null>(initialCheckIn || null);
  const [checkOut, setCheckOut] = useState<string | null>(initialCheckOut || null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const [confirmedRanges, setConfirmedRanges] = useState<Array<{ checkIn: string; checkOut: string }>>([]);
  const [blockedRanges, setBlockedRanges] = useState<Array<{ startDate: string; endDate: string; reason: string }>>([]);
  const [propertyData, setPropertyData] = useState<{
    basePriceMinor: number;
    weekendSurchargeMinor: number;
    minStayNights: number;
  }>({
    basePriceMinor: 16500,
    weekendSurchargeMinor: 2500,
    minStayNights: 2,
  });

  useEffect(() => {
    fetch("/api/availability")
      .then((res) => res.json())
      .then((data) => {
        if (data.confirmedRanges) setConfirmedRanges(data.confirmedRanges);
        if (data.blockedRanges) setBlockedRanges(data.blockedRanges);
        if (data.property) {
          setPropertyData({
            basePriceMinor: data.property.basePriceMinor,
            weekendSurchargeMinor: data.property.weekendSurchargeMinor,
            minStayNights: data.property.minStayNights,
          });
        }
      })
      .catch((err) => console.error("Error loading availability:", err));
  }, []);

  const today = startOfDay(new Date());

  // Check if a specific date is unavailable (past, booked, or blocked)
  const isDateDisabled = (date: Date): boolean => {
    if (isBefore(date, today)) return true;
    const dateStr = format(date, "yyyy-MM-dd");

    // Check confirmed reservations
    for (const r of confirmedRanges) {
      if (dateStr >= r.checkIn && dateStr < r.checkOut) {
        return true;
      }
    }

    // Check admin blocked ranges
    for (const b of blockedRanges) {
      if (dateStr >= b.startDate && dateStr < b.endDate) {
        return true;
      }
    }

    return false;
  };

  const getDayPrice = (date: Date): number => {
    const isWknd = isFriday(date) || isSaturday(date);
    return propertyData.basePriceMinor + (isWknd ? propertyData.weekendSurchargeMinor : 0);
  };

  const handleDayClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    const dateStr = format(date, "yyyy-MM-dd");

    if (!checkIn || (checkIn && checkOut)) {
      // Start fresh selection
      setCheckIn(dateStr);
      setCheckOut(null);
      if (onSelectDates) onSelectDates(dateStr, null);
    } else if (checkIn && !checkOut) {
      const startDate = parseISO(checkIn);

      if (isSameDay(date, startDate) || isBefore(date, startDate)) {
        // Reset check-in to this clicked date
        setCheckIn(dateStr);
        setCheckOut(null);
        if (onSelectDates) onSelectDates(dateStr, null);
      } else {
        // Verify no disabled dates inside interval
        const interval = eachDayOfInterval({ start: startDate, end: date });
        const hasConflict = interval.slice(0, -1).some((d) => isDateDisabled(d));

        if (hasConflict) {
          alert("The selected range includes unavailable dates. Please choose a continuous open interval.");
          setCheckIn(dateStr);
          setCheckOut(null);
          if (onSelectDates) onSelectDates(dateStr, null);
          return;
        }

        const nights = differenceInCalendarDays(date, startDate);
        if (nights < propertyData.minStayNights) {
          alert(`Minimum stay is ${propertyData.minStayNights} nights. Please select at least ${propertyData.minStayNights} nights.`);
          return;
        }

        setCheckOut(dateStr);
        if (onSelectDates) onSelectDates(checkIn, dateStr);
      }
    }
  };

  // Month rendering helper
  const renderMonth = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Day of week offset (Monday = 0)
    let startDayOfWeek = monthStart.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const blanks = Array.from({ length: startDayOfWeek });

    return (
      <div className="flex-1 min-w-[280px]">
        <div className="text-center font-serif font-semibold text-stone-900 pb-4 text-base tracking-wide">
          {format(monthDate, "MMMM yyyy")}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-600 mb-2">
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
          <span>Su</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="h-14" />
          ))}
          {daysInMonth.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const disabled = isDateDisabled(day);
            const isCheckInDay = checkIn === dateStr;
            const isCheckOutDay = checkOut === dateStr;

            const isInSelectedRange =
              checkIn &&
              checkOut &&
              isAfter(day, parseISO(checkIn)) &&
              isBefore(day, parseISO(checkOut));

            const isInHoverRange =
              checkIn &&
              !checkOut &&
              hoverDate &&
              isAfter(day, parseISO(checkIn)) &&
              isBefore(day, parseISO(hoverDate));

            let bgClass = "bg-white hover:bg-stone-100 text-stone-800";
            if (disabled) {
              bgClass = "bg-stone-100 text-stone-300 cursor-not-allowed line-through";
            } else if (isCheckInDay || isCheckOutDay) {
              bgClass = "bg-amber-800 text-white font-bold shadow-md";
            } else if (isInSelectedRange) {
              bgClass = "bg-amber-100 text-amber-950 font-medium";
            } else if (isInHoverRange) {
              bgClass = "bg-amber-50 text-amber-900";
            }

            return (
              <button
                key={dateStr}
                type="button"
                disabled={disabled}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => !disabled && setHoverDate(dateStr)}
                onMouseLeave={() => setHoverDate(null)}
                className={`h-14 rounded-lg flex flex-col items-center justify-center transition-all relative ${bgClass}`}
              >
                <span className="text-sm font-semibold">{format(day, "d")}</span>
                {!disabled && (
                  <span
                    className={`text-[10px] tracking-tight ${
                      isCheckInDay || isCheckOutDay ? "text-amber-200" : "text-stone-700 font-medium"
                    }`}
                  >
                    €{Math.round(getDayPrice(day) / 100)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const nextMonth = addMonths(currentMonth, 1);

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm">
      <div className="flex items-center justify-between pb-6 border-b border-stone-100">
        <div>
          <h3 className="font-serif text-xl font-semibold text-stone-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-800" />
            Live Availability & Pricing
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Minimum stay: {propertyData.minStayNights} nights • Real-time rates in EUR (€)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            disabled={isBefore(currentMonth, today)}
            className="p-2 rounded-full border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-stone-700" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-full border border-stone-200 hover:bg-stone-50"
          >
            <ChevronRight className="w-5 h-5 text-stone-700" />
          </button>
        </div>
      </div>

      {/* Side-by-side or stacked months */}
      <div className="flex flex-col lg:flex-row gap-8 pt-6">
        {renderMonth(currentMonth)}
        {renderMonth(nextMonth)}
      </div>

      {/* Selection Summary bar */}
      <div className="mt-8 pt-6 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 bg-stone-50/70 p-4 rounded-xl">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-xs text-stone-500 block uppercase tracking-wider font-semibold">
              Check-In
            </span>
            <span className="font-semibold text-stone-900">
              {checkIn ? format(parseISO(checkIn), "EEE, d MMM yyyy") : "Select date"}
            </span>
          </div>
          <span className="text-stone-300 font-light text-xl">→</span>
          <div>
            <span className="text-xs text-stone-500 block uppercase tracking-wider font-semibold">
              Check-Out
            </span>
            <span className="font-semibold text-stone-900">
              {checkOut ? format(parseISO(checkOut), "EEE, d MMM yyyy") : "Select date"}
            </span>
          </div>
          {checkIn && checkOut && (
            <div className="pl-4 border-l border-stone-200">
              <span className="text-xs text-stone-500 block uppercase tracking-wider font-semibold">
                Duration
              </span>
              <span className="font-semibold text-amber-900">
                {differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn))} nights
              </span>
            </div>
          )}
        </div>

        {checkIn && !checkOut && (
          <div className="flex items-center gap-1.5 text-xs text-amber-800 font-medium">
            <Info className="w-4 h-4" />
            Please select your check-out date (min. {propertyData.minStayNights} nights)
          </div>
        )}

        {checkIn && checkOut && (
          <button
            type="button"
            onClick={() => {
              setCheckIn(null);
              setCheckOut(null);
              if (onSelectDates) onSelectDates(null, null);
            }}
            className="text-xs text-stone-500 hover:text-stone-800 underline"
          >
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
}
