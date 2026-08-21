"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientConfig } from "@/config/types";

import IntroScreen from "./IntroScreen";
import ProjectType from "./ProjectType";
import FactChips from "./FactChips";
import PersonalNote from "./PersonalNote";
import GenerateButton from "./GenerateButton";
import ReviewOutput from "./ReviewOutput";
import FeedbackScreen from "./FeedbackScreen";
import ProgressIndicator from "./ProgressIndicator";
import ToneSelector from "./ToneSelector";

interface ReviewFlowProps {
  config: ClientConfig;
}

const STEP_INTRO = 0;
const STEP_WHAT = 1;
const STEP_DETAILS = 2;
const STEP_RESULT = 3;
const TOTAL_STEPS = 3;

const MAX_GENERATIONS = 3;

/** Ease-out. Die eingebauten Kurven sind für Enter/Exit zu schwach. */
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * `mode="wait"` ADDIERT Exit und Enter. Bei je 350 ms wären das 700 ms pro
 * „Weiter"-Tap auf einem dreistufigen Formular — lang genug, dass jemand ein
 * zweites Mal tippt. Der Austritt darf kurz sein, der Eintritt trägt die
 * Bewegung.
 */
const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: { duration: 0.15, ease: EASE_OUT },
  },
};

export default function ReviewFlow({ config }: ReviewFlowProps) {
  const [step, setStep] = useState(STEP_INTRO);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFacts, setSelectedFacts] = useState<string[]>([]);
  const [personalNote, setPersonalNote] = useState("");
  const [projectName, setProjectName] = useState("");
  const [tone, setTone] = useState("normal");
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateCount, setGenerateCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [noteDropped, setNoteDropped] = useState(false);

  /**
   * Zwei schnelle Taps auf „Weiter" wären zwei Schritte auf einmal — der
   * Details-Screen würde übersprungen und Freitext samt Stil blieben leer,
   * ohne dass es jemand merkt. Ein Zeitfenster statt eines Sperr-States:
   * so kann die Navigation nicht dauerhaft blockieren, wenn eine Animation
   * einmal nicht sauber abschließt.
   */
  const lastNavRef = useRef(0);
  const isGeneratingRef = useRef(false);

  const guardNavigation = useCallback((navigate: () => void) => {
    const now = Date.now();
    if (now - lastNavRef.current < 400) return;
    lastNavRef.current = now;
    navigate();
  }, []);

  /**
   * Aussagen der aktuell gewählten Projekttypen. Dedupliziert, weil die Chips
   * mit `key={fact}` gerendert werden — zwei Typen mit identischem Chip-Text
   * ergäben sonst doppelte React-Keys.
   */
  const availableFacts = useMemo(
    () => [
      ...new Set(
        config.projectTypes
          .filter((t) => selectedTypes.includes(t.id))
          .flatMap((t) => t.factChips)
      ),
    ],
    [config.projectTypes, selectedTypes]
  );

  const hasNegative = useMemo(
    () => selectedFacts.some((f) => config.negativeChips.includes(f)),
    [config.negativeChips, selectedFacts]
  );

  const hasPositiveFact = useMemo(
    () => selectedFacts.some((f) => availableFacts.includes(f)),
    [availableFacts, selectedFacts]
  );

  const handleToggleProjectType = useCallback(
    (typeId: string) => {
      const isRemoving = selectedTypes.includes(typeId);
      const nextTypes = isRemoving
        ? selectedTypes.filter((t) => t !== typeId)
        : [...selectedTypes, typeId];

      setSelectedTypes(nextTypes);

      if (isRemoving) {
        // Die Chips des abgewählten Typs müssen mit raus — sonst bleiben
        // Aussagen ausgewählt, die gar nicht mehr angeboten werden, und der
        // Server verwirft sie stillschweigend.
        // Gefiltert wird gegen die VERBLEIBENDEN Typen: Bietet ein anderer
        // noch gewählter Typ denselben Chip-Text an, bleibt er stehen.
        const stillOffered = new Set(
          config.projectTypes
            .filter((t) => nextTypes.includes(t.id))
            .flatMap((t) => t.factChips)
        );
        setSelectedFacts((facts) =>
          facts.filter(
            (f) => stillOffered.has(f) || config.negativeChips.includes(f)
          )
        );
      }
    },
    [config.projectTypes, config.negativeChips, selectedTypes]
  );

  const handleToggleFact = useCallback((fact: string) => {
    setSelectedFacts((prev) =>
      prev.includes(fact) ? prev.filter((f) => f !== fact) : [...prev, fact]
    );
  }, []);

  const handleGenerate = useCallback(async () => {
    if (generateCount >= MAX_GENERATIONS) return;
    // Ohne diesen Guard feuern zwei Klicks während der 3–6 s Wartezeit zwei
    // parallele Requests, verbrauchen zwei Rate-Limit-Slots, und angezeigt
    // wird die zuletzt eintreffende — nicht die zuletzt gestartete.
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    setIsGenerating(true);
    setError(null);
    setNoteDropped(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientSlug: config.slug,
          projectTypes: selectedTypes,
          selectedFacts,
          personalNote,
          tone,
          projectName: projectName || undefined,
        }),
      });

      // Fehlerseiten von Traefik oder ein 500er ohne JSON-Body sind kein JSON.
      // Ohne das .catch() läge dem Kunden ein "Unexpected token '<'" im UI.
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Fehler: ${res.status}`);
      }

      if (!data?.reviewText) {
        throw new Error("Es kam kein Text zurück. Bitte versuche es erneut.");
      }

      setGeneratedText(data.reviewText);
      setNoteDropped(Boolean(data.noteDropped));
      setGenerateCount((prev) => prev + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Etwas ist schiefgelaufen. Bitte versuche es erneut."
      );
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  }, [
    config.slug,
    selectedTypes,
    selectedFacts,
    personalNote,
    tone,
    projectName,
    generateCount,
  ]);

  const handleBack = useCallback(() => {
    guardNavigation(() => {
      setGeneratedText(null);
      setGenerateCount(0);
      setError(null);
      setNoteDropped(false);
      // Aus dem Ergebnis zurück: bei Negativ-Auswahl übersprang der Weg
      // Schritt 2, also führt der Rückweg auch dorthin zurück.
      setStep((prev) => {
        if (prev === STEP_RESULT && hasNegative) return STEP_WHAT;
        return Math.max(STEP_INTRO, prev - 1);
      });
    });
  }, [guardNavigation, hasNegative]);

  const handleNext = useCallback(() => {
    guardNavigation(() => {
      // Ein einziger negativer Chip schlägt jede positive Auswahl: Wer
      // unzufrieden ist, soll bei Florian landen und nicht bei Google.
      if (step === STEP_WHAT && hasNegative) {
        setStep(STEP_RESULT);
        return;
      }
      setStep((prev) => Math.min(STEP_RESULT, prev + 1));
    });
  }, [guardNavigation, step, hasNegative]);

  // Ein negativer Chip allein genügt: Wer unzufrieden ist, soll den Ausgang
  // nehmen können, ohne vorher einen Projekttyp zu wählen — sonst ist der
  // Notausgang zwar sichtbar, aber verschlossen.
  const canProceed =
    (step === STEP_WHAT &&
      (hasNegative || (selectedTypes.length > 0 && hasPositiveFact))) ||
    step === STEP_DETAILS;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-5 py-8">
      {step > STEP_INTRO && (
        <ProgressIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
      )}

      <AnimatePresence mode="wait">
        {step === STEP_INTRO && (
          <motion.div
            key="step-intro"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <IntroScreen
              businessName={config.businessName}
              welcomeText={config.welcomeText}
              logoUrl={config.branding.logoUrl}
              onStart={() => setStep(STEP_WHAT)}
            />
          </motion.div>
        )}

        {step === STEP_WHAT && (
          <motion.div
            key="step-what"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col gap-7"
          >
            <ProjectType
              types={config.projectTypes}
              selected={selectedTypes}
              onToggle={handleToggleProjectType}
              projectName={projectName}
              onProjectNameChange={setProjectName}
            />
            <FactChips
              facts={availableFacts}
              negatives={config.negativeChips}
              selected={selectedFacts}
              onToggle={handleToggleFact}
            />
          </motion.div>
        )}

        {step === STEP_DETAILS && (
          <motion.div
            key="step-details"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col gap-7"
          >
            <PersonalNote value={personalNote} onChange={setPersonalNote} />
            <ToneSelector selected={tone} onChange={setTone} />
          </motion.div>
        )}

        {step === STEP_RESULT && hasNegative && (
          <motion.div
            key="step-feedback"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <FeedbackScreen
              businessName={config.businessName}
              feedbackEmail={config.feedbackEmail}
            />
          </motion.div>
        )}

        {step === STEP_RESULT && !hasNegative && !generatedText && (
          <motion.div
            key="step-generate"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col gap-5"
          >
            <div className="text-center">
              <h2 className="font-display text-xl font-bold text-text">
                Fertig zum Schreiben
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Wir bauen dir daraus einen Text. Du kannst ihn danach noch ändern.
              </p>
            </div>
            <GenerateButton
              onClick={handleGenerate}
              isGenerating={isGenerating}
              disabled={generateCount >= MAX_GENERATIONS}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}

        {step === STEP_RESULT && !hasNegative && generatedText && (
          <motion.div
            key="step-output"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <ReviewOutput
              reviewText={generatedText}
              googleReviewUrl={config.googleReviewUrl}
              onRegenerate={handleGenerate}
              canRegenerate={generateCount < MAX_GENERATIONS}
              isGenerating={isGenerating}
              noteDropped={noteDropped}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      {step > STEP_INTRO && step < STEP_RESULT && (
        <div className="flex gap-3">
          <motion.button
            type="button"
            onClick={handleBack}
            className={cn(
              "flex items-center justify-center gap-1 rounded-2xl border border-accent/30 px-4 py-3",
              "text-base font-medium text-text-muted",
              "[-webkit-tap-highlight-color:transparent]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              "transition-colors duration-150 hover:border-accent/50"
            )}
            whileTap={{ scale: 0.98 }}
          >
            <ChevronLeft size={20} />
            Zurück
          </motion.button>
          <motion.button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3",
              "text-base font-semibold text-bg",
              "[-webkit-tap-highlight-color:transparent]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              "transition-opacity duration-150",
              !canProceed && "cursor-not-allowed opacity-50"
            )}
            whileHover={canProceed ? { scale: 1.02 } : {}}
            whileTap={canProceed ? { scale: 0.98 } : {}}
          >
            {step === STEP_WHAT && hasNegative ? "Feedback geben" : "Weiter"}
            <ChevronRight size={20} />
          </motion.button>
        </div>
      )}

      {step === STEP_RESULT && !isGenerating && (
        <motion.button
          type="button"
          onClick={handleBack}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "flex items-center justify-center gap-1 rounded-2xl border border-accent/30 px-4 py-2.5",
            "text-sm font-medium text-text-muted",
            "[-webkit-tap-highlight-color:transparent]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            "transition-colors duration-150 hover:border-accent/50"
          )}
          whileTap={{ scale: 0.98 }}
        >
          <ChevronLeft size={18} />
          Zurück zur Auswahl
        </motion.button>
      )}
    </div>
  );
}
