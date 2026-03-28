"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface WelcomeHeaderProps {
  businessName: string;
  welcomeText: string;
  logoUrl?: string;
}

export default function WelcomeHeader({
  businessName,
  welcomeText,
  logoUrl,
}: WelcomeHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center gap-4 text-center"
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={businessName}
          width={200}
          height={24}
          className="h-6 w-auto"
          priority
        />
      ) : (
        <h1 className="font-display text-3xl font-bold text-text">
          {businessName}
        </h1>
      )}
      <p className="text-text-muted font-body text-base leading-relaxed">
        {welcomeText}
      </p>
    </motion.div>
  );
}
