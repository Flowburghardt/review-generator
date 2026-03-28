"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const PROJECT_TYPES = [
  { id: "website", label: "Website" },
  { id: "branding", label: "Branding" },
  { id: "marketing", label: "Marketing" },
  { id: "fotografie", label: "Fotografie" },
  { id: "ki-workflow", label: "KI-Workflow" },
];

interface ProjectTypeProps {
  selected: string | null;
  onChange: (type: string) => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
}

export default function ProjectType({
  selected,
  onChange,
  projectName,
  onProjectNameChange,
}: ProjectTypeProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-medium text-text">
          Worum ging es?
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {PROJECT_TYPES.map((type) => {
          const isSelected = selected === type.id;
          return (
            <motion.button
              key={type.id}
              type="button"
              onClick={() => onChange(type.id)}
              className={cn(
                "rounded-xl border px-4 py-2.5",
                "min-h-[44px] text-base font-medium",
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
          "font-body text-base text-text placeholder:text-text-subtle",
          "transition-colors duration-150",
          "focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        )}
      />
    </div>
  );
}
