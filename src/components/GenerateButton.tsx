"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  onClick: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-2 w-2 rounded-full bg-current"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

export default function GenerateButton({
  onClick,
  isGenerating,
  disabled,
}: GenerateButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || isGenerating}
      className={cn(
        "w-full rounded-2xl bg-accent px-6 py-4 text-bg font-semibold text-lg",
        "[-webkit-tap-highlight-color:transparent]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "transition-opacity duration-150",
        (disabled || isGenerating) && "cursor-not-allowed opacity-50"
      )}
      whileHover={!disabled && !isGenerating ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isGenerating ? { scale: 0.98 } : {}}
    >
      {isGenerating ? (
        <motion.span
          className="flex items-center justify-center gap-2"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Wird generiert
          <TypingDots />
        </motion.span>
      ) : (
        "Bewertung generieren"
      )}
    </motion.button>
  );
}
