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
    text: "När texten saknar proportion, basnivå eller sammanhang.",
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
        <h2 className="font-serif text-2xl font-semibold text-[var(--ink)]">
          Besökarbedömningar (enskilda artiklar)
        </h2>
        <p className="max-w-3xl text-[var(--ink-muted)]">
          Utöver det dagliga löpsedelsindexet kan besökare skicka in en artikel-URL från en
          listade tidning och få en separat{' '}
          <Link href="/#bedom-artikel" className="text-[var(--accent)] hover:underline">
            besökarbedömning
          </Link>
          . Den ingår <strong className="font-medium text-[var(--ink)]">inte</strong> i dagens
          rankningar eller det officiella dagindexet — men använder samma fem dimensioner och
          samma 0–100-skala.
        </p>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold text-[var(--ink)]">Vad som bedöms</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--ink-muted)]">
            <li>
              <strong className="text-[var(--ink)]">Rubriken</strong> på artikelsidan poängsätts
              för sig.
            </li>
            <li>
              <strong className="text-[var(--ink)]">Ingressen</strong> (artikelns inledande stycke)
              poängsätts också för sig — den är ofta avgörande för hur artikeln formulerar hot
              och känslor efter klick.
            </li>
            <li>
              <strong className="text-[var(--ink)]">Sammanlagt poäng</strong> är medelvärdet av
              rubrik och ingress (avrundat till heltal 0–100).
            </li>
            <li>
              Resten av artikeltexten läses inte in och bedöms inte.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold text-[var(--ink)]">Hur ingressen hämtas</h3>
          <p className="mt-2 text-[var(--ink-muted)]">
            Vi hämtar sidans HTML och letar efter ingress i denna ordning:
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[var(--ink-muted)]">
            <li>Strukturerad data (JSON-LD) med fältet <code className="text-sm">articleBody</code></li>
            <li>Meta-beskrivning (<code className="text-sm">og:description</code>)</li>
            <li>Första stycket i artikelns HTML</li>
          </ol>
          <p className="mt-3 text-[var(--ink-muted)]">
            Ingressen trunkeras till cirka 800 tecken. Om sidan inte går att läsa (t.ex. paywall
            eller inloggning) publiceras bedömningen med{' '}
            <strong className="text-[var(--ink)]">endast rubrik</strong> och en tydlig varning på
            resultatsidan.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold text-[var(--ink)]">Poäng och motivering</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--ink-muted)]">
            <li>
              AI-modellen ger dimensionpoäng 1–10 för rubrik respektive ingress, som mappas till
              samma interna skala och 0–100-visning som löpsedelsrubriker.
            </li>
            <li>
              Båda texterna antas ha{' '}
              <strong className="text-[var(--ink)]">exponeringsvikt × 1,5</strong> — motsvarande
              det läsaren möter först på en artikelsida (rubrik och ingress ovanför brödtexten).
            </li>
            <li>
              För varje text sparas en{' '}
              <strong className="text-[var(--ink)]">motivering</strong>: en kort förklaring per
              dimension, som visas på bedömningssidan tillsammans med dimensionpoängen.
            </li>
            <li>
              Metodversion (<code className="text-sm">promptVersion</code>) och modell anges på
              varje publicerad bedömning.
            </li>
          </ul>
        </div>

        <table className="w-full overflow-hidden rounded-xl border border-[var(--border)] text-left text-sm">
          <thead className="bg-[var(--surface-muted)]">
            <tr>
              <th className="p-3 font-medium text-[var(--ink)]" />
              <th className="p-3 font-medium text-[var(--ink)]">Officiellt dagindex</th>
              <th className="p-3 font-medium text-[var(--ink)]">Besökarbedömning</th>
            </tr>
          </thead>
          <tbody className="text-[var(--ink-muted)]">
            <tr className="border-t border-[var(--border)]">
              <td className="p-3 font-medium text-[var(--ink)]">Underlag</td>
              <td className="p-3">Mobil löpsedel, alla synliga rubriker</td>
              <td className="p-3">En artikel-URL: rubrik + ingress</td>
            </tr>
            <tr className="border-t border-[var(--border)]">
              <td className="p-3 font-medium text-[var(--ink)]">Aggregering</td>
              <td className="p-3">70 % högsta + 30 % snitt per dag</td>
              <td className="p-3">Medel av rubrik och ingress</td>
            </tr>
            <tr className="border-t border-[var(--border)]">
              <td className="p-3 font-medium text-[var(--ink)]">Exponering</td>
              <td className="p-3">× 1,5 eller × 1,0 beroende på scroll</td>
              <td className="p-3">× 1,5 för rubrik och ingress</td>
            </tr>
            <tr className="border-t border-[var(--border)]">
              <td className="p-3 font-medium text-[var(--ink)]">Motivering</td>
              <td className="p-3">Per rubrik på dagssidan</td>
              <td className="p-3">Separat för rubrik och ingress</td>
            </tr>
            <tr className="border-t border-[var(--border)]">
              <td className="p-3 font-medium text-[var(--ink)]">Jämförbarhet</td>
              <td className="p-3">Tidsserie per tidning</td>
              <td className="p-3">Separat snitt per tidning; ej blandat i dagliga listor</td>
            </tr>
          </tbody>
        </table>

        <p className="max-w-3xl text-sm text-[var(--ink-muted)]">
          Samma normaliserade artikel-URL bedöms bara en gång. Senare inskick pekar om till
          befintlig bedömning.
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
          Varje rubrik i det dagliga indexet sparas med modellens motivering, prompt-version och
          modellversion. Besökarbedömningar sparar motivering{' '}
          <strong className="font-medium text-[var(--ink)]">för rubrik och ingress var för sig</strong>
          , plus vilken metodversion som användes. Om metoden uppdateras dokumenteras det här —
          historiska poäng blandas inte tyst. Äldre bedömningar kan behöva omräknas manuellt vid
          större metodskiften.
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
