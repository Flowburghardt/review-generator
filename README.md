# nextjs-coolify-starter

Privates Starter-Template für Next.js 15 Websites mit Coolify-Deployment.

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Docker

---

## Branches

| Branch | Wann benutzen |
|--------|--------------|
| `main` | Standard — sauberer Starter ohne spezifische UI |
| `unicorn` | Mit Unicorn Studio WebGL HeroSection vorinstalliert |

---

## Neues Projekt starten

### Schritt 1 — Klonen

```bash
# Ohne Unicorn Studio
git clone --branch main https://github.com/Flowburghardt/nextjs-coolify-starter.git mein-projekt

# Mit Unicorn Studio WebGL
git clone --branch unicorn https://github.com/Flowburghardt/nextjs-coolify-starter.git mein-projekt

cd mein-projekt
```

### Schritt 2 — Git-History entfernen

```bash
rm -rf .git
git init
git add .
git commit -m "Initial commit"
```

### Schritt 3 — Dependencies installieren

```bash
npm install
```

Das erzeugt die `package-lock.json` — **die muss committed werden** (wichtig für Docker):

```bash
git add package-lock.json
git commit -m "Add package-lock.json"
```

### Schritt 4 — GitHub Repo anlegen und pushen

Neues (privates) Repo auf GitHub anlegen, dann:

```bash
git remote add origin https://github.com/Flowburghardt/<PROJEKTNAME>.git
git push -u origin main
```

### Schritt 5 — Coolify Deployment einrichten

1. Coolify → Neues Projekt → GitHub verbinden → Repo auswählen
2. Branch: `main`
3. Build Pack: **Dockerfile**
4. Environment Variable hinzufügen: `BUILD_STANDALONE=true`
5. Domain + SSL konfigurieren
6. Deployen

---

## Was nach dem Klonen anpassen

| Datei | Was ändern |
|-------|-----------|
| `package.json` | `name` → Projektname |
| `src/app/layout.tsx` | `title`, `description`, `openGraph.url`, `lang`, `themeColor` |
| `src/app/robots.ts` | `sitemap` URL auf echte Domain |
| `src/app/sitemap.ts` | `BASE_URL` auf echte Domain |
| `src/app/globals.css` | Farben in `:root` projektspezifisch anpassen |

**Nur bei `unicorn`-Branch zusätzlich:**

| Datei | Was ändern |
|-------|-----------|
| `src/components/HeroSection.tsx` | `UNICORN_PROJECT_ID`, E-Mail, Markenname |
| `UnicornScene production` | `false` → `true` vor Live-Schaltung |

---

## Lokale Entwicklung

```bash
npm run dev        # Dev-Server (Turbopack) — oft auf Port 3001 wenn 3000 belegt
npm run build      # Production Build testen
npm run type-check # TypeScript-Fehler prüfen ohne Build
npm run lint       # ESLint
```

---

## Design System anpassen

Das Theme lebt komplett in `src/app/globals.css`. Tailwind v4 braucht kein `tailwind.config.js` mehr.

```css
:root {
  --color-bg: #080808;       /* Hintergrund — hier anpassen */
  --color-accent: #c8a98a;   /* Akzentfarbe — hier anpassen */
  /* ... */
}
```

Danach sofort als Tailwind-Klasse nutzbar: `bg-bg`, `text-accent`, `border-accent-light` etc.

---

## Bekannte Fallstricke

**`package-lock.json` vergessen zu committen**
→ Docker-Build schlägt mit `npm ci`-Fehler fehl. Nach jedem `npm install` committen.

**`public/` Ordner fehlt**
→ Bereits mit `.gitkeep` enthalten. Nicht löschen.

**Font-Variable zirkulär referenziert**
→ In `@theme inline` niemals `--font-display: var(--font-display)` schreiben. Stattdessen den Font-Stack direkt angeben: `--font-display: var(--font-playfair), "Playfair Display", serif`.

**Dev-Server auf Port 3000 nicht erreichbar**
→ Next.js wechselt automatisch auf 3001 wenn 3000 belegt ist.
