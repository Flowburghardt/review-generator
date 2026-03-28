# CLAUDE.md — Review Generator

## Commands

```bash
npm run dev        # Dev-Server mit Turbopack
npm run build      # Production Build
npm run lint       # ESLint
npm run type-check # TypeScript-Check ohne Build
```

## Architektur

**Stack:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion + Anthropic SDK

**Zweck:** KI-gestützte Google-Review-Generierung. Kunden bewerten Kategorien (Sterne 1-5), wählen Stimmungs-Tags und erhalten einen natürlich klingenden Review-Text zum Kopieren.

### Multi-Tenant

- Ein JSON-File pro Kunde in `src/config/clients/`
- Root-URL (`/`) = burghardt.studio (Default)
- Andere Kunden: `/kontor`, `/anne-liebetrau` etc.
- Neuen Kunden hinzufügen = 1 JSON-File + Config-Import in `src/config/index.ts`

### User Flow

1. Willkommen + Kategorien bewerten (Sterne 1-5)
2. Stimmungs-Tags + optionaler Freitext
3. Routing: >= 3 Sterne Durchschnitt → Review generieren | < 3 → Feedback-Screen

### Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `src/config/clients/*.json` | Client-Configs (Branding, Kategorien, Tags) |
| `src/config/types.ts` | TypeScript Interfaces |
| `src/config/index.ts` | Config-Loader |
| `src/components/ReviewFlow.tsx` | State-Hub, orchestriert alle Steps |
| `src/app/api/generate/route.ts` | Claude API + Rate Limiting |
| `src/lib/rate-limit.ts` | In-memory Rate Limiter |

### API

```
POST /api/generate
Body: { clientSlug, ratings, selectedTags, personalNote? }
Response: { reviewText, overallStars }
```

### Sicherheit

- Rate Limit: 10 Generierungen/IP/Stunde
- Regenerieren: Max 3x pro Session (Client-Side)
- personalNote als User-Message (nicht System-Prompt)
- Regex-Filter gegen Prompt Injection
- Tags gegen Whitelist aus Config validiert

## Tailwind v4

Design Tokens in `globals.css` via `:root` + `@theme inline`. Keine `tailwind.config.js`.

Fonts: Playfair Display (Display) + Inter (Body) via `next/font/google`.

## Deployment

Docker Multi-Stage Build. Coolify auf `quality.burghardt.studio`.

- `BUILD_STANDALONE=true` als Environment Variable
- `ANTHROPIC_API_KEY` als Secret
