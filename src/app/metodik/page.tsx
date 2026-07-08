import type { Metadata } from "next";
import Link from "next/link";
import { AlarmIndexScale } from "@/components/AlarmIndexScale";
import { getSiteSettings } from "@/lib/sanity/queries";
import { buildPageMetadata } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildPageMetadata(settings, "metodik");
}

const dimensions = [
  {
    name: "Hotintensitet",
    text: "Hur starkt språket signalerar fara, död eller katastrof.",
  },
  {
    name: "Personifiering",
    text: "Om hotet riktas mot dig som läsare.",
  },
  {
    name: "Kontextlöshet",
    text: "När rubriken saknar proportion eller sammanhang.",
  },
  {
    name: "Formspråksintensitet",
    text: "Versaler, utropstecken och superlativ.",
  },
  {
    name: "Känslotyp & intensitet",
    text: "Primär känsla (rädsla, ila, sorg, avsky, neutral) och styrka 1–10.",
  },
];

const newspapers = [
  "Aftonbladet",
  "Expressen",
  "Göteborgs-Posten",
  "Dagens Nyheter",
  "Svenska Dagbladet",
  "Sydsvenskan",
];

export default function MethodologyPage() {
  return (
    <article className="space-y-10">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
          Så funkar Alarmindex
        </h1>
        <p className="max-w-3xl text-lg text-[var(--ink-muted)]">
          Alarmindex mäter formspråk i nyhetsrubriker — hur rubriker är konstruerade för
          att väcka känslor — inte om nyheten är sann, viktig eller väl rapporterad.
        </p>
      </header>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink)]">Kortversion</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--ink-muted)]">
          <li>
            Fem dimensioner, 1–10 poäng vardera → mappas till 0–4 internt → innehållspoäng 0–20 → visning 0–100.
          </li>
          <li>Exponeringsvikt (mobil, synlig utan scroll × 1,5) räknas i kod — inte av AI.</li>
          <li>
            Dagspoäng: <strong className="text-[var(--ink)]">70 % högsta rubrik + 30 % snitt</strong> av
            alla rubriker.
          </li>
          <li>Rubriker publiceras automatiskt efter insamling och AI-poängsättning.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink)]">Fem dimensioner</h2>
        <div className="grid gap-4">
          {dimensions.map((d) => (
            <div
              key={d.name}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]"
            >
              <h3 className="font-semibold text-[var(--ink)]">{d.name}</h3>
              <p className="mt-1 text-[var(--ink-muted)]">{d.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="skala" className="scroll-mt-8">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink)]">
          Tolkningsskala 0–100
        </h2>
        <p className="mt-2 max-w-3xl text-[var(--ink-muted)]">
          Alarmindex är en sammanfattning av hur alarmistiskt formspråket är i rubriker och löpsedlar
          — inte en bedömning av nyhetens betydelse. Tabellen nedan översätter siffror till ord.
        </p>
        <div className="mt-6">
          <AlarmIndexScale />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink)]">Mobil & exponering</h2>
        <p className="max-w-3xl text-[var(--ink-muted)]">
          Vi mäter endast mobilvy (390×844). Det speglar hur de flesta läser nyheter och
          är ett medvetet metodval — inte en genväg.
        </p>
        <table className="mt-4 w-full overflow-hidden rounded-xl border border-[var(--border)] text-left text-sm">
          <thead className="bg-[var(--surface-muted)]">
            <tr>
              <th className="p-3 font-medium text-[var(--ink)]">Position</th>
              <th className="p-3 font-medium text-[var(--ink)]">Vikt</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[var(--border)]">
              <td className="p-3 text-[var(--ink-muted)]">Synlig utan scroll</td>
              <td className="p-3 text-[var(--ink-muted)]">× 1,5</td>
            </tr>
            <tr className="border-t border-[var(--border)]">
              <td className="p-3 text-[var(--ink-muted)]">Kräver scroll</td>
              <td className="p-3 text-[var(--ink-muted)]">× 1,0</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink)]">Screenshots</h2>
        <p className="max-w-3xl text-[var(--ink-muted)]">
          Vid varje insamling sparas två bilder: mobil above-the-fold (390×844 px) som
          styr poängsättningen, och en desktopöversikt (1280 px bred, max 3200 px höjd)
          som visar löpsedeln i bredare format. Desktopbilden är dokumentation — poäng
          baseras alltid på mobil.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink)]">Tidningar i indexet</h2>
        <p className="max-w-3xl text-[var(--ink-muted)]">
          {newspapers.join(", ")}. Urvalet speglar bredd i svensk
          nyhetsdistribution — inte en dom om journalistisk kvalitet.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink)]">Öppenhet</h2>
        <p className="max-w-3xl text-[var(--ink-muted)]">
          Varje rubrik sparas med modellens motivering, prompt-version och modellversion.
          Om metoden uppdateras dokumenteras det — historiska poäng blandas inte tyst.
        </p>
      </section>

      <p>
        <Link
          href="/"
          className="text-sm text-[var(--ink-muted)] underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--ink)]"
        >
          ← Tillbaka till dagens index
        </Link>
      </p>
    </article>
  );
}
