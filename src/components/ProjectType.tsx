"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectTypeConfig } from "@/config/types";

interface ProjectTypeProps {
  /**
   * Kommt aus der Client-Config, nicht aus einer Konstante hier.
   * Vorher stand die Liste an zwei Orten (hier + Route-Whitelist) und lief
   * auseinander — "Beratung" wurde serverseitig still verworfen.
   */
  types: ProjectTypeConfig[];
  selected: string[];
  onToggle: (type: string) => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
}

export default function ProjectType({
  types,
  selected,
  onToggle,
  projectName,
  onProjectNameChange,
}: ProjectTypeProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-medium text-text">Worum ging es?</h3>
        <p className="text-sm text-text-muted">
          Mehrfachauswahl — nimm alles, was gepasst hat.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {types.map((type) => {
          const isSelected = selected.includes(type.id);
          return (
            <motion.button
              key={type.id}
              type="button"
              onClick={() => onToggle(type.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2",
                "min-h-[40px] text-sm font-medium",
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
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Check size={16} strokeWidth={2.5} />
                </motion.span>
              )}
              {type.label}
            </motion.button>
          );
        })}
      </div>
      <input
        type="text"
        value={projectName}
        onChange={(e) => onProjectNameChange(e.target.value.slice(0, 80))}
        maxLength={80}
        placeholder="Projektname (optional)"
        className={cn(
          "w-full rounded-xl border border-accent/20 bg-bg-card px-4 py-3",
          "font-body text-sm text-text placeholder:text-text-subtle",
          "transition-colors duration-150",
          "focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        )}
      />
    </div>
  );
}
