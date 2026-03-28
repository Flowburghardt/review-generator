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

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reviewText);
      setCopied(true);
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
      className="flex flex-col gap-5"
    >
      {/* Generated review text */}
      <div className="rounded-2xl bg-bg-card p-5">
        <p className="whitespace-pre-wrap font-body text-base leading-relaxed text-text">
          {reviewText}
        </p>
      </div>

      {/* Star recommendation */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={22}
              className={cn(
                star <= overallStars
                  ? "text-star fill-current"
                  : "text-star-empty"
              )}
              fill={star <= overallStars ? "currentColor" : "none"}
            />
          ))}
        </div>
        <p className="text-base text-text-muted">
          Wir empfehlen {overallStars} Sterne — du entscheidest natürlich selbst
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        {/* Copy button */}
        <motion.button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border border-accent-subtle px-5 py-3",
            "text-base font-medium text-text",
            "[-webkit-tap-highlight-color:transparent]",
            "transition-colors duration-150 hover:bg-bg-elevated",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
                className="flex items-center gap-2 text-success"
              >
                <Check size={16} />
                Kopiert!
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
                Kopieren
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Regenerate button */}
        {canRegenerate && (
          <motion.button
            type="button"
            onClick={onRegenerate}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border border-accent-subtle px-5 py-3",
              "text-base font-medium text-text",
              "[-webkit-tap-highlight-color:transparent]",
              "transition-colors duration-150 hover:bg-bg-elevated",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            )}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw size={16} />
            Neu generieren
          </motion.button>
        )}

        {/* Google CTA */}
        <motion.button
          type="button"
          onClick={handleOpenGoogle}
          className={cn(
            "flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-4",
            "text-lg font-semibold text-bg",
            "[-webkit-tap-highlight-color:transparent]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ExternalLink size={18} />
          Weiter zu Google
        </motion.button>

        <p className="text-center text-sm text-text-muted">
          Text einfügen und Sterne vergeben
        </p>
      </div>

      {/* AI disclaimer */}
      <p className="text-center text-[11px] text-text-muted opacity-60">
        Dieser Text wurde mit KI-Unterstützung erstellt
      </p>
    </motion.div>
  );
}
