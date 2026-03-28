# Briefing: [PROJEKTNAME]

## 1. Projekt-Meta

- **Kunde:**
- **Domain:**
- **Zielgruppe:**
- **Tonalität:**
- **Deadline:**

---

## 2. Design-System

### Farbpalette

| Name | Hex | CSS Variable | Verwendung |
|------|-----|-------------|------------|
| | #... | --color-bg | Haupthintergrund |
| | #... | --color-bg-elevated | Erhöhte Flächen |
| | #... | --color-bg-dark | Dunkle Sections |
| | #... | --color-text | Primärtext |
| | #... | --color-text-muted | Sekundärtext |
| | #... | --color-text-on-dark | Text auf dunklem Hintergrund |
| | #... | --color-accent | Primärer Akzent / CTA |
| | #... | --color-accent-hover | Hover-State |
| | #... | --color-accent-subtle | Subtiler Akzent |

Zusätzliche Farben (optional):

| Name | Hex | CSS Variable | Verwendung |
|------|-----|-------------|------------|
| | #... | --color-extra-1 | z.B. Gradient-Start |
| | #... | --color-extra-2 | z.B. Gradient-Ende |
| | #... | --color-extra-3 | z.B. Signal/Warning |

### Typografie

| Rolle | Font | Gewichte | CSS Variable | Einsatz |
|-------|------|----------|-------------|---------|
| Headlines | ... | ... | --font-display | H1, H2, Nav |
| Body | ... | 300, 400, 500 | --font-body | Fließtext |
| Brand (optional) | ... | ... | --font-brand | Zitate, besondere Texte |
| Mono (optional) | ... | ... | --font-mono | Code, Labels |

### Gradient (optional)

```css
/* z.B. */
background: linear-gradient(135deg, #... 0%, #... 100%);
```

### Ästhetik

- **Stil:** dark / light / editorial / minimal / luxury
- **Ecken:** sharp (0px) / soft (4px, 8px, 12px)
- **Animationen:** subtil / expressiv
- **Spacing:** kompakt / großzügig

---

## 3. Sitemap

```
/                   Startseite
  Hero
  Leistungen
  Über uns (Kurzversion)
  CTA

/about              Über uns
  ...

/contact            Kontakt
  Formular / Adresse / Map
```

---

## 4. Copy-Texte

### Startseite

**Hero:**
- Headline:
- Subline:
- CTA:

**Leistungen:**
- ...

### Über uns

- ...

### Kontakt

- ...

---

## 5. Komponenten-Plan

| Komponente | Seite(n) | Props/Varianten |
|------------|----------|-----------------|
| Hero | / | ... |
| ServiceCard | / | ... |
| ContactForm | /contact | ... |
| Footer | alle | ... |
| Navigation | alle | ... |

---

## 6. Assets

### Logo-Varianten

| Datei | Pfad | Verwendung |
|-------|------|------------|
| logo.svg | public/images/ | Navbar |
| logo-light.svg | public/images/ | Footer auf dunklem Grund |
| favicon.ico | public/ | Browser-Tab |

### Bilder

| Datei | Pfad | Verwendung |
|-------|------|------------|
| ... | public/images/ | ... |

---

## 7. Metadata

```yaml
title: "Projektname"
description: "Kurze Beschreibung"
url: "https://example.com"
locale: "de_DE"
themeColor: "#FFFFFF"
ogImage: "/images/og-image.jpg"
```

---

## 8. Offene Punkte

- [ ] ...
- [ ] ...
