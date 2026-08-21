"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FactChipsProps {
  /** Aussagen der gewählten Projekttypen. Leer, solange nichts gewählt ist. */
  facts: string[];
  negatives: string[];
  selected: string[];
  onToggle: (fact: string) => void;
}

export default function FactChips({
  facts,
  negatives,
  selected,
  onToggle,
}: FactChipsProps) {
  function chipClass(isSelected: boolean, negative: boolean) {
    return cn(
      "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2",
      "min-h-[40px] text-left text-sm font-medium",
      "[-webkit-tap-highlight-color:transparent]",
      "transition-colors duration-150",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      isSelected
        ? negative
          ? "border-red-400/50 bg-tag-negative text-text"
          : "border-accent bg-accent/10 text-text"
        : "border-accent/20 bg-transparent text-text-muted hover:border-accent/40"
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence initial={false}>
        {facts.length > 0 && (
          // Höhe wird bewusst NICHT animiert: Das erzwingt 300 ms lang Layout
          // über den ganzen Teilbaum darunter, auf Kundengeräten unbekannter
          // Leistung. Der Block öffnet einmal pro Sitzung, direkt unter dem
          // Chip, den der Nutzer gerade angetippt hat — ein kurzer Fade mit
          // leichtem Versatz trägt das genauso.
          <motion.div
            key="facts"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-medium text-text">
                  Was davon trifft zu?
                </h3>
                <p className="text-sm text-text-muted">
                  Such dir aus, was wirklich passiert ist — je konkreter, desto
                  besser wird der Text.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {facts.map((fact) => {
                  const isSelected = selected.includes(fact);
                  return (
                    <motion.button
                      key={fact}
                      type="button"
                      onClick={() => onToggle(fact)}
                      className={chipClass(isSelected, false)}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 25,
                          }}
                        >
                          <Check size={15} strokeWidth={2.5} />
                        </motion.span>
                      )}
                      {fact}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*
        Bewusst AUSSERHALB der Aufklapp-Bedingung oben: Wer unzufrieden ist,
        soll den Ausgang finden, ohne vorher einen Projekttyp wählen zu müssen.
      */}
      <div className="flex flex-col gap-2.5 border-t border-accent/10 pt-5">
        <p className="text-sm text-text-muted">Lief etwas nicht rund?</p>
        <div className="flex flex-wrap gap-2">
          {negatives.map((neg) => {
            const isSelected = selected.includes(neg);
            return (
              <motion.button
                key={neg}
                type="button"
                onClick={() => onToggle(neg)}
                className={chipClass(isSelected, true)}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <Check size={15} strokeWidth={2.5} />
                  </motion.span>
                )}
                {neg}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
