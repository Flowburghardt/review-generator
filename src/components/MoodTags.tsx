"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientConfig } from "@/config/types";

interface MoodTagsProps {
  tags: ClientConfig["moodTags"];
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

const sentimentStyles: Record<string, string> = {
  positive: "bg-tag-positive border-accent",
  neutral: "bg-tag-neutral border-tag-neutral",
  negative: "bg-tag-negative border-tag-negative",
};

export default function MoodTags({
  tags,
  selectedTags,
  onToggle,
}: MoodTagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.label);
        return (
          <motion.button
            key={tag.label}
            type="button"
            onClick={() => onToggle(tag.label)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-5 py-2.5",
              "min-h-[48px] text-base font-medium",
              "[-webkit-tap-highlight-color:transparent]",
              "transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              isSelected
                ? sentimentStyles[tag.sentiment]
                : "border-accent-subtle bg-transparent text-text"
            )}
            whileTap={{ scale: 0.95 }}
            animate={isSelected ? { scale: 1 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            {isSelected && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <Check size={14} strokeWidth={2.5} />
              </motion.span>
            )}
            {tag.label}
          </motion.button>
        );
      })}
    </div>
  );
}
