export function GET() {
  const body = `# Alarmindex

> Dagligt formspråksindex för svenska nyhetsrubriker.

Alarmindex mäter hur rubriker och löpsedlar är konstruerade för känslomässig respons.
Besökarbedömningar av enskilda artiklar inkluderar även ingressen (rubrik + ingress poängsätts
separat; sammanlagt poäng är medel). Motivering visas per text på bedömningssidan.
Vi bedömer inte journalistisk kvalitet, sanningshalt eller politisk vinkling.

- Metodik: /metodik
- Dagens index: /
- Tidningar: Aftonbladet, Expressen, Göteborgs-Posten, DN, SvD, Sydsvenskan
`;

  return new Response(body, {
    headers: {"Content-Type": "text/plain; charset=utf-8"},
  });
}
