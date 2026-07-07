# Besökarbedömningar — komplett setup-guide

Den här guiden förklarar **exakt** vad du ska göra, i vilken ordning, och var du klickar. Du behöver inte vara utvecklare — följ stegen ett i taget.

**Total tid:** cirka 30–60 minuter (plus eventuell väntetid på e-postdomän).

---

## Vad du håller på att sätta upp

Besökare ska kunna klistra in en artikel-URL från en tidning, få ett alarmindex-poäng, och få resultatet via e-post. För att det ska fungera behöver fyra saker prata med varandra:

| Tjänst | Vad den gör |
|--------|-------------|
| **Sanity** | Sparar bedömningarna (databas) |
| **Anthropic (Claude)** | Poängsätter rubriken med AI |
| **Resend** | Skickar e-post till besökaren |
| **Cloudflare Turnstile** | Stoppar spam (”är du en robot?”) |

Dessutom behöver **Vercel** (där alarmindex.com körs) veta alla lösenord/nycklar.

---

## Ordning — gör så här

```
1. Skapa nycklar och konton (Sanity, Resend, Turnstile)
2. Lägg in nycklarna i Vercel och på din dator
3. Uppdatera Sanity med ny datatyp
4. Ladda upp ny sajkod
5. Testa
```

**Viktigt:** Gör steg 1–2 **innan** du laddar upp koden. Då fungerar allt direkt när sajten uppdateras.

---

# STEG 1 — Sanity: skapa en skriv-nyckel

Du har redan en **läs-nyckel** (`SANITY_API_READ_TOKEN`) som låter sajten *läsa* data. Nu behöver du en **skriv-nyckel** så sajten kan *spara* nya bedömningar.

### 1.1 Öppna Sanity

1. Gå till [sanity.io/manage](https://www.sanity.io/manage) i webbläsaren
2. Logga in med samma konto du använder för Alarmindex
3. Klicka på ditt **Alarmindex-projekt** (det som matchar ditt project ID)

### 1.2 Skapa token

1. I vänstermenyn: klicka **API**
2. Klicka fliken **Tokens**
3. Klicka knappen **Add API token** (eller **Add token**)
4. Fyll i:
   - **Label (namn):** `alarmindex-write`
   - **Permissions (behörighet):** välj **Editor** (inte Viewer, inte Admin)
5. Klicka **Save** eller **Create**
6. En lång text visas som börjar med `sk...` — det är din nyckel

### 1.3 Spara nyckeln säkert

1. Kopiera hela texten (`sk...`)
2. Klistra in den i en tillfällig anteckning (Anteckningar, Notepad) — du behöver den flera gånger snart
3. **Visas bara en gång** — om du tappar den måste du skapa en ny

> **Tips:** Om du redan har en nyckel i GitHub under `SANITY_AUTH_TOKEN` (för dagliga körningar) kan det vara samma typ. Du kan använda samma värde som `SANITY_API_WRITE_TOKEN` om du hittar den i GitHub → Settings → Secrets.

---

# STEG 2 — Resend: e-post till besökare

När en bedömning är klar (eller misslyckas) skickas e-post via Resend.

### 2.1 Skapa konto

1. Gå till [resend.com](https://resend.com)
2. Klicka **Sign up** och skapa konto (gratis nivå räcker för att börja)
3. Bekräfta din e-post om du ombeds

### 2.2 Skapa API-nyckel

1. I Resend: klicka **API Keys** i vänstermenyn
2. Klicka **Create API Key**
3. Namn: t.ex. `alarmindex`
4. Behörighet: **Sending access** (eller Full access)
5. Klicka **Create**
6. Kopiera nyckeln — den börjar med `re_...`
7. Spara i samma anteckning som Sanity-nyckeln

### 2.3 Koppla din domän (för e-post från @alarmindex.com)

1. I Resend: klicka **Domains** i vänstermenyn
2. Klicka **Add Domain**
3. Skriv: `alarmindex.com`
4. Klicka **Add**
5. Resend visar nu flera **DNS-poster** (rader med typ TXT, MX, CNAME)

### 2.4 Lägg in DNS hos din domänleverantör

Det här gör du där du köpte `alarmindex.com` (t.ex. Loopia, One.com, Cloudflare, GoDaddy):

1. Logga in hos domänleverantören
2. Hitta **DNS-inställningar** eller **DNS-hantering** för `alarmindex.com`
3. För varje rad Resend visar: skapa en ny DNS-post med exakt samma **Typ**, **Namn** och **Värde** som Resend anger
4. Spara
5. Gå tillbaka till Resend → **Domains** — statusen ska bli **Verified** (grön). Det kan ta 5 minuter till 24 timmar

> **Medan du väntar på DNS:** Du kan fortsätta med steg 3–6. E-post fungerar först när domänen är verifierad. Resten av funktionen kan testas utan e-post.

### 2.5 Vilken avsändaradress?

När domänen är verifierad använder du:

```
Alarmindex <noreply@alarmindex.com>
```

Skriv exakt så (med vinkelparenteser runt e-postadressen) när du fyller i miljövariabler senare.

---

# STEG 3 — Cloudflare Turnstile: skydd mot spam

Turnstile är en ruta som besökaren måste klicka i (“Bekräfta att du är en människa”) innan de skickar in en URL.

### 3.1 Skapa Cloudflare-konto (om du inte har)

1. Gå till [dash.cloudflare.com](https://dash.cloudflare.com)
2. Skapa konto eller logga in (gratis räcker)

### 3.2 Skapa Turnstile-widget

1. I Cloudflare: leta upp **Turnstile** i vänstermenyn (under “Protect & Connect” eller sök efter “Turnstile”)
2. Klicka **Add widget** eller **Create**
3. Fyll i:
   - **Widget name:** `Alarmindex bedömningar`
   - **Widget mode:** välj **Managed** (rekommenderat)
   - **Domains:** skriv `alarmindex.com` och tryck Enter. Lägg även till `localhost` (för test på din dator)
4. Klicka **Create** eller **Save**

### 3.3 Kopiera två nycklar

Efter skapandet visas:

| Namn i Cloudflare | Ditt variabelnamn senare |
|-------------------|--------------------------|
| **Site Key** (publik) | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` |
| **Secret Key** (hemlig) | `TURNSTILE_SECRET_KEY` |

Kopiera båda till din anteckning.

---

# STEG 4 — Anthropic-nyckel (AI-poäng)

Den här nyckeln har du troligen redan — den används för dagliga rubrikpoäng i pipelinen.

1. Öppna mappen `alarmindex-studio` på din dator
2. Öppna filen `.env` i Anteckningar (om du inte ser filen: visa dolda filer, eller öppna via Cursor)
3. Leta efter raden `ANTHROPIC_API_KEY=sk-ant-...`
4. Kopiera värdet efter `=` (hela nyckeln)

Om raden saknas: gå till [console.anthropic.com](https://console.anthropic.com) → API Keys → skapa ny och lägg i anteckningen.

---

# STEG 5 — Lägg in nycklar i Vercel

Vercel är där alarmindex.com körs. Här talar du om för sajten vilka nycklar den ska använda.

### 5.1 Öppna Vercel

1. Gå till [vercel.com](https://vercel.com) och logga in
2. Klicka på projektet **alarmindex** (eller vad det heter)

### 5.2 Öppna miljövariabler

1. Klicka **Settings** (överst)
2. I vänstermenyn: klicka **Environment Variables**

### 5.3 Lägg till varje variabel

För **varje rad** i tabellen nedan:

1. Klicka **Add New** eller **Add**
2. Fyll i **Key** (namnet exakt som i tabellen)
3. Fyll i **Value** (värdet från din anteckning)
4. Kryssa i alla tre: **Production**, **Preview**, **Development**
5. Klicka **Save**

| Key (namn) | Value (vad du klistrar in) |
|------------|----------------------------|
| `SANITY_API_WRITE_TOKEN` | Sanity Editor-token från steg 1 (`sk...`) |
| `ANTHROPIC_API_KEY` | Från steg 4 (`sk-ant-...`) |
| `RESEND_API_KEY` | Från steg 2 (`re_...`) |
| `RESEND_FROM_EMAIL` | `Alarmindex <noreply@alarmindex.com>` |
| `TURNSTILE_SECRET_KEY` | Secret Key från steg 3 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site Key från steg 3 |

**Lägg inte till nya värden** för det som redan finns (t.ex. `NEXT_PUBLIC_SANITY_PROJECT_ID`) — bara om något saknas.

### 5.4 Spara och kontrollera

När alla sex är tillagda ska de synas i listan. Du behöver **inte** redeploya än — det gör vi efter att koden laddats upp.

---

# STEG 6 — Lägg in nycklar lokalt (för test på din dator)

Om du vill testa på `localhost:3000` innan allt är live:

### 6.1 Öppna filen

1. Öppna mappen `C:\Users\simon\projekt\alarmindex`
2. Öppna filen `.env.local` i Anteckningar (eller skapa den om den saknas — kopiera från `.env.example`)

### 6.2 Lägg till dessa rader längst ner

Klistra in (ersätt med dina riktiga värden):

```
SANITY_API_WRITE_TOKEN=sk-din-sanity-nyckel-här
ANTHROPIC_API_KEY=sk-ant-din-anthropic-nyckel-här
RESEND_API_KEY=re_din-resend-nyckel-här
RESEND_FROM_EMAIL=Alarmindex <noreply@alarmindex.com>
TURNSTILE_SECRET_KEY=din-turnstile-secret-här
NEXT_PUBLIC_TURNSTILE_SITE_KEY=din-turnstile-site-key-här
```

### 6.3 Spara filen

Inga citattecken runt värdena. En rad per variabel.

---

# STEG 7 — Uppdatera Sanity med ny datatyp

Sajten ska spara bedömningar i en ny typ av dokument som heter `visitorAssessment`. Det måste registreras i Sanity.

### 7.1 Öppna terminalen i studio-mappen

1. Öppna **PowerShell** (Windows-tangenten, skriv `PowerShell`, Enter)
2. Skriv:

```powershell
cd C:\Users\simon\projekt\alarmindex-studio
```

3. Tryck Enter

### 7.2 Deploya schemat

Skriv:

```powershell
npm run deploy
```

Tryck Enter. Vänta tills det står att det lyckades.

### 7.3 Kontrollera i Studio

1. Öppna din Sanity Studio i webbläsaren (länken du brukar, t.ex. `https://alarmindex.sanity.studio` eller localhost:3333)
2. I vänstermenyn ska det finnas **Besökarbedömningar**
3. Om det syns är steget klart

---

# STEG 8 — Ladda upp ny sajkod

Nu när alla nycklar finns på plats kan koden laddas upp.

### 8.1 Frontend (alarmindex.com)

1. Öppna PowerShell
2. Kör:

```powershell
cd C:\Users\simon\projekt\alarmindex
git add .
git commit -m "Add visitor article assessments with email notifications."
git push origin HEAD:main
```

3. Om Git frågar om inloggning: följ anvisningarna (GitHub)

### 8.2 Vänta på Vercel

1. Gå till [vercel.com](https://vercel.com) → projektet alarmindex
2. Klicka **Deployments**
3. Vänta tills den översta raden har grön bock och står **Ready** (ofta 1–3 minuter)

### 8.3 Studio-kod (versionshantering)

```powershell
cd C:\Users\simon\projekt\alarmindex-studio
git add schemaTypes/visitorAssessment.ts schemaTypes/constants.ts schemaTypes/index.ts structure/index.ts lib/extract-article-headline.ts scripts/process-assessments.ts package.json
git commit -m "Add visitorAssessment schema and assessment processing script."
git push
```

(Schemat är redan deployat i steg 7 — det här är för att spara koden i GitHub.)

---

# STEG 9 — Testa att allt fungerar

### 9.1 Test på din dator (valfritt)

1. PowerShell:

```powershell
cd C:\Users\simon\projekt\alarmindex
npm run dev
```

2. Öppna webbläsaren: `http://localhost:3000/tidning/dn`
3. Scrolla ner till **Bedöm en artikel**

### 9.2 Test på riktiga sajten

1. Gå till `https://alarmindex.com/tidning/dn` (eller annan tidning)
2. Scrolla till **Bedöm en artikel**

### 9.3 Skicka in en bedömning

1. **Hitta en artikel-URL** — öppna dn.se i en ny flik, klicka på en **enskild nyhetsartikel**, kopiera adressen från adressfältet  
   - Rätt: `https://www.dn.se/.../någon-artikel/...`  
   - Fel: bara `https://www.dn.se` (startsidan fungerar inte än)
2. Klistra in URL:en i formuläret
3. Skriv din e-postadress
4. Kryssa eventuellt i marknadsutskick (valfritt)
5. Klicka i CAPTCHA-rutan (Turnstile)
6. Klicka **Bedöm rubrik**

### 9.4 Vad ska hända?

| Steg | Vad du ser |
|------|------------|
| Direkt | Du kommer till en sida `/bedomning/xxxxxxx` med texten att bedömning pågår |
| Efter 30–60 sek | Poäng och rubrik visas på samma sida |
| E-post | Du får mail med ämnet *"Din alarmindex-bedömning är klar"* (kräver verifierad Resend-domän) |
| Samma URL igen | Du hamnar direkt på samma bedömning — ingen ny analys |

### 9.5 Kontrollera i Sanity

1. Öppna Studio → **Besökarbedömningar**
2. Ditt test ska synas med status **published** och ett poäng

---

# Om något inte fungerar

### ”Bedömningar är inte konfigurerade ännu”

- `SANITY_API_WRITE_TOKEN` saknas i Vercel → gör steg 5 igen
- Efter ändring i Vercel: Deployments → tre prickar på senaste → **Redeploy**

### CAPTCHA visas inte eller fungerar inte

- Kontrollera att `NEXT_PUBLIC_TURNSTILE_SITE_KEY` finns i Vercel
- Kontrollera att `localhost` och `alarmindex.com` finns i Turnstile-widgeten
- Redeploy efter ändring

### Ingen e-post

- Resend → **Logs** — ser du försök där?
- Är domänen **Verified** i Resend?
- Stämmer `RESEND_FROM_EMAIL`?

### Bedömningen fastnar på ”pågår”

1. Vercel → projektet → **Logs** (eller Functions)
2. Leta efter fel vid `/api/assess`
3. Vanliga orsaker: fel Anthropic-nyckel, eller artikeln går inte att läsa (paywall)

### Nödlösning — kör bedömning manuellt

Om något fastnat i ”väntar”:

```powershell
cd C:\Users\simon\projekt\alarmindex-studio
npm run process-assessments
```

Detta fyller i data i Sanity men skickar **inte** e-post.

---

# Checklista — bocka av när du är klar

```
☐ 1. Sanity Editor-token skapad och sparad
☐ 2. Resend-konto + API-nyckel
☐ 3. Resend-domän alarmindex.com påbörjad (DNS)
☐ 4. Turnstile Site Key + Secret Key
☐ 5. Anthropic-nyckel hämtad från studio .env
☐ 6. Alla 6 variabler inlagda i Vercel
☐ 7. Samma variabler i .env.local (om du testar lokalt)
☐ 8. npm run deploy i alarmindex-studio
☐ 9. ”Besökarbedömningar” syns i Studio
☐ 10. git push alarmindex (frontend)
☐ 11. Vercel-deploy grön (Ready)
☐ 12. git push alarmindex-studio
☐ 13. Testat med en riktig artikel-URL
☐ 14. Fått e-post (när Resend-domän är verifierad)
```

---

# Ordlista

| Ord | Betydelse |
|-----|-----------|
| **Miljövariabel** | Ett lösenord/nyckel som sajten läser — lagras i Vercel, inte i koden |
| **Token / API-nyckel** | En hemlig sträng som bevisar att du får använda en tjänst |
| **Deploy** | Publicera ny version av sajten eller Sanity-schemat |
| **DNS** | Inställningar som kopplar din domän till tjänster (e-post m.m.) |
| **CAPTCHA / Turnstile** | Robot-skydd i formuläret |
| **Editor-token** | Sanity-nyckel med rätt att skriva data |
| **Redeploy** | Starta om sajten på Vercel så nya inställningar laddas |

---

# Vad fungerar inte än

- **Löpsedels-URL:er** (tidningens startsida) — bara **artikel-URL:er**
- **Marknadsutskick** — kryssrutan sparas men ingen e-postlista är kopplad än

Frågor? Se även [BESOKARBEDOMNINGAR.md](./BESOKARBEDOMNINGAR.md) för produktbeskrivning.
