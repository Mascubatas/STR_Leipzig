import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Impressum | The Augustus Loft Leipzig",
  description: "Legal notice and statutory disclosures under German § 5 TMG for LeipzigStay.",
};

export default function ImpressumPage() {
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
          Statutory Disclosure
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Impressum (Legal Notice)
        </h1>
        <p className="text-xs text-stone-500">Angaben gemäß § 5 TMG</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6 text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-stone-900">Betreiber & Anschrift</h2>
          <p>
            <strong>LeipzigStay Serviced Apartments GmbH</strong> (in Gründung) <br />
            Grimmaische Str. 18 <br />
            04109 Leipzig <br />
            Deutschland
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-stone-900">Vertreten durch</h2>
          <p>Geschäftsführung: Dr. Maximilian Richter</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-stone-900">Kontakt</h2>
          <p>
            Telefon: +49 341 9998877 <br />
            E-Mail: stay@leipzigstay.de <br />
            Website: https://leipzigstay.de
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-stone-900">Umsatzsteuer-Identifikationsnummer</h2>
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: <br />
            DE 341 889 012 (beantragt)
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-stone-900">Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
          <p className="text-xs text-stone-600">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
            https://ec.europa.eu/consumers/odr. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>
      </div>
    </div>
  );
}
