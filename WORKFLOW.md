# Projekt-Workflow

## Schritt 1: Briefing erstellen

`BRIEFING-TEMPLATE.md` kopieren → `BRIEFING.md`
Ausfüllen: Design-System, Sitemap, Copy-Texte, Komponenten, Assets, Metadata.

---

## Schritt 2: Design-System implementieren

Prompt:
```
"Lies BRIEFING.md und setze das Design-System um (globals.css + layout.tsx)."
```

Claude schreibt:
- **globals.css** — CSS-Variablen in `:root` + `@theme inline`
- **layout.tsx** — Google Fonts, Metadata, themeColor, viewport

Danach verfügbar: `bg-bg`, `text-accent`, `font-display` etc.

---

## Schritt 3: Seitenstruktur + Komponenten

Prompt:
```
"Lege die Seitenstruktur aus dem Briefing an und baue die Komponenten."
```

Optionale Inputs:
- Screenshots von Referenz-Websites
- Figma-Exports
- Pencil .pen Dateien (Pencil MCP kann diese direkt lesen)
- Reine Text-Beschreibungen

---

## Schritt 4: Inhalte + Polish

Copy-Texte einsetzen, Animationen, Responsive, Assets einbinden.

---

## Schritt 5: Deploy

```bash
git push origin main
```

Coolify deployt automatisch via Auto-Deploy on Push.

### Coolify — Checkliste vor Deployment

- [ ] `package-lock.json` committed
- [ ] `public/` Ordner existiert (`.gitkeep` reicht)
- [ ] `.dockerignore` vorhanden
- [ ] `BUILD_STANDALONE=true` in Coolify Environment Variables gesetzt
