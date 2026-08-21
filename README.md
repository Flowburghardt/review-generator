# Review Generator — quality.burghardt.studio

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
**DNS:** A-Record → `62.169.30.171`
**SSL:** Automatisch via Traefik
**Auto-Deploy:** Push auf `main` — also auf einem Feature-Branch arbeiten und erst nach grüner lokaler Prüfung mergen. Rückweg: `git revert <merge-commit>` + Push.

---

## Kosten

~$0,005 pro Generierung (Claude Sonnet 5, ~700 Input-Token + max. 400 Output). Bei 100 Reviews/Monat unter $1.
