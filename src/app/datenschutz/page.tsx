import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Datenschutzerklärung | The Augustus Loft Leipzig",
  description: "Privacy policy and GDPR data disclosures for LeipzigStay guests.",
};

export default function DatenschutzPage() {
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
          GDPR / DSGVO Compliant
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Datenschutzerklärung (Privacy Policy)
        </h1>
        <p className="text-xs text-stone-500">Stand: September 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6 text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-stone-900">1. Datenschutz auf einen Blick</h2>
          <p>
            Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-stone-900">2. Verantwortliche Stelle</h2>
          <p>
            LeipzigStay Serviced Apartments <br />
            Grimmaische Str. 18, 04109 Leipzig <br />
            E-Mail: datenschutz@leipzigstay.de
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-stone-900">3. Datenerfassung bei Buchung & Meldeschein</h2>
          <p>
            Gemäß Bundesmeldegesetz (BMG) und der Sächsischen Beherbergungsabgabe sind Beherbergungsstätten verpflichtet, Meldedaten der Gäste zu erfassen und für die gesetzliche Dauer aufzubewahren. Die Datenverarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und lit. c DSGVO (rechtliche Verpflichtung).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-stone-900">4. Zahlungsabwicklung</h2>
          <p>
            Zahlungen werden über unseren zertifizierten Zahlungsdienstleister Stripe Payments Europe Ltd. abgewickelt. Ihre vollständigen Kreditkartendaten werden niemals auf unseren Servern gespeichert.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-stone-900">5. Ihre Rechte</h2>
          <p>
            Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder Löschung dieser Daten.
          </p>
        </section>
      </div>
    </div>
  );
}
