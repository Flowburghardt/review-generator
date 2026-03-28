"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ToneOption {
  id: string;
  label: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  { id: "normal", label: "Normal" },
  { id: "serious", label: "Seriös" },
  { id: "poem", label: "Gedicht" },
  { id: "song", label: "Songtext" },
  { id: "gen-z", label: "Gen Z" },
  { id: "haiku", label: "Haiku" },
];

interface ToneSelectorProps {
  selected: string;
  onChange: (tone: string) => void;
}

export default function ToneSelector({ selected, onChange }: ToneSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-medium text-text">Tonalität</h3>
        <p className="text-sm text-text-muted">Wie soll die Bewertung klingen?</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {TONE_OPTIONS.map((tone) => {
          const isSelected = selected === tone.id;
          return (
            <motion.button
              key={tone.id}
              type="button"
              onClick={() => onChange(tone.id)}
              className={cn(
                "flex items-center justify-center rounded-xl border px-3 py-3",
                "min-h-[48px]",
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
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
