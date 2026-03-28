"use client";

import { cn } from "@/lib/utils";

interface PersonalNoteProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX_CHARS = 200;

export default function PersonalNote({ value, onChange }: PersonalNoteProps) {
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      onChange(text);
    }
  }

  return (
    <div className="relative flex flex-col gap-1.5">
      <textarea
        value={value}
        onChange={handleChange}
        maxLength={MAX_CHARS}
        rows={3}
        placeholder="Was möchtest du noch erwähnen? (optional)"
        className={cn(
          "w-full resize-none rounded-xl border border-accent-subtle bg-bg-card px-4 py-3",
          "font-body text-sm text-text placeholder:text-text-muted",
          "transition-colors duration-150",
          "focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        )}
      />
      <span className="self-end text-xs text-text-muted tabular-nums">
        {value.length}/{MAX_CHARS}
      </span>
    </div>
  );
}
