"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isPast = step < currentStep;
        const isFuture = step > currentStep;

        return (
          <motion.div
            key={step}
            className={cn(
              "h-2 rounded-full",
              isActive && "bg-accent",
              isPast && "bg-accent/60",
              isFuture && "bg-text-muted/30"
            )}
            animate={{
              width: isActive ? 24 : 8,
              scale: isFuture ? 0.8 : 1,
              opacity: isFuture ? 0.5 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        );
      })}
    </div>
  );
}
