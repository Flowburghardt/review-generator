"use client";

import { cn } from "@/lib/utils";

interface PersonalNoteProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX_CHARS = 600;

export default function PersonalNote({ value, onChange }: PersonalNoteProps) {
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      onChange(text);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-medium text-text">
          Willst du was Eigenes ergänzen?
        </h3>
        <p className="text-sm text-text-muted">
          Was war das Projekt, und was ist dabei passiert? Ein, zwei Sätze in
          deinen Worten machen den größten Unterschied — hier entsteht das, was
          sich niemand ausdenken kann.
        </p>
      </div>
      <div className="relative flex flex-col gap-1.5">
        <textarea
          value={value}
          onChange={handleChange}
          maxLength={MAX_CHARS}
          rows={5}
          placeholder="z.B. „Wir hatten vorher gar keine Website und auch keinen richtigen Firmennamen …“ (optional)"
          className={cn(
            "w-full resize-none rounded-xl border border-accent/20 bg-bg-card px-4 py-3",
            "font-body text-sm leading-relaxed text-text placeholder:text-text-subtle",
            "transition-colors duration-150",
            "focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          )}
        />
        <span className="self-end text-xs text-text-muted tabular-nums">
          {value.length}/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
}
