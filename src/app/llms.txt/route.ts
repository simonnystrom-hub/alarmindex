export function GET() {
  const body = `# Alarmindex

> Dagligt formspråksindex för svenska nyhetsrubriker.

Alarmindex mäter hur rubriker och löpsedlar är konstruerade för känslomässig respons.
Vi bedömer inte journalistisk kvalitet, sanningshalt eller politisk vinkling.

- Metodik: /metodik
- Dagens index: /
- Tidningar: Aftonbladet, Expressen, Göteborgs-Posten, DN, SvD, Sydsvenskan
`;

  return new Response(body, {
    headers: {"Content-Type": "text/plain; charset=utf-8"},
  });
}
