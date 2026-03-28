"use client";

import { motion } from "framer-motion";
import type { ClientConfig } from "@/config/types";
import StarRating from "./StarRating";

interface CategoryRatingsProps {
  categories: ClientConfig["categories"];
  ratings: Record<string, number>;
  onRate: (categoryId: string, value: number) => void;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function CategoryRatings({
  categories,
  ratings,
  onRate,
}: CategoryRatingsProps) {
  return (
    <motion.div
      className="flex flex-col gap-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {categories.map((category) => (
        <motion.div key={category.id} variants={itemVariants}>
          <StarRating
            label={category.label}
            value={ratings[category.id] ?? 0}
            onChange={(value) => onRate(category.id, value)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
