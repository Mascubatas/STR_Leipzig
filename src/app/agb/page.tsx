import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "AGB | The Augustus Loft Leipzig",
  description: "General terms and conditions for booking with LeipzigStay.",
};

export default function AgbPage() {
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
          Booking Agreement
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Allgemeine Geschäftsbedingungen (AGB)
        </h1>
        <p className="text-xs text-stone-500">Gültig ab 1. Januar 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6 text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-stone-900">§ 1 Geltungsbereich & Vertragsabschluss</h2>
          <p>
            Diese Geschäftsbedingungen gelten für Verträge über die mietweise Überlassung des Apartments &apos;The Augustus Loft&apos; zur Beherbergung. Der Beherbergungsvertrag kommt durch die Bestätigung der Buchung des Gastes durch LeipzigStay zustande.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-stone-900">§ 2 Preise, Steuern & Kaution</h2>
          <p>
            Die vereinbarten Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer und der städtischen Beherbergungssteuer der Stadt Leipzig (5% Gästetaxe). Bei Anreise kann zur Absicherung von Nebenkosten und Schäden eine vorübergehende Kautionsautorisierung verlangt werden.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-stone-900">§ 3 Stornobedingungen & Rücktritt</h2>
          <p>
            • Bis 14 Tage vor Anreisetag: Kostenfreie Stornierung mit 100% Rückerstattung des Gesamtbetrages. <br />
            • 7 bis 14 Tage vor Anreisetag: 50% Erstattung des Übernachtungspreises sowie 100% Erstattung der Endreinigungspauschale. <br />
            • Unter 7 Tage vor Anreisetag: Keine Erstattung des Übernachtungspreises; die Endreinigungspauschale wird in voller Höhe erstattet.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-stone-900">§ 4 An- und Abreise</h2>
          <p>
            Das gebuchte Apartment steht dem Gast ab 15:00 Uhr des Anreisetages via digitalem PIN-Code zur Verfügung. Am vereinbarten Abreisetag ist das Apartment bis spätestens 11:00 Uhr ordnungsgemäß geräumt zu hinterlassen.
          </p>
        </section>
      </div>
    </div>
  );
}
