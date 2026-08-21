# CLAUDE.md — Review Generator

## Commands

```bash
npm ci             # Erstinstallation (node_modules ist nicht eingecheckt)
npm run dev        # Dev-Server mit Turbopack
npm run build      # Production Build
npm run lint       # ESLint (Flat Config in eslint.config.mjs)
npm run type-check # TypeScript-Check ohne Build
```

## Architektur

**Stack:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion + Anthropic SDK (Claude Sonnet 5)

**Zweck:** Hilft Kunden beim Schreiben einer Google-Bewertung. Der Kunde klickt an, was tatsächlich passiert ist; daraus entsteht ein Text zum Kopieren.

### Die eine Regel, an der alles hängt

**Chips tragen Aussagen, keine Eigenschaften.** „Seite war schnell online" ✅ — „zuverlässig" ❌. Wer Adjektive in den Prompt gibt, bekommt Adjektiv-Texte zurück; genau daran ist die Sterne-und-Mood-Tags-Version gescheitert. Das gilt für jede neue Kunden-Config gleichermaßen.

Zwei Folgeregeln daraus:
- Der Prompt baut den Text um **1–2** Aussagen herum, statt alle abzuarbeiten.
- Das Freitextfeld ist die stärkste Quelle und deshalb prominent — nicht als Nachgedanke behandeln.

### Multi-Tenant

- Ein JSON-File pro Kunde in `src/config/clients/`
- Root-URL (`/`) = `burghardt-studio` (Default)
- **Aktuell ist ausschließlich `burghardt-studio` registriert**; jeder andere Slug liefert 404
- Neuen Kunden hinzufügen = 1 JSON-File + Import in `src/config/index.ts` (Details im README)

> **Projekttypen NIE zusätzlich im Code listen.** Die API leitet ihre Whitelist aus `config.projectTypes` ab. Vorher stand die Liste doppelt (Komponente + Route) und lief auseinander: „Beratung" war klickbar und wurde serverseitig still verworfen.

### User Flow

```
Intro (was passiert hier) → Projekttypen + Fakten-Chips → Freitext + Stil → Text + Google-Link
```

Negativer Chip an beliebiger Stelle → Feedback-Screen statt Google-Link. Der Notausgang liegt bewusst **außerhalb** der projekttypabhängigen Aufklappung, damit er ohne Vorauswahl sichtbar ist. Die API lehnt negative Chips zusätzlich mit 400 ab.

### Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `src/config/clients/*.json` | Client-Configs (Branding, Projekttypen, Fakten-Chips) |
| `src/config/types.ts` | TypeScript Interfaces |
| `src/config/index.ts` | Config-Loader + Client-Registry |
| `src/components/ReviewFlow.tsx` | State-Hub, orchestriert alle Steps |
| `src/components/FactChips.tsx` | Aussagen-Auswahl inkl. Notausgang |
| `src/app/api/generate/route.ts` | Prompt, Validierung, Claude API |
| `src/lib/rate-limit.ts` | Per-IP-Limit + globaler Tagesdeckel |

### API

```
POST /api/generate
Body: { clientSlug, projectTypes[], selectedFacts[], personalNote?, tone?, projectName? }
Response: { reviewText }
```

### Sicherheit

- Rate Limit: 10 Generierungen/IP/Stunde (mit Cleanup) + globaler Tagesdeckel
- Body-Limit 8 KB, geprüft vor dem Parsen
- Regenerieren: max. 3× pro Session (Client-Side)
- `personalNote` als User-Message (nicht im System-Prompt), max. 600 Zeichen, Regex-Filter gegen Injection
- Chips + Projekttypen gegen die Client-Config validiert

> Die Chip-Whitelist ist **kein** Sicherheitsmerkmal: Projekttyp und Chips kommen aus demselben Request-Body, ein manipulierter Aufruf wählt sich den passenden Typ selbst. Die Folge bleibt auf den Prompt-Inhalt begrenzt.

## Tailwind v4

Design Tokens in `globals.css` via `:root` + `@theme inline`. Keine `tailwind.config.js`.
Verfügbar u.a.: `bg`, `bg-elevated`, `bg-card`, `text`, `text-muted`, `text-subtle`, `accent`, `accent-light`, `accent-dark`, `success`, `tag-positive/neutral/negative`.
**`accent-subtle` existiert nicht** — obwohl es im Bestand vereinzelt verwendet wurde.

Fonts: Cera PRO (Display, lokal) + Inter (Body).

## Deployment

Docker Multi-Stage Build. Coolify auf `quality.burghardt.studio` (Aurora, 62.169.30.171).

- `BUILD_STANDALONE=true` als Environment Variable
- `ANTHROPIC_API_KEY` als Secret
- **Auto-Deploy on Push auf `main`** → auf Feature-Branch arbeiten, erst nach grünen Gates mergen. Rückweg: `git revert <merge-commit>` + Push
