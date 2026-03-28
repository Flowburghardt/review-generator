"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export default function StarRating({ label, value, onChange }: StarRatingProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-text">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= value;
          return (
            <motion.button
              key={star}
              type="button"
              className={cn(
                "star-tap flex items-center justify-center rounded-md",
                "min-h-[44px] min-w-[44px]",
                "[-webkit-tap-highlight-color:transparent]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              )}
              onClick={() => onChange(star)}
              whileTap={{ scale: 1.3 }}
              animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              aria-label={`${star} von 5 Sternen`}
            >
              <Star
                size={32}
                className={cn(
                  "transition-colors duration-150",
                  isActive ? "text-star fill-current" : "text-star-empty"
                )}
                fill={isActive ? "currentColor" : "none"}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
