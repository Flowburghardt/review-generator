import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getClientConfig } from "@/config";
import { isRateLimited } from "@/lib/rate-limit";
import type { GenerateRequest } from "@/config/types";

const anthropic = new Anthropic();

const STYLE_SEEDS = ["casual", "sachlich", "enthusiastisch"] as const;

const TONE_INSTRUCTIONS: Record<string, string> = {
  normal: `EMOJIS: Setze 1-2 passende Emojis ein — am Satzende oder als Abschluss. Nicht übertreiben. Beispiele: 👍 🙌 ✌️ 💯 😊`,
  serious: `TONALITÄT: Seriös und professionell. Schreibe wie ein zufriedener Geschäftskunde, der eine sachliche aber positive Bewertung hinterlässt. Kein Slang, keine Umgangssprache.`,
  poem: `TONALITÄT: Schreibe die Bewertung als kurzes GEREIMTES Gedicht (4-8 Zeilen). JEDE Zeile muss sich mit einer anderen reimen — AABB oder ABAB Schema. Prüfe jeden Reim: Reimt sich "gut" auf "Mut"? Ja. Reimt sich "gut" auf "top"? Nein. Wenn es sich nicht reimt, schreib die Zeile um. Kreativ und witzig, nicht kitschig.`,
  song: `TONALITÄT: Schreibe die Bewertung wie einen kurzen Songtext/Refrain (4-8 Zeilen). Mit Rhythmus und Wiederholungen. Darf auch Zeilen haben die sich reimen, muss aber nicht. Denk an eingängige Hooks.`,
  "gen-z": `TONALITÄT: Schreibe im Gen-Z Stil. Nutze Ausdrücke wie "no cap", "fr fr", "slay", "lowkey", "hits different", "based", "living rent-free in my head". Kurze Sätze. Casual. Aber trotzdem muss klar werden was gut war. EMOJIS: 2-4 Emojis einstreuen — 🔥 💅 ✨ 😭 💀 🫶 passend zum Vibe.`,
  haiku: `TONALITÄT: Schreibe die Bewertung als Haiku (5-7-5 Silben). Exakt 3 Zeilen. Erste Zeile 5 Silben, zweite 7, dritte 5. Zähle die Silben sorgfältig. Poetisch und verdichtet. EMOJIS: Genau 1 passendes Emoji am Ende (🌸 ✨ 🎯 🖤).`,
};

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte warte einen Moment.", retryable: false },
      { status: 429 }
    );
  }

  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungültige Anfrage.", retryable: false },
      { status: 400 }
    );
  }

  const config = getClientConfig(body.clientSlug);
  if (!config) {
    return NextResponse.json(
      { error: "Unbekannter Client.", retryable: false },
      { status: 404 }
    );
  }

  // Validate ratings
  const validCategoryIds = config.categories.map((c) => c.id);
  for (const [key, value] of Object.entries(body.ratings)) {
    if (!validCategoryIds.includes(key)) {
      return NextResponse.json(
        { error: "Ungültige Kategorie.", retryable: false },
        { status: 400 }
      );
    }
    if (typeof value !== "number" || value < 1 || value > 5) {
      body.ratings[key] = Math.max(1, Math.min(5, Math.round(value)));
    }
  }

  // Validate tags against whitelist
  const validTags = config.moodTags.map((t) => t.label);
  const sanitizedTags = (body.selectedTags || []).filter((t) => validTags.includes(t));

  // Sanitize personalNote
  let personalNote = (body.personalNote || "").slice(0, 200).trim();
  // Basic injection protection
  const injectionPatterns = /ignore previous|system prompt|forget your|du bist jetzt|new instructions|disregard/i;
  if (injectionPatterns.test(personalNote)) {
    personalNote = "";
  }

  // Calculate overall stars
  const ratingValues = Object.values(body.ratings);
  const average = ratingValues.reduce((sum, v) => sum + v, 0) / ratingValues.length;
  const overallStars = Math.round(average);

  // Project context
  const validProjectTypes = ["website", "branding", "marketing", "fotografie", "ki-workflow"];
  const projectTypes = (body.projectTypes || []).filter((t: string) => validProjectTypes.includes(t));
  const projectName = (body.projectName || "").slice(0, 80).trim();

  // Build rating description
  const ratingDescription = config.categories
    .map((cat) => `${cat.label}: ${body.ratings[cat.id] || 0}/5`)
    .join(", ");

  // Random style seed for variation
  const styleSeed = STYLE_SEEDS[Math.floor(Math.random() * STYLE_SEEDS.length)];

  // Tone selection
  const validTones = Object.keys(TONE_INSTRUCTIONS);
  const selectedTone = validTones.includes(body.tone || "") ? body.tone! : "normal";
  const toneInstruction = TONE_INSTRUCTIONS[selectedTone];

  const systemPrompt = `Du schreibst eine Google-Bewertung im Namen eines Kunden für "${config.businessName}" (${config.aiContext}). Der Inhaber heißt ${config.ownerName}.

STIL: ${styleSeed}
${toneInstruction ? `\n${toneInstruction}\n` : ""}
LÄNGE: ${selectedTone === "poem" || selectedTone === "song" ? "4-8 Zeilen." : selectedTone === "haiku" ? "Exakt 3 Zeilen (5-7-5 Silben)." : "Exakt 2-3 Sätze. Kurz und knackig. Echte Google-Bewertungen sind selten länger."}

VERBOTEN:
- KI-Floskeln: "Ich möchte betonen", "Absolut empfehlenswert!", "Ich kann nur empfehlen", "Was mich besonders begeistert hat"
- Abschluss-Floskeln: "Gerne wieder!", "Jederzeit wieder!", "Kann ich nur weiterempfehlen!"
- Superlativ-Ketten: "beste, tollste, großartigste"
- Werbe-Sprech: "in den Bann ziehen", "überzeugt auf ganzer Linie"
- Gewollt jugendlich: "mega", "geilo", "richtig krass"
- Aufzählungen oder Bullet Points
- NICHT alle Kategorien einzeln abarbeiten — pick 1-2 Aspekte und erzähle davon

SO KLINGT ES ECHT:
- Wie eine SMS an einen Freund: "Ey, der Florian hat mein Logo gemacht, richtig gut geworden."
- Konkret statt abstrakt: "Das Logo sitzt" statt "Die Design-Qualität war hervorragend"
- Wenn eine Kategorie < 4 Sterne hat, darfst du sie weglassen oder nur kurz andeuten

MENSCHLICHE IMPERFEKTIONEN (subtil, nicht übertreiben):
- Gelegentlich einen Satz ohne perfekte Grammatik: "Hat alles super geklappt, bin zufrieden."
- Mal ein Komma weglassen oder einen Gedankenstrich statt Punkt
- Sätze dürfen abgehackt sein: "Top Arbeit. Preis passt auch."
- Nicht in jedem Text — nur gelegentlich, wie bei echten Google-Reviews
${projectTypes.length > 0 ? `\nPROJEKTTYP: ${projectTypes.join(", ")}${projectName ? ` ("${projectName}")` : ""}` : ""}
${projectTypes.length > 0 ? "Erwähne das Projekt konkret im Text (z.B. 'mein neues Logo', 'unsere Website', 'das Shooting').\n" : ""}
BEWERTUNGEN:
${ratingDescription}

GEWÄHLTE STIMMUNGS-TAGS: ${sanitizedTags.length > 0 ? sanitizedTags.join(", ") : "keine"}

Schreibe NUR den Bewertungstext. Keine Einleitung, keine Erklärung, kein "Hier ist die Bewertung:".`;

  const messages: Anthropic.MessageParam[] = [];

  if (personalNote) {
    messages.push({
      role: "user",
      content: `Der Kunde hat folgenden optionalen Kommentar hinterlassen: "${personalNote}"\n\nSchreibe jetzt die Google-Bewertung basierend auf den obigen Informationen.`,
    });
  } else {
    messages.push({
      role: "user",
      content: "Schreibe jetzt die Google-Bewertung basierend auf den obigen Informationen.",
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: selectedTone === "poem" || selectedTone === "song" ? 500 : 300,
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

    return NextResponse.json({ reviewText, overallStars });
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
