/**
 * Startpruefung der Pflicht-Umgebungsvariablen dieses Repos.
 *
 * WARUM NICHT AUF MODULEBENE / NICHT BEIM BAU:
 * Das Dockerfile dieses Repos fuehrt `RUN npm run build` aus, ohne vorher eine
 * App-Variable zu setzen; Next.js rendert dabei Seiten vor. Eine Pruefung, die
 * schon beim Import einer Seite oder Route laeuft, wuerde deshalb jeden
 * Docker-Bau zerreissen. Darum zwei Schutzlagen:
 *   1. `assertEnv()` ist eine Funktion und wird hier NICHT selbst aufgerufen.
 *      Aufrufort ist der Laufzeit-Pfad, also der Rumpf eines Route-Handlers
 *      (erster Aufruf), nie der Import-Pfad einer Seite.
 *   2. Zusaetzlich springt die Pruefung ab, wenn `process.env.NEXT_PHASE` auf
 *      eine Bau-Phase zeigt (`phase-production-build`, `phase-production-server`
 *      ausgenommen). Damit bleibt der Bau auch dann gruen, wenn jemand die
 *      Funktion spaeter versehentlich im Import-Pfad aufruft.
 *
 * Die Liste ist aus dem Code dieses Repos erhoben, nicht geraten. Fundstellen
 * stehen je Variable daneben. Variablen mit brauchbarem Vorgabewert stehen
 * bewusst NICHT drin (siehe "optional" am Ende).
 */

/*
 * Sonderfall, belegt statt geraten: Dieses Repo hat KEINEN eigenen
 * `process.env`-Zugriff in src/. Den Schluessel liest das SDK selbst —
 * node_modules/@anthropic-ai/sdk/client.js:50: `readEnv('ANTHROPIC_API_KEY')`.
 * Fehlt er, wirft der erste Aufruf von /api/generate "Could not resolve
 * authentication method". Die reine `process.env`-Suche haette hier eine leere
 * Liste ergeben — die Variable ist trotzdem Pflicht.
 */

/** Pflicht-Variablen dieses Repos, je mit Fundstelle im Code. */
export const PFLICHT_ENV = [
  "ANTHROPIC_API_KEY", // implizit gelesen von `new Anthropic()` in src/app/api/generate/route.ts:7 ueber @anthropic-ai/sdk (client.js:50)
] as const;

export type PflichtEnvName = (typeof PFLICHT_ENV)[number];

/** Bau-Phasen von Next.js. In diesen laeuft die Pruefung nicht. */
const BAU_PHASEN = new Set(["phase-production-build", "phase-export"]);

let bereitsGeprueft = false;

/**
 * Prueft alle Pflicht-Variablen auf einmal und sammelt ALLE fehlenden Namen,
 * statt beim ersten Treffer abzubrechen. Aufruf gehoert in den Rumpf eines
 * Route-Handlers (Laufzeit), nicht auf Modulebene einer Seite.
 */
export function assertEnv(): void {
  if (bereitsGeprueft) return;
  if (BAU_PHASEN.has(process.env.NEXT_PHASE ?? "")) return;

  const fehlend: string[] = [];
  for (const name of PFLICHT_ENV) {
    const wert = process.env[name];
    if (wert === undefined || wert.trim() === "") fehlend.push(name);
  }

  if (fehlend.length > 0) {
    throw new Error(
      `env unvollstaendig: ${fehlend.length} Pflicht-Variable(n) fehlen oder sind leer: ` +
        `${fehlend.join(", ")}. Setzen und den Dienst neu starten.`,
    );
  }

  bereitsGeprueft = true;
}

/** Gibt die fehlenden Namen zurueck, ohne zu werfen (fuer Health-Endpunkte). */
export function fehlendeEnv(): string[] {
  return PFLICHT_ENV.filter((name) => {
    const wert = process.env[name];
    return wert === undefined || wert.trim() === "";
  });
}

/*
 * Bewusst NICHT Pflicht:
 *   BUILD_STANDALONE  next.config.ts:4 — reine Bau-Schaltung
 */
