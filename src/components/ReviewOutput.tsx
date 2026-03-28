"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Copy, Check, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewOutputProps {
  reviewText: string;
  overallStars: number;
  googleReviewUrl: string;
  onRegenerate: () => void;
  canRegenerate: boolean;
}

export default function ReviewOutput({
  reviewText,
  overallStars,
  googleReviewUrl,
  onRegenerate,
  canRegenerate,
}: ReviewOutputProps) {
  const [copied, setCopied] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

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
    window.open(googleReviewUrl, "_blank");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-4"
    >
      {/* Generated review text */}
      <div className="rounded-2xl bg-bg-card p-4">
        <p className="whitespace-pre-wrap font-body text-sm leading-relaxed text-text">
          {reviewText}
        </p>
      </div>

      {/* Star recommendation */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={20}
              className={cn(
                star <= overallStars
                  ? "text-star fill-current"
                  : "text-star-empty"
              )}
              fill={star <= overallStars ? "currentColor" : "none"}
            />
          ))}
        </div>
        <p className="text-sm text-text-muted">
          Wir empfehlen {overallStars} Sterne — du entscheidest natürlich selbst
        </p>
      </div>

      {/* Two-step action flow */}
      <div className="flex flex-col gap-2.5">
        {/* Step 1: Copy */}
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

        {/* Step 2: Google */}
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
              "transition-all duration-300",
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
              ? "Jetzt Text einfügen und Sterne vergeben"
              : "Kopiere zuerst den Text"}
          </p>
        </div>

        {/* Regenerate */}
        {canRegenerate && (
          <motion.button
            type="button"
            onClick={onRegenerate}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border border-accent/20 px-4 py-2.5",
              "text-sm font-medium text-text-muted",
              "[-webkit-tap-highlight-color:transparent]",
              "transition-colors duration-150 hover:border-accent/40",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            )}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw size={14} />
            Neu generieren
          </motion.button>
        )}
      </div>

      {/* AI disclaimer */}
      <p className="text-center text-[11px] text-text-muted opacity-60">
        Dieser Text wurde mit KI-Unterstützung erstellt
      </p>
    </motion.div>
  );
}
