"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Calendar, User, Menu, X, Shield, LogOut } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-xl font-bold shadow-md group-hover:bg-amber-800 transition-colors">
              L
            </div>
            <div>
              <span className="font-serif text-xl tracking-wider font-semibold text-stone-900 block">
                LEIPZIG<span className="text-amber-800">STAY</span>
              </span>
              <span className="text-xs tracking-widest text-stone-700 uppercase block font-medium">
                The Augustus Loft • Leipzig
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <Link href="/#overview" className="hover:text-amber-800 transition-colors">
              The Property
            </Link>
            <Link href="/#amenities" className="hover:text-amber-800 transition-colors">
              Amenities
            </Link>
            <Link href="/#guide" className="hover:text-amber-800 transition-colors">
              Leipzig Guide
            </Link>
            <Link href="/#rules" className="hover:text-amber-800 transition-colors">
              House Rules
            </Link>
            <Link href="/#faq" className="hover:text-amber-800 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    Admin Portal
                  </Link>
                ) : (
                  <Link
                    href="/account/bookings"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    My Bookings
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="text-stone-400 hover:text-stone-600 p-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/account/login"
                className="text-sm font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}

            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-amber-800 hover:bg-amber-900 text-white shadow-sm hover:shadow transition-all"
            >
              <Calendar className="w-4 h-4" />
              Book Directly
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/book"
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-800 text-white"
            >
              Book
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-6 py-5 space-y-4">
          <Link
            href="/#overview"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-stone-800 hover:text-amber-800"
          >
            The Property
          </Link>
          <Link
            href="/#amenities"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-stone-800 hover:text-amber-800"
          >
            Amenities
          </Link>
          <Link
            href="/#guide"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-stone-800 hover:text-amber-800"
          >
            Leipzig Guide
          </Link>
          <Link
            href="/#rules"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-stone-800 hover:text-amber-800"
          >
            House Rules
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-stone-800 hover:text-amber-800"
          >
            FAQ
          </Link>
          <div className="pt-4 border-t border-stone-200 flex flex-col gap-3">
            {user ? (
              <>
                {user.role === "ADMIN" ? (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-stone-800 font-semibold"
                  >
                    Admin Portal ({user.email})
                  </Link>
                ) : (
                  <Link
                    href="/account/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-stone-800 font-semibold"
                  >
                    My Bookings ({user.email})
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-left text-sm text-red-600 font-medium"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/account/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-stone-700 font-medium"
              >
                Sign In / Guest Account
              </Link>
            )}
            <Link
              href="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-amber-800 text-white font-medium shadow"
            >
              Book Now (Best Rate Guaranteed)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
