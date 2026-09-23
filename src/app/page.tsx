"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  Maximize,
  Wifi,
  Tv,
  Coffee,
  UtensilsCrossed,
  Wind,
  Shirt,
  ShieldCheck,
  Calendar,
  Sparkles,
  ChevronDown,
  Clock,
  VolumeX,
  CigaretteOff,
  PartyPopper,
  ExternalLink,
} from "lucide-react";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { BookingPriceCard } from "@/components/BookingPriceCard";
import { PhotoGalleryModal } from "@/components/PhotoGalleryModal";
import {
  LEIPZIG_PROPERTY_SEED,
  SEED_PHOTOS,
  SEED_AMENITIES,
  SEED_HOUSE_RULES,
  SEED_FAQS,
  SEED_LEIPZIG_GUIDE,
} from "@/db/seed-data";

export default function HomePage() {
  const [selectedCheckIn, setSelectedCheckIn] = useState<string | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSelectDates = (inDate: string | null, outDate: string | null) => {
    setSelectedCheckIn(inDate);
    setSelectedCheckOut(outDate);
  };

  const openGalleryAt = (index: number) => {
    setGalleryInitialIndex(index);
    setGalleryOpen(true);
  };

  return (
    <div className="pb-24">
      {/* 1. Header & Title Block */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold tracking-wide">
                Direct Booking Exclusive
              </span>
              <div className="flex items-center gap-1 text-sm font-semibold text-stone-900">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>4.98</span>
                <span className="text-stone-700 underline font-normal">(64 verified guest reviews)</span>
              </div>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight leading-tight">
              {LEIPZIG_PROPERTY_SEED.name}
            </h1>
            <p className="mt-2 text-stone-700 flex items-center gap-1.5 text-sm sm:text-base font-medium">
              <MapPin className="w-4 h-4 text-amber-800" />
              <span>{LEIPZIG_PROPERTY_SEED.address}, {LEIPZIG_PROPERTY_SEED.postalCode} {LEIPZIG_PROPERTY_SEED.city}, Germany</span>
              <span className="text-stone-400">•</span>
              <span className="text-stone-700 font-semibold">2 min walk to Gewandhaus & Augustusplatz</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openGalleryAt(0)}
              className="px-4 py-2 rounded-xl border border-stone-300 text-sm font-medium hover:bg-stone-50 transition-colors shadow-sm cursor-pointer"
            >
              Browse 6 Photos
            </button>
            <a
              href="#calendar"
              className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-medium transition-colors shadow-sm"
            >
              View Calendar
            </a>
          </div>
        </div>
      </div>

      {/* 2. Photo Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 h-[380px] sm:h-[480px] rounded-3xl overflow-hidden shadow-lg relative">
          {/* Main Hero Photo (Left 2 cols, 2 rows) */}
          <div
            onClick={() => openGalleryAt(0)}
            className="md:col-span-2 md:row-span-2 relative group cursor-pointer overflow-hidden"
          >
            <img
              src={SEED_PHOTOS[0].url}
              alt={SEED_PHOTOS[0].caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
              <span className="text-white text-sm font-medium">{SEED_PHOTOS[0].caption}</span>
            </div>
          </div>

          {/* Photo 2 */}
          <div
            onClick={() => openGalleryAt(1)}
            className="hidden md:block relative group cursor-pointer overflow-hidden"
          >
            <img
              src={SEED_PHOTOS[1].url}
              alt={SEED_PHOTOS[1].caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Photo 3 */}
          <div
            onClick={() => openGalleryAt(2)}
            className="hidden md:block relative group cursor-pointer overflow-hidden"
          >
            <img
              src={SEED_PHOTOS[2].url}
              alt={SEED_PHOTOS[2].caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Photo 4 */}
          <div
            onClick={() => openGalleryAt(3)}
            className="hidden md:block relative group cursor-pointer overflow-hidden"
          >
            <img
              src={SEED_PHOTOS[3].url}
              alt={SEED_PHOTOS[3].caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Photo 5 with View More Button */}
          <div
            onClick={() => openGalleryAt(4)}
            className="hidden md:block relative group cursor-pointer overflow-hidden"
          >
            <img
              src={SEED_PHOTOS[4].url}
              alt={SEED_PHOTOS[4].caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-stone-900/40 group-hover:bg-stone-900/60 transition-colors flex items-center justify-center">
              <span className="px-4 py-2 rounded-full bg-white/95 text-stone-900 font-semibold text-xs tracking-wider shadow">
                + View All 6 Photos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content & Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column (8 cols): Property Overview, Details, Amenities, Guide */}
          <div className="lg:col-span-7 space-y-12">
            {/* Quick Specs Bar */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 pb-8 border-b border-stone-200 text-stone-700 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-800" />
                <span>Up to <strong>4 Guests</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-amber-800" />
                <span><strong>2 Bedrooms</strong> (2 King)</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-amber-800" />
                <span><strong>1 Spa Bathroom</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize className="w-5 h-5 text-amber-800" />
                <span><strong>88 m²</strong> Living Space</span>
              </div>
            </div>

            {/* Key Luxury Highlights */}
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-stone-900">
                Curated Luxury in Central Leipzig
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-stone-900">1,000 Mbps High-Speed Fiber</h3>
                    <p className="text-xs text-stone-500 mt-0.5">Ultra-low latency Wi-Fi & dedicated ergonomic desk</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-stone-900">Historic Heritage Stucco</h3>
                    <p className="text-xs text-stone-500 mt-0.5">3.4m ceiling height with authentic herringbone oak parquet</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-stone-900">Siemens Gourmet Kitchen</h3>
                    <p className="text-xs text-stone-500 mt-0.5">Nespresso bar with complimentary Grand Cru pods</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-stone-900">24/7 Keyless Self-Check-in</h3>
                    <p className="text-xs text-stone-500 mt-0.5">Arrive seamlessly anytime after 15:00 via digital PIN</p>
                  </div>
                </div>
              </div>
            </div>

            {/* In-depth Description */}
            <div id="overview" className="space-y-4 pt-4 border-t border-stone-200">
              <h2 className="font-serif text-2xl font-semibold text-stone-900">About the Residence</h2>
              <div className="text-stone-600 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
                {LEIPZIG_PROPERTY_SEED.description}
              </div>
            </div>

            {/* Amenities Section */}
            <div id="amenities" className="pt-8 border-t border-stone-200 space-y-6">
              <h2 className="font-serif text-2xl font-semibold text-stone-900">
                Apartment Amenities & Comforts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SEED_AMENITIES.map((am, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                      {am.category === "Kitchen" && <UtensilsCrossed className="w-4 h-4" />}
                      {am.category === "Comfort" && <Wind className="w-4 h-4" />}
                      {am.category === "Entertainment" && <Tv className="w-4 h-4" />}
                      {am.category === "Essentials" && <Shirt className="w-4 h-4" />}
                      {am.category !== "Kitchen" &&
                        am.category !== "Comfort" &&
                        am.category !== "Entertainment" &&
                        am.category !== "Essentials" && <Sparkles className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-stone-800 block">{am.name}</span>
                      <span className="text-[11px] text-stone-500 uppercase tracking-wider">{am.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Availability Calendar */}
            <div id="calendar" className="pt-8 border-t border-stone-200 space-y-4">
              <AvailabilityCalendar
                onSelectDates={handleSelectDates}
                selectedCheckIn={selectedCheckIn}
                selectedCheckOut={selectedCheckOut}
              />
            </div>

            {/* Leipzig Neighborhood Guide */}
            <div id="guide" className="pt-8 border-t border-stone-200 space-y-6">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-amber-800 block">
                  Location & Surroundings
                </span>
                <h2 className="font-serif text-2xl font-semibold text-stone-900 mt-1">
                  Explore Leipzig Zentrum
                </h2>
                <p className="text-sm text-stone-600 mt-1">
                  Located in the prestigious pedestrian zone of Grimmaische Straße, within walking distance of Leipzig&apos;s cultural landmarks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {SEED_LEIPZIG_GUIDE.map((spot, i) => (
                  <div
                    key={i}
                    className="group rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="h-44 overflow-hidden relative">
                      <img
                        src={spot.image}
                        alt={spot.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/70 text-white text-xs font-semibold backdrop-blur-sm">
                        {spot.distance}
                      </span>
                    </div>
                    <div className="p-5">
                      <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                        {spot.category}
                      </span>
                      <h3 className="font-serif text-base font-semibold text-stone-900 mt-0.5">
                        {spot.title}
                      </h3>
                      <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                        {spot.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div id="rules" className="pt-8 border-t border-stone-200 space-y-6">
              <h2 className="font-serif text-2xl font-semibold text-stone-900">
                House Rules & Policies
              </h2>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl bg-white overflow-hidden">
                {SEED_HOUSE_RULES.map((rule, i) => (
                  <div key={i} className="p-5 flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-stone-100 text-stone-700 shrink-0 mt-0.5">
                      {rule.ruleType === "CHECKIN" && <Clock className="w-5 h-5 text-amber-800" />}
                      {rule.ruleType === "QUIET_HOURS" && <VolumeX className="w-5 h-5 text-amber-800" />}
                      {rule.ruleType === "NO_SMOKING" && <CigaretteOff className="w-5 h-5 text-amber-800" />}
                      {rule.ruleType === "PARTIES" && <PartyPopper className="w-5 h-5 text-amber-800" />}
                      {rule.ruleType !== "CHECKIN" &&
                        rule.ruleType !== "QUIET_HOURS" &&
                        rule.ruleType !== "NO_SMOKING" &&
                        rule.ruleType !== "PARTIES" && <ShieldCheck className="w-5 h-5 text-amber-800" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-stone-900">{rule.title}</h3>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Accordion */}
            <div id="faq" className="pt-8 border-t border-stone-200 space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-stone-900">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {SEED_FAQS.map((faq, i) => {
                  const isOpen = openFaqIndex === i;
                  return (
                    <div
                      key={i}
                      className="border border-stone-200 rounded-2xl bg-white overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left font-medium text-stone-900 hover:text-amber-800 transition-colors"
                      >
                        <span className="text-sm font-semibold">{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-stone-400 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Sticky Booking Card */}
          <div className="lg:col-span-5">
            <BookingPriceCard
              checkIn={selectedCheckIn}
              checkOut={selectedCheckOut}
              basePriceMinor={LEIPZIG_PROPERTY_SEED.basePriceMinor}
              minStayNights={LEIPZIG_PROPERTY_SEED.minStayNights}
            />
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      <PhotoGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        photos={SEED_PHOTOS}
        initialIndex={galleryInitialIndex}
      />
    </div>
  );
}
