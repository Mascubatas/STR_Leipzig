import React from "react";
import Link from "next/link";
import { ArrowLeft, VolumeX, CigaretteOff, PartyPopper, Clock, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Hausordnung | The Augustus Loft Leipzig",
  description: "House rules and community standards for LeipzigStay.",
};

export default function HausordnungPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs text-stone-500 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Return to Home
      </Link>

      <div className="space-y-3">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-800">
          House Standards
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Hausordnung & Richtlinien
        </h1>
        <p className="text-xs text-stone-500">The Augustus Loft Leipzig • Stand: 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6 text-sm text-stone-700 leading-relaxed">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-900 shrink-0">
            <VolumeX className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-stone-900">1. Gesetzliche Nachtruhe (22:00 - 07:00 Uhr)</h2>
            <p className="text-xs text-stone-600 mt-1">
              Im gesamten Gebäude gilt gemäß sächsischem Landesimmissionsschutzgesetz die Nachtruhe ab 22:00 Uhr. Fernseher und Musik sind auf Zimmerlautstärke zu regulieren.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-900 shrink-0">
            <CigaretteOff className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-stone-900">2. Absolutes Rauchverbot in den Innenräumen</h2>
            <p className="text-xs text-stone-600 mt-1">
              Das Rauchen von Tabak, E-Zigaretten oder Shishas ist im gesamten Apartment streng untersagt. Bei Zuwiderhandlung wird eine Pauschale von 350 € für Ozonbehandlung und Sonderreinigung berechnet.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-900 shrink-0">
            <PartyPopper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-stone-900">3. Keine Partys oder Junggesellenabschiede</h2>
            <p className="text-xs text-stone-600 mt-1">
              Die Durchführung von Feiern, Partys oder lauten Versammlungen ist nicht gestattet. Nicht angemeldete Gäste dürfen nicht im Apartment übernachten.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-900 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-stone-900">4. Check-in (15:00) & Check-out (11:00)</h2>
            <p className="text-xs text-stone-600 mt-1">
              Bitte verlassen Sie das Apartment am Abreisetag bis spätestens 11:00 Uhr, damit unser Reinigungsteam die Räumlichkeiten für die nächsten Gäste vorbereiten kann.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
