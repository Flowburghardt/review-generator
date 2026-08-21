"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ToneOption {
  id: string;
  label: string;
  hint: string;
}

/** IDs müssen zu den Keys in `TONES` (api/generate/route.ts) passen. */
export const TONE_OPTIONS: ToneOption[] = [
  { id: "normal", label: "Normal", hint: "locker erzählt" },
  { id: "serious", label: "Seriös", hint: "sachlich, geschäftlich" },
  { id: "kurz", label: "Kurz & knapp", hint: "ein, zwei Sätze" },
  { id: "wie-vorher", label: "Wie's vorher war", hint: "Ausgangslage zuerst" },
  { id: "poem", label: "Gedicht", hint: "gereimt, für Mutige" },
];

interface ToneSelectorProps {
  selected: string;
  onChange: (tone: string) => void;
}

export default function ToneSelector({ selected, onChange }: ToneSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-medium text-text">Wie soll es klingen?</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TONE_OPTIONS.map((tone) => {
          const isSelected = selected === tone.id;
          return (
            <motion.button
              key={tone.id}
              type="button"
              onClick={() => onChange(tone.id)}
              className={cn(
                "flex flex-col items-start justify-center gap-0.5 rounded-xl border px-3.5 py-3",
                "min-h-[56px] text-left",
                "[-webkit-tap-highlight-color:transparent]",
                "transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                isSelected
                  ? "border-accent bg-accent/10 text-text"
                  : "border-accent/20 bg-transparent text-text-muted hover:border-accent/40"
              )}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <span className="text-sm font-medium">{tone.label}</span>
              <span className="text-xs text-text-subtle">{tone.hint}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
