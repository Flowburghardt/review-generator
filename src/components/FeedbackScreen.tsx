"use client";

import { motion } from "framer-motion";
import { Mail, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackScreenProps {
  businessName: string;
  feedbackEmail?: string;
}

export default function FeedbackScreen({
  businessName,
  feedbackEmail,
}: FeedbackScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center gap-6 py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
      >
        <Heart size={48} className="text-accent" />
      </motion.div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-bold text-text">
          Danke für dein ehrliches Feedback.
        </h2>
        <p className="text-text-muted font-body text-base leading-relaxed">
          Das hilft {businessName} wirklich weiter.
          <br />
          Ich melde mich persönlich bei dir.
        </p>
      </div>

      {feedbackEmail && (
        <motion.a
          href={`mailto:${feedbackEmail}`}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border border-accent-subtle px-5 py-3",
            "text-sm font-medium text-text",
            "transition-colors duration-150 hover:bg-bg-elevated",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Mail size={16} />
          Direkt per E-Mail schreiben
        </motion.a>
      )}
    </motion.div>
  );
}
