"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientConfig } from "@/config/types";

import WelcomeHeader from "./WelcomeHeader";
import CategoryRatings from "./CategoryRatings";
import MoodTags from "./MoodTags";
import PersonalNote from "./PersonalNote";
import GenerateButton from "./GenerateButton";
import ReviewOutput from "./ReviewOutput";
import FeedbackScreen from "./FeedbackScreen";
import ProgressIndicator from "./ProgressIndicator";
import ToneSelector from "./ToneSelector";
import ProjectType from "./ProjectType";

interface ReviewFlowProps {
  config: ClientConfig;
}

const TOTAL_STEPS = 3;
const MAX_GENERATIONS = 3;

const stepVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -60 },
};

export default function ReviewFlow({ config }: ReviewFlowProps) {
  const [step, setStep] = useState(1);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [personalNote, setPersonalNote] = useState("");
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [overallStars, setOverallStars] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateCount, setGenerateCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState("normal");
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [projectName, setProjectName] = useState("");

  const allCategoriesRated = useMemo(
    () => config.categories.every((cat) => ratings[cat.id] > 0),
    [config.categories, ratings]
  );

  const hasSelectedTags = selectedTags.length > 0;

  const averageRating = useMemo(() => {
    const values = Object.values(ratings);
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }, [ratings]);

  const isLowRating = averageRating > 0 && averageRating < 3;

  const handleRate = useCallback((categoryId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [categoryId]: value }));
  }, []);

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleGenerate = useCallback(async () => {
    if (generateCount >= MAX_GENERATIONS) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientSlug: config.slug,
          ratings,
          selectedTags,
          personalNote,
          tone,
          projectTypes,
          projectName: projectName || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Fehler: ${res.status}`);
      }

      const data = await res.json();
      setGeneratedText(data.reviewText);
      setOverallStars(data.overallStars ?? Math.round(averageRating));
      setGenerateCount((prev) => prev + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Etwas ist schiefgelaufen. Bitte versuche es erneut."
      );
    } finally {
      setIsGenerating(false);
    }
  }, [
    config.slug,
    ratings,
    selectedTags,
    personalNote,
    tone,
    averageRating,
    generateCount,
  ]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setGeneratedText(null);
      setOverallStars(null);
      setGenerateCount(0);
      setError(null);
      setStep((prev) => prev - 1);
    }
  }, [step]);

  const handleNext = useCallback(() => {
    if (step === 2 && isLowRating) {
      setStep(3);
      return;
    }
    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
    }
  }, [step, isLowRating]);

  const handleToggleProjectType = useCallback((type: string) => {
    setProjectTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const canProceed =
    (step === 1 && allCategoriesRated && projectTypes.length > 0) ||
    (step === 2 && hasSelectedTags);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-5 py-8">
      <ProgressIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex flex-col gap-8"
          >
            <WelcomeHeader
              businessName={config.businessName}
              welcomeText={config.welcomeText}
              logoUrl={config.branding.logoUrl}
            />
            <CategoryRatings
              categories={config.categories}
              ratings={ratings}
              onRate={handleRate}
            />
            <ProjectType
              selected={projectTypes}
              onToggle={handleToggleProjectType}
              projectName={projectName}
              onProjectNameChange={setProjectName}
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-xl font-bold text-text">
                Was hat dir besonders gefallen?
              </h2>
              <p className="text-sm text-text-muted">
                Wähle mindestens einen Begriff aus.
              </p>
            </div>
            <MoodTags
              tags={config.moodTags}
              selectedTags={selectedTags}
              onToggle={handleToggleTag}
            />
            <PersonalNote value={personalNote} onChange={setPersonalNote} />
            <ToneSelector selected={tone} onChange={setTone} />
          </motion.div>
        )}

        {step === 3 && isLowRating && (
          <motion.div
            key="step-3-feedback"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <FeedbackScreen
              businessName={config.businessName}
              feedbackEmail={config.feedbackEmail}
            />
          </motion.div>
        )}

        {step === 3 && !isLowRating && !generatedText && (
          <motion.div
            key="step-3-generate"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex flex-col gap-5"
          >
            <div className="text-center">
              <h2 className="font-display text-xl font-bold text-text">
                Bereit zum Generieren
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Wir erstellen eine persönliche Bewertung basierend auf deinem
                Feedback.
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
                className="text-center text-sm text-red-500"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}

        {step === 3 && !isLowRating && generatedText && overallStars && (
          <motion.div
            key="step-3-output"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <ReviewOutput
              reviewText={generatedText}
              overallStars={overallStars}
              googleReviewUrl={config.googleReviewUrl}
              onRegenerate={handleGenerate}
              canRegenerate={generateCount < MAX_GENERATIONS}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      {step < 3 && (
        <div className="flex gap-3">
          {step > 1 && (
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
          )}
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
            Weiter
            <ChevronRight size={20} />
          </motion.button>
        </div>
      )}

      {/* Back button on step 3 */}
      {step === 3 && !isGenerating && (
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
