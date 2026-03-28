# Review Generator — quality.burghardt.studio

KI-gestützte Google-Review-Generierung. Kunden bewerten per Sterne + Tags, die KI generiert einen natürlich klingenden Review-Text zum Kopieren und werden direkt zu Google Reviews weitergeleitet.

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Anthropic SDK (Claude Haiku 4.5)

**Live:** https://quality.burghardt.studio

---

## Features

- **6 Tonalitäten:** Normal, Seriös, Gedicht, Songtext, Gen Z, Haiku
- **Multi-Select Projekttypen:** Website, Branding, Marketing, Fotografie, KI-Workflow
- **Optionaler Projektname** — wird im generierten Text erwähnt
- **Intelligentes Routing:** < 3 Sterne Durchschnitt → Feedback-Screen (kein Google-Redirect)
- **Copy-to-Clipboard** mit Textarea-Fallback
- **Rate Limiting:** 10 Generierungen pro IP pro Stunde
- **Prompt Injection Schutz**
- **Menschliche Imperfektionen** im generierten Text
- **DSGVO-konform:** Keine Cookies, kein Tracking, keine Datenspeicherung

---

## Multi-Tenant

Ein JSON-File pro Kunde in `src/config/clients/`. Root-URL (`/`) = burghardt.studio, andere Kunden über Slug (`/lagerboxxen`, `/zucker-und-zimt`).

### Neuen Kunden hinzufügen

**1. JSON-Config erstellen** — `src/config/clients/[slug].json`:

```json
{
  "slug": "kundenname",
  "businessName": "Kundenname GmbH",
  "ownerName": "Max",
  "welcomeText": "Danke, dass du dir einen Moment nimmst!",
  "googleReviewUrl": "https://g.page/r/XXXXX/review",
  "branding": {
    "accentColor": "#c8a98a",
    "accentColorLight": "#d4b89a",
    "bgColor": "#0a0a0a",
    "textColor": "#f0ede8",
    "logoUrl": "/logos/kundenname.svg"
  },
  "categories": [
    { "id": "quality", "label": "Qualität" },
    { "id": "service", "label": "Service" },
    { "id": "value", "label": "Preis-Leistung" }
  ],
  "moodTags": [
    { "label": "freundlich", "sentiment": "positive" },
    { "label": "schnell", "sentiment": "positive" },
    { "label": "solide", "sentiment": "neutral" },
    { "label": "enttäuschend", "sentiment": "negative" }
  ],
  "aiContext": "Beschreibung des Unternehmens für den KI-Prompt",
  "feedbackEmail": "info@kundenname.de"
}
```

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

---

## Personalisierbare Elemente pro Kunde

| Element | Config-Feld | Beispiel |
|---------|-------------|---------|
| Firmenname | `businessName` | "Lagerboxxen Erfurt" |
| Inhabername | `ownerName` | "Andreas" (im Review-Text) |
| Begrüßungstext | `welcomeText` | Persönliche Ansprache |
| Google Review Link | `googleReviewUrl` | `https://g.page/r/XXXXX/review` |
| Akzentfarbe | `branding.accentColor` | Kundenfarbe |
| Logo | `branding.logoUrl` | SVG in `/public/logos/` |
| Kategorien | `categories` | Branchenspezifisch |
| Stimmungs-Tags | `moodTags` | Branchenspezifische Adjektive |
| KI-Kontext | `aiContext` | Branchenbeschreibung |
| Feedback-Email | `feedbackEmail` | Bei < 3 Sterne |

---

## Lokale Entwicklung

```bash
npm run dev        # Dev-Server (Turbopack)
npm run build      # Production Build
npm run type-check # TypeScript-Check
npm run lint       # ESLint
```

### Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Deployment

Docker Multi-Stage Build auf Coolify (VPS w-y-t.space).

**Environment Variables (Coolify):**
- `BUILD_STANDALONE=true`
- `ANTHROPIC_API_KEY=sk-ant-...`

**Domain:** `quality.burghardt.studio`
**DNS:** A-Record → `62.169.30.171`
**SSL:** Automatisch via Traefik
**Auto-Deploy:** Push auf `main`

---

## User Flow

```
1. Kunde erhält Link (WhatsApp, E-Mail, QR-Code)
2. Willkommens-Screen mit Logo + Begrüßung
3. Kategorien bewerten (Sterne 1-5) + Projekttyp(en) wählen
4. Stimmungs-Tags + optionaler Freitext + Tonalität wählen
5. Routing: >= 3 Sterne → Review generieren | < 3 → Feedback-Screen
6. Text kopieren → Weiter zu Google Reviews
```

---

## API

```
POST /api/generate
Content-Type: application/json

{
  "clientSlug": "burghardt-studio",
  "ratings": { "communication": 5, "design-quality": 5, ... },
  "selectedTags": ["kreativ", "zuverlässig"],
  "personalNote": "Das Logo ist super!",
  "tone": "normal",
  "projectTypes": ["website", "branding"],
  "projectName": "Autohaus Paulmann"
}

→ { "reviewText": "...", "overallStars": 5 }
```

---

## Kosten

~$0.001 pro Generierung (Claude Haiku 4.5). Geschätzt < $1/Monat bei 100 Reviews.
