import React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, Mail, Phone, Lock, CreditCard } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-stone-800">
          {/* Col 1: Brand & Property */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-amber-700 text-white flex items-center justify-center font-serif font-bold text-lg">
                L
              </div>
              <span className="font-serif text-xl tracking-wider text-white font-semibold">
                LEIPZIG<span className="text-amber-500">STAY</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              The Augustus Loft — Luxury serviced holiday residence directly at Augustusplatz in
              historic Leipzig Zentrum. Direct booking with best rate guarantee, zero hidden fees,
              and 24/7 keyless self-check-in.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Legally registered accommodation in Leipzig, Germany</span>
            </div>
          </div>

          {/* Col 2: Location & Contact */}
          <div className="space-y-3">
            <h3 className="text-white font-serif text-base tracking-wide font-medium">
              Location & Contact
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>Grimmaische Str. 18, 04109 Leipzig, Germany</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a href="mailto:stay@leipzigstay.de" className="hover:text-white transition-colors">
                  stay@leipzigstay.de
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+49 341 9998877</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h3 className="text-white font-serif text-base tracking-wide font-medium">
              Direct Booking
            </h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/book" className="hover:text-amber-400 transition-colors">
                  Check Live Availability
                </Link>
              </li>
              <li>
                <Link href="/account/bookings" className="hover:text-amber-400 transition-colors">
                  Guest Portal & My Bookings
                </Link>
              </li>
              <li>
                <Link href="/#guide" className="hover:text-amber-400 transition-colors">
                  Neighborhood & Concert Guide
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-amber-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition-colors">
                  Owner & Property Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal (German Compliance) */}
          <div className="space-y-3">
            <h3 className="text-white font-serif text-base tracking-wide font-medium">
              Legal & Statutory
            </h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/impressum" className="hover:text-white transition-colors">
                  Impressum (Legal Notice)
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="hover:text-white transition-colors">
                  Datenschutzerklärung (Privacy)
                </Link>
              </li>
              <li>
                <Link href="/agb" className="hover:text-white transition-colors">
                  AGB (Terms & Conditions)
                </Link>
              </li>
              <li>
                <Link href="/hausordnung" className="hover:text-white transition-colors">
                  Hausordnung & Quiet Hours
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} LeipzigStay. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              256-bit TLS Encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-500" />
              Stripe Secure Payments
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
