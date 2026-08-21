"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntroScreenProps {
  businessName: string;
  welcomeText: string;
  logoUrl?: string;
  onStart: () => void;
}

const STEPS = [
  "Du klickst an, worum es ging und was zutrifft.",
  "Wir schreiben dir daraus einen fertigen Text.",
  "Text kopieren, bei Google einfügen — fertig.",
];

export default function IntroScreen({
  businessName,
  welcomeText,
  logoUrl,
  onStart,
}: IntroScreenProps) {
  return (
    // Keine eigene Entrance: Der Step-Wrapper in ReviewFlow animiert diesen
    // Screen bereits. Zwei geschachtelte Opacity-Kurven multiplizieren sich.
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-5 text-center">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={businessName}
            width={200}
            height={24}
            priority
            className="h-7 w-auto"
          />
        ) : (
          <h1 className="font-display text-2xl font-bold text-text">
            {businessName}
          </h1>
        )}
        <p className="font-body text-sm leading-relaxed text-text-muted">
          {welcomeText}
        </p>
      </div>

      <ol className="flex flex-col gap-3">
        {STEPS.map((step, i) => (
          <motion.li
            key={step}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.08, ease: "easeOut" }}
            className="flex items-start gap-3 rounded-xl bg-bg-card px-4 py-3"
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                "bg-accent/15 font-display text-xs font-bold text-accent tabular-nums"
              )}
            >
              {i + 1}
            </span>
            <span className="font-body text-sm leading-snug text-text">
              {step}
            </span>
          </motion.li>
        ))}
      </ol>

      <motion.button
        type="button"
        onClick={onStart}
        className={cn(
          "flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3.5",
          "text-base font-semibold text-bg",
          "[-webkit-tap-highlight-color:transparent]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Los geht&apos;s
        <ArrowRight size={18} />
      </motion.button>
    </div>
  );
}
