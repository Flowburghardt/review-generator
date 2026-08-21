import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getClientConfig } from "@/config";
import { isRateLimited, isGloballyRateLimited } from "@/lib/rate-limit";
import type { GenerateRequest } from "@/config/types";

const anthropic = new Anthropic();

const STYLE_SEEDS = ["casual", "sachlich", "enthusiastisch"] as const;

const MAX_NOTE_CHARS = 600;
/** Grosszuegig fuer den echten Flow (~1 KB), aber kein offenes Scheunentor. */
const MAX_BODY_BYTES = 8 * 1024;

/** Wie oft ein Text absichtlich eine kleine Unsauberkeit bekommt. */
const IMPERFECTION_RATE = 0.6;

interface ToneSpec {
  instruction: string;
  length: string;
  maxTokens: number;
  /** Bei gebundenen Formen wuerde ein absichtlicher Fehler wie ein Patzer wirken. */
  allowsImperfection: boolean;
}

const TONES: Record<string, ToneSpec> = {
  normal: {
    instruction:
      "TONALITÄT: Locker und normal, wie man einem Bekannten davon erzählt. EMOJIS: höchstens eines, am Ende, und nur wenn es sich natürlich anfühlt.",
    length: "3-5 Sätze.",
    maxTokens: 400,
    allowsImperfection: true,
  },
  serious: {
    instruction:
      "TONALITÄT: Sachlich und geschäftlich. Wie ein zufriedener Geschäftskunde, der sich kurz fasst. Kein Slang, keine Emojis.",
    length: "2-4 Sätze.",
    maxTokens: 350,
    allowsImperfection: true,
  },
  kurz: {
    instruction:
      "TONALITÄT: Sehr knapp. Jemand, der nicht viel schreibt, aber das Wichtigste sagt. Keine Emojis.",
    length: "1-2 Sätze. Wirklich kurz.",
    maxTokens: 200,
    allowsImperfection: true,
  },
  "wie-vorher": {
    instruction:
      "TONALITÄT: Beginne bei der Ausgangslage VOR der Zusammenarbeit — was gefehlt hat, was das Problem war, wie es vorher aussah. Dann erst, was daraus geworden ist. Der Kontrast trägt den Text. Keine Adjektiv-Aufzählung, keine Zusammenfassung am Ende.",
    length: "3-5 Sätze.",
    maxTokens: 400,
    allowsImperfection: true,
  },
  poem: {
    instruction:
      'TONALITÄT: Schreibe die Bewertung als kurzes GEREIMTES Gedicht. JEDE Zeile muss sich mit einer anderen reimen — AABB oder ABAB. Prüfe jeden Reim: Reimt sich "gut" auf "Mut"? Ja. Reimt sich "gut" auf "top"? Nein. Wenn es sich nicht reimt, schreib die Zeile um. Kreativ, nicht kitschig.',
    length: "4-8 Zeilen.",
    maxTokens: 500,
    allowsImperfection: false,
  },
};

const DEFAULT_TONE = "normal";

/**
 * `x-forwarded-for` ist client-setzbar, und Traefik HÄNGT die echte IP hinten
 * AN, statt den Header zu ersetzen. Nimmt man den Header roh als Schlüssel,
 * erzeugt jeder Request einen neuen Bucket und das Limit greift nie.
 */
function clientIp(request: NextRequest): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }

  return "unknown";
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);

  // Body-Limit VOR dem Parsen — sonst liest man erst 1 MB ein und lehnt danach ab.
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Anfrage zu groß.", retryable: false },
      { status: 413 }
    );
  }

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte warte einen Moment.", retryable: false },
      { status: 429 }
    );
  }
  // Der globale Tagesdeckel wird bewusst ERST unmittelbar vor dem Claude-Call
  // gezogen (weiter unten). Zöge man ihn hier, könnten 300 billige
  // 400er-Requests ohne einen einzigen API-Aufruf das Tagesbudget aufbrauchen
  // und echte Kunden 24 h aussperren — ein Selbst-DoS.

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Anfrage zu groß.", retryable: false },
      { status: 413 }
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Ungültige Anfrage.", retryable: false },
      { status: 400 }
    );
  }

  // TypeScript prüft zur Laufzeit nichts: `null` ist valides JSON, und ein
  // String hat ebenfalls `.includes` — "websitebranding" hätte sonst zwei
  // Projekttypen auf einmal freigeschaltet. Ohne diese Guards enden solche
  // Anfragen als 500 statt als sauberer 400.
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return NextResponse.json(
      { error: "Ungültige Anfrage.", retryable: false },
      { status: 400 }
    );
  }

  const body = parsed as Partial<GenerateRequest>;

  if (
    typeof body.clientSlug !== "string" ||
    !Array.isArray(body.projectTypes) ||
    !Array.isArray(body.selectedFacts)
  ) {
    return NextResponse.json(
      { error: "Ungültige Anfrage.", retryable: false },
      { status: 400 }
    );
  }

  const requestedTypes = body.projectTypes.filter(
    (t): t is string => typeof t === "string"
  );
  const requestedFacts = body.selectedFacts.filter(
    (f): f is string => typeof f === "string"
  );

  const config = getClientConfig(body.clientSlug);
  if (!config) {
    return NextResponse.json(
      { error: "Unbekannter Client.", retryable: false },
      { status: 404 }
    );
  }

  // Projekttypen gegen die Config validieren, NICHT gegen eine Liste im Code.
  // Vorher stand die Liste hart in dieser Datei und war um "beratung" veraltet —
  // die Auswahl verschwand dadurch lautlos aus dem Prompt.
  const selectedTypes = config.projectTypes.filter((t) =>
    requestedTypes.includes(t.id)
  );

  if (selectedTypes.length === 0) {
    return NextResponse.json(
      { error: "Bitte wähle aus, worum es ging.", retryable: false },
      { status: 400 }
    );
  }

  // Notausgang: Negatives gehört zum Feedback-Screen, nicht in eine Google-Bewertung.
  // Der Client ruft hier gar nicht erst auf — das ist die zweite Absicherung.
  const negativeSelected = requestedFacts.filter((f) =>
    config.negativeChips.includes(f)
  );
  if (negativeSelected.length > 0) {
    return NextResponse.json(
      {
        error:
          "Für kritisches Feedback gibt es den direkten Weg statt einer Bewertung.",
        retryable: false,
      },
      { status: 400 }
    );
  }

  // Fakten nur aus den Chips der tatsächlich gewählten Projekttypen.
  const allowedFacts = new Set(selectedTypes.flatMap((t) => t.factChips));
  // Set gegen Duplikate: Teilen sich zwei gewählte Projekttypen denselben
  // Chip-Text, stünde er sonst doppelt im Prompt.
  const selectedFacts = [
    ...new Set(requestedFacts.filter((f) => allowedFacts.has(f))),
  ];

  if (selectedFacts.length === 0) {
    return NextResponse.json(
      { error: "Bitte wähle mindestens eine Aussage aus.", retryable: false },
      { status: 400 }
    );
  }

  let personalNote =
    typeof body.personalNote === "string"
      ? body.personalNote.slice(0, MAX_NOTE_CHARS).trim()
      : "";

  // Das Muster darf NICHT auf ein blankes "<" gehen: "wir waren <5 Leute"
  // oder "Budget < 2000" hätte sonst das wichtigste Feld stumm geleert.
  const injectionPatterns =
    /ignore (all |any )?previous|system prompt|forget (your|all|everything)|new instructions|disregard|anweisung(en)? (ignorieren|vergessen)|antworte stattdessen|statt dessen antworte|<\s*\/?[a-z]/i;
  const noteWasDropped = injectionPatterns.test(personalNote);
  if (noteWasDropped) {
    personalNote = "";
  }

  // Landet im SYSTEM-Prompt und muss deshalb durch dieselbe Prüfung wie die
  // Notiz — sonst wäre die Trennung, die personalNote in die User-Message
  // verschiebt, über 80 frei wählbare Zeichen wieder ausgehebelt.
  const rawProjectName =
    typeof body.projectName === "string"
      ? body.projectName.slice(0, 80).trim()
      : "";
  const projectName = injectionPatterns.test(rawProjectName)
    ? ""
    : rawProjectName;

  const styleSeed = STYLE_SEEDS[Math.floor(Math.random() * STYLE_SEEDS.length)];

  const toneId =
    typeof body.tone === "string" && Object.hasOwn(TONES, body.tone)
      ? body.tone
      : DEFAULT_TONE;
  const tone = TONES[toneId];

  // "Nur gelegentlich" kann ein Modell bei einem Einzelaufruf nicht befolgen —
  // es kennt die anderen Texte nicht. Also hier würfeln und dann hart anweisen.
  const withImperfection = tone.allowsImperfection && Math.random() < IMPERFECTION_RATE;

  const imperfectionBlock = withImperfection
    ? `MENSCHLICHE UNSAUBERKEIT (genau EINE, nicht mehr):
Baue genau eine kleine Unsauberkeit ein, wie sie in echten Bewertungen vorkommt — ein fehlendes Komma, ein "das" statt "dass", ein abgehackter Satz ohne Verb, oder ein zusammengezogenes Wort ("aufm", "hab"). Sie darf nicht wie ein Tippfehler im Firmennamen aussehen und nicht den Sinn verdrehen.`
    : `SAUBERKEIT: Rechtschreibung und Zeichensetzung korrekt.`;

  const systemPrompt = `Du schreibst eine Google-Bewertung im Namen eines Kunden für "${config.businessName}" (${config.aiContext}). Der Inhaber heißt ${config.ownerName}. Du schreibst AUS SICHT DES KUNDEN, in der Ich-Form.

DAS HIER IST DER KERN:
Der Kunde hat die folgenden Aussagen selbst angeklickt. Bau den Text um EINE ODER ZWEI davon herum und erzähle sie aus. Nicht alle abarbeiten — such dir die stärkste aus und mach sie konkret.
${selectedFacts.map((f) => `- ${f}`).join("\n")}

Erfinde NICHTS dazu: keine Zahlen, keine Orte, keine Namen, keine Details, die oben nicht stehen. Was der Kunde nicht angeklickt hat, ist nicht passiert.

STIL: ${styleSeed}
${tone.instruction}
LÄNGE: ${tone.length}

${imperfectionBlock}

VERBOTEN:
- KI-Floskeln: "Ich möchte betonen", "Absolut empfehlenswert!", "Ich kann nur empfehlen", "Was mich besonders begeistert hat"
- Abschluss-Floskeln: "Gerne wieder!", "Jederzeit wieder!", "Kann ich nur weiterempfehlen!"
- Leere Bewertungsfloskeln: "das Preis-Leistungs-Verhältnis stimmt", "ohne unnötige Umschweife", "die Kommunikation war unkompliziert", "professionell und zuverlässig"
- Adjektiv-Ketten als Ersatz für Inhalt: "kreativ, zuverlässig und schnell"
- Superlativ-Ketten: "beste, tollste, großartigste"
- Werbe-Sprech: "in den Bann ziehen", "überzeugt auf ganzer Linie"
- Gewollt jugendlich: "mega", "geilo", "richtig krass"
- Aufzählungen oder Bullet Points

SO KLINGT ES ECHT:
- Konkret statt abstrakt: "Das Logo sitzt" statt "Die Design-Qualität war hervorragend"
- Eine Sache, die man sich nicht ausdenkt, schlägt fünf Eigenschaftswörter
- Ruhig ein Detail nennen, das gegen den eigenen Vorteil spricht ("hätte ich selbst nie hinbekommen")
${projectName ? `\nPROJEKT: "${projectName}" — darf im Text vorkommen.\n` : ""}
Schreibe NUR den Bewertungstext. Keine Einleitung, keine Erklärung, kein "Hier ist die Bewertung:".`;

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: personalNote
        ? `Der Kunde hat zusätzlich selbst geschrieben: "${personalNote}"\n\nDas ist die wichtigste Quelle — was hier steht, gehört in den Text. Schreibe jetzt die Bewertung.`
        : "Schreibe jetzt die Bewertung.",
    },
  ];

  // Erst hier: Ab dieser Zeile kostet die Anfrage echtes Geld. Alles davor
  // wurde ohne API-Aufruf abgewiesen und darf das Tagesbudget nicht belasten.
  if (isGloballyRateLimited()) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuche es später erneut.", retryable: true },
      { status: 429 }
    );
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: tone.maxTokens,
      system: systemPrompt,
      messages,
    });

    const reviewText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!reviewText) {
      return NextResponse.json(
        { error: "Generierung fehlgeschlagen. Bitte versuche es erneut.", retryable: true },
        { status: 500 }
      );
    }

    // `noteDropped` sagt dem Client, dass die Notiz verworfen wurde. Sie
    // stumm zu schlucken wäre schlimmer als der seltene Fehlalarm — es ist
    // das Feld, das den Text überhaupt unverwechselbar macht.
    return NextResponse.json({ reviewText, noteDropped: noteWasDropped });
  } catch (error) {
    if (error instanceof Anthropic.APIError && error.status === 429) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte warte einen Moment.", retryable: true },
        { status: 429 }
      );
    }

    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Generierung fehlgeschlagen. Bitte versuche es erneut.", retryable: true },
      { status: 500 }
    );
  }
}
