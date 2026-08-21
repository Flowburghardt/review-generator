"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewOutputProps {
  reviewText: string;
  googleReviewUrl: string;
  onRegenerate: () => void;
  canRegenerate: boolean;
  isGenerating: boolean;
  /** Die eigene Notiz wurde verworfen — das gehört gesagt, nicht verschwiegen. */
  noteDropped?: boolean;
}

export default function ReviewOutput({
  reviewText,
  googleReviewUrl,
  onRegenerate,
  canRegenerate,
  isGenerating,
  noteDropped,
}: ReviewOutputProps) {
  const [copied, setCopied] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // Nach dem Neu-Erzeugen liegt der ALTE Text in der Zwischenablage. Ohne
  // diesen Reset stünde Schritt 2 offen und jemand fügt bei Google die
  // vorherige Fassung ein.
  useEffect(() => {
    setCopied(false);
    setHasCopied(false);
  }, [reviewText]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reviewText);
      setCopied(true);
      setHasCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = reviewText;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setHasCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleOpenGoogle() {
    window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
  }

  return (
    // Keine eigene Entrance-Animation: Diese Komponente sitzt bereits in einem
    // animierten Step-Wrapper (ReviewFlow). Zwei ineinander verschachtelte
    // Opacity-Animationen multiplizieren sich — der Screen bleibt länger blass,
    // und die Bewegung läuft diagonal (Parent auf x, Kind auf y).
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-bg-card p-4">
        <p className="whitespace-pre-wrap font-body text-sm leading-relaxed text-text">
          {reviewText}
        </p>
      </div>

      {noteDropped && (
        <p className="rounded-xl bg-tag-negative px-4 py-3 text-sm text-text">
          Deine eigene Notiz konnten wir nicht verwenden — sie enthielt etwas,
          das wie eine Anweisung aussah. Der Text unten kommt nur aus deiner
          Auswahl.
        </p>
      )}

      <p className="text-center text-sm text-text-muted">
        Passt der Text? Dann kopieren und drüben bei Google einfügen.
      </p>

      <div className="flex flex-col gap-2.5">
        {/* Schritt 1: Kopieren */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-text-subtle">
            Schritt 1
          </span>
          <motion.button
            type="button"
            onClick={handleCopy}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl px-5 py-3",
              "text-sm font-semibold",
              "[-webkit-tap-highlight-color:transparent]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              hasCopied
                ? "border border-success/30 bg-success/10 text-success"
                : "bg-accent text-bg"
            )}
            whileTap={{ scale: 0.98 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <Check size={16} />
                  Kopiert!
                </motion.span>
              ) : hasCopied ? (
                <motion.span
                  key="done"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <Check size={16} />
                  Text kopiert
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <Copy size={16} />
                  Text kopieren
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Schritt 2: Google */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-text-subtle">
            Schritt 2
          </span>
          <motion.button
            type="button"
            onClick={handleOpenGoogle}
            disabled={!hasCopied}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl px-5 py-3",
              "text-base font-semibold",
              "[-webkit-tap-highlight-color:transparent]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              "transition-colors duration-150",
              hasCopied
                ? "bg-accent text-bg"
                : "cursor-not-allowed border border-accent/20 bg-transparent text-text-subtle opacity-40"
            )}
            whileHover={hasCopied ? { scale: 1.02 } : {}}
            whileTap={hasCopied ? { scale: 0.98 } : {}}
          >
            <ExternalLink size={16} />
            Bei Google einfügen
          </motion.button>
          <p className="text-center text-xs text-text-muted">
            {hasCopied
              ? "Text einfügen — die Sterne vergibst du dort selbst."
              : "Kopiere zuerst den Text."}
          </p>
        </div>

        {canRegenerate && (
          <motion.button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border border-accent/20 px-4 py-2.5",
              "text-sm font-medium text-text-muted",
              "[-webkit-tap-highlight-color:transparent]",
              "transition-colors duration-150 hover:border-accent/40",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              isGenerating && "cursor-not-allowed opacity-50"
            )}
            whileTap={isGenerating ? {} : { scale: 0.98 }}
          >
            <RefreshCw
              size={14}
              className={cn(isGenerating && "animate-spin")}
            />
            {isGenerating ? "Wird geschrieben …" : "Anderen Text erzeugen"}
          </motion.button>
        )}
      </div>

      <p className="text-center text-[11px] text-text-muted opacity-60">
        Dieser Text wurde mit KI-Unterstützung erstellt
      </p>
    </div>
  );
}
