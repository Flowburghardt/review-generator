# Review Generator — quality.burghardt.studio

> ## ⭐ Dies ist das Haupt-Repo
>
> **Für jedes neue Kundenprojekt dieser Art wird DIESES Repo verwendet** — nicht `Flowburghardt/wytspace-review-generator`.
>
> Es gibt zwei Repos, und sie sind weder Fork noch Branch voneinander, sondern zwei unabhängige Kopien:
>
> | | `review-generator` (hier) | `wytspace-review-generator` |
> |---|---|---|
> | Erstellt | 28.03.2026, 04:48 | 28.03.2026, 13:55 |
> | Live auf | quality.burghardt.studio | feedback.wytspace.studio · fblagerboxxen.w-y-t.space |
> | Kunden-Configs | `burghardt-studio` | `lagerboxxen`, `wytspace-studio` |
> | Stand | **aktuell** — Fakten-Chips, 5 Stile, Sonnet 5 | **veraltet** — Sterne, Adjektiv-Tags, Haiku 4.5 |
> | Letzter Push | laufend | 29.03.2026 |
>
> Der wytspace-Ableger entstand neun Stunden nach diesem Repo als Kopie und ist seit März unverändert. Er läuft weiter für seine zwei Kunden, hat aber die alte Sterne-Logik samt des Adjektiv-Problems, das hier behoben wurde.
>
> **Bei „bau dem Kunden X so ein Google-Bewertungs-Tool":** dieses Repo klonen, eine neue Client-Config anlegen (siehe „Multi-Tenant"), Logo ablegen, Import ergänzen, deployen. Nicht das wytspace-Repo als Vorlage nehmen.
>
> Wird der Ableger irgendwann angefasst, ist der saubere Weg, seine zwei Configs hierher zu ziehen und ihn stillzulegen — solange das nicht passiert ist, existieren zwei Codebasen mit demselben Zweck.

Hilft Kunden dabei, eine Google-Bewertung zu schreiben, die nach ihnen klingt. Der Kunde klickt an, **was tatsächlich passiert ist**, die KI baut daraus einen Text zum Kopieren, danach geht es direkt zum Google-Bewertungsfenster.

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Anthropic SDK (Claude Sonnet 5)

**Live:** https://quality.burghardt.studio

---

## Das Prinzip: Aussagen statt Adjektive

Die erste Version fragte Sterne-Bewertungen und Stimmungs-Tags ab („kreativ", „zuverlässig"). Heraus kamen zwangsläufig Texte wie *„kreativ, zuverlässig und ohne unnötige Umschweife — das Preis-Leistungs-Verhältnis stimmt"*: fünf Adjektive entlang der Kategorienliste, kein einziger überprüfbarer Fakt. Wer Adjektive hineingibt, bekommt Adjektive heraus.

Deshalb tragen die Chips heute **Aussagen**: „Seite war schnell online", „hat nachgefragt statt sich was auszudenken", „Google-Profil gleich mit eingerichtet". Der Prompt baut den Text um eine oder zwei davon herum und erzählt sie aus. Ein Klick für den Kunden, trotzdem Substanz im Text.

**Sterne gibt es bewusst nicht mehr** — sie wurden nie zu Google übertragen und haben nur suggeriert, die Bewertung sei damit erledigt. Die Sterne vergibt der Kunde drüben bei Google selbst.

---

## Features

- **5 Sprachstile:** Normal, Seriös, Kurz & knapp, „Wie's vorher war" (startet bei der Ausgangslage), Gedicht
- **Fakten-Chips pro Projekttyp** — kundenspezifisch in der Config hinterlegt
- **Optionales Freitextfeld** (600 Zeichen), prominent platziert: die stärkste Quelle für einen unverwechselbaren Text
- **Notausgang:** Wer einen der negativen Chips wählt, landet auf dem Feedback-Screen statt beim Google-Link — serverseitig zusätzlich abgesichert (HTTP 400)
- **Menschliche Unsauberkeit** — per Zufallsentscheidung im Code (nicht per „gelegentlich" im Prompt, das kann ein Modell bei einem Einzelaufruf nicht befolgen)
- **Copy-to-Clipboard** mit Textarea-Fallback, Google-Button erst nach dem Kopieren aktiv
- **Rate Limiting:** 10 Generierungen/IP/Stunde + globaler Tagesdeckel, Body-Limit 8 KB
- **Prompt-Injection-Filter** auf dem Freitext
- **DSGVO-konform:** keine Cookies, kein Tracking, keine Datenspeicherung

---

## Multi-Tenant

Ein JSON-File pro Kunde in `src/config/clients/`. Root-URL (`/`) = burghardt.studio, weitere Kunden über ihren Slug (`/kundenname`).

> **Stand heute: nur `burghardt-studio` ist registriert.** Jeder andere Slug liefert 404 (`notFound()`). Die Struktur ist für weitere Kunden vorbereitet, aber noch nicht befüllt.

### Neuen Kunden hinzufügen

**1. JSON-Config erstellen** — `src/config/clients/[slug].json`:

```json
{
  "slug": "kundenname",
  "businessName": "Kundenname GmbH",
  "ownerName": "Max",
  "welcomeText": "Erstell dir in einer halben Minute eine Bewertung für …",
  "googleReviewUrl": "https://search.google.com/local/writereview?placeid=XXXXX",
  "branding": {
    "accentColor": "#c8a98a",
    "accentColorLight": "#d4b89a",
    "bgColor": "#0a0a0a",
    "textColor": "#f0ede8",
    "logoUrl": "/logos/kundenname.svg"
  },
  "projectTypes": [
    {
      "id": "montage",
      "label": "Montage",
      "factChips": [
        "war pünktlich da",
        "hat hinterher aufgeräumt",
        "hat vorher erklärt, was er macht"
      ]
    }
  ],
  "negativeChips": ["hat länger gedauert als gedacht", "lief nicht so rund"],
  "aiContext": "Beschreibung des Unternehmens für den KI-Prompt",
  "feedbackEmail": "info@kundenname.de"
}
```

> **`factChips` müssen Aussagen sein, keine Eigenschaften.** „war pünktlich da" funktioniert, „zuverlässig" nicht — daran ist die erste Version gescheitert.

**Den `googleReviewUrl` nicht aus einer Maps-URL raten.** Er steht im Google-Unternehmensprofil selbst als `metadata.newReviewUri` (via Business-Profile-API abrufbar). Gerade wenn mehrere Profile an derselben Adresse liegen, landet ein geratener Link schnell beim Nachbarn.

**2. Import hinzufügen** in `src/config/index.ts`:

```typescript
import kundenname from "./clients/kundenname.json";

const clients: Record<string, ClientConfig> = {
  "burghardt-studio": burghardtStudio as ClientConfig,
  "kundenname": kundenname as ClientConfig,
};
```

**3. Logo** in `public/logos/` ablegen (SVG, weiß auf transparent).

**4. Push** → Auto-Deploy via Coolify.

Die Projekttypen kommen ausschließlich aus dieser Config — die API leitet ihre Whitelist daraus ab. (Vorher stand die Liste zusätzlich hart in der Route und lief auseinander: „Beratung" war in der UI wählbar und wurde serverseitig stillschweigend verworfen.)

---

## User Flow

```
1. Kunde erhält Link (WhatsApp, E-Mail, QR-Code)
2. Intro: was passiert hier, in drei Schritten
3. Worum ging es? (Projekttypen) → passende Fakten-Chips klappen auf
   darunter immer sichtbar: "Lief etwas nicht rund?"
4. Optionaler Freitext + Sprachstil
5. Routing: negativer Chip gewählt → Feedback-Screen | sonst → Text generieren
6. Text kopieren → Google-Bewertungsfenster öffnet sich
```

---

## API

```
POST /api/generate
Content-Type: application/json

{
  "clientSlug": "burghardt-studio",
  "projectTypes": ["website", "branding"],
  "selectedFacts": ["Seite war schnell online", "Logo neu gezeichnet"],
  "personalNote": "Wir hatten vorher gar keine Website.",
  "tone": "wie-vorher",
  "projectName": "Autohaus Paulmann"
}

→ { "reviewText": "...", "noteDropped": false }
```

`noteDropped: true` heißt: Der Injection-Filter hat die Freitext-Notiz verworfen. Das UI sagt das dem Kunden — eine stumm geschluckte Notiz wäre schlimmer als ein seltener Fehlalarm.

Fehlerfälle: `400` ungültiger Body, fehlender/unbekannter Projekttyp, keine gültige Aussage, negativer Chip · `404` unbekannter Client · `413` Body > 8 KB · `429` Rate Limit (pro IP oder globaler Tagesdeckel).

---

## Lokale Entwicklung

```bash
npm ci
npm run dev        # Dev-Server (Turbopack)
npm run build      # Production Build
npm run type-check # TypeScript-Check ohne Build
npm run lint       # ESLint (Flat Config, eslint.config.mjs)
```

### Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Deployment

Docker Multi-Stage Build auf Coolify (VPS Aurora, `w-y-t.space`).

**Environment Variables (Coolify):**
- `BUILD_STANDALONE=true`
- `ANTHROPIC_API_KEY=sk-ant-...`

**Domain:** `quality.burghardt.studio`
**App-UUID:** `s40g4owg8oc80wksowwkcsss` (Coolify-Instanz Aurora)
**DNS:** A-Record → `62.169.30.171`
**SSL:** Automatisch via Traefik

> **Kein Auto-Deploy.** Die Git-Source steht auf „Public GitHub" ohne GitHub-App-Integration (`source_id: 0`) — es existiert kein Webhook, der auf Pushes hört. Ein Push nach `main` allein ändert live **nichts**; das wurde am 21.08.2026 verifiziert (Push durch, sechs Minuten später weiterhin die alte Version, `list_deployments` leer).

Deploy manuell auslösen:

```
coolify deploy s40g4owg8oc80wksowwkcsss     # via MCP: mcp__coolify-mcp__deploy
```

Dauer rund 4–5 Minuten (gemessen: 270 s). Danach mit Cache-Buster gegenprüfen, nicht dem Status glauben:

```bash
curl -s "https://quality.burghardt.studio/?cb=$(date +%s)" | grep "Erstell dir in einer halben Minute"
```

Trotzdem auf einem Feature-Branch arbeiten und erst nach grünen Gates mergen — der Rückweg ist `git revert -m 1 <merge-commit>` plus erneuter manueller Deploy.

**Zu „45 unapplied configuration changes" im Coolify-UI:** Kein Handlungsbedarf und kein Update-Bedarf. Coolify v4.1.0 hat Config-Diff-Tracking eingeführt (#10183); der Hinweis zeigt erstmals die Lücke zwischen gespeicherter Config und dem, was beim letzten Deploy davor tatsächlich lief. Ein Deploy wendet sie an.

---

## Kosten

~$0,005 pro Generierung (Claude Sonnet 5, ~700 Input-Token + max. 400 Output). Bei 100 Reviews/Monat unter $1.
