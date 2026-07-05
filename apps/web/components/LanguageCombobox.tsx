"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import {
  type ClipboardEvent,
  type KeyboardEvent,
  useMemo,
  useRef,
  useState,
} from "react";

const languageOptions = [
  "TypeScript",
  "JavaScript",
  "Python",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "PostgreSQL",
  "Drizzle",
  "Prisma",
  "TailwindCSS",
  "Accessibility",
  "Performance",
  "Testing",
  "Documentation",
  "Rust",
  "Go",
  "Java",
  "PHP",
  "Ruby",
  "C",
  "C++",
  "C#",
  "HTML",
  "CSS",
  "Vue",
  "Svelte",
  "Kotlin",
  "Swift",
  "Dart",
  "Shell",
  "SQL",
];

type LanguageComboboxProps = {
  value: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

const normalize = (value: string) => value.trim().replace(/\s+/g, " ");

const splitValues = (value: string) =>
  value.split(/[\n,]/).map(normalize).filter(Boolean);

export function LanguageCombobox({
  value,
  onChange = () => {},
  disabled = false,
  placeholder = "Type a skill and press Enter...",
  className,
}: LanguageComboboxProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const blurTimeoutRef = useRef<number | null>(null);

  const selectedLookup = useMemo(
    () => new Set(value.map((item) => item.toLowerCase())),
    [value],
  );

  const suggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();

    return languageOptions
      .filter((option) => !selectedLookup.has(option.toLowerCase()))
      .filter((option) => !query || option.toLowerCase().includes(query))
      .slice(0, 8);
  }, [inputValue, selectedLookup]);

  const customValue = normalize(inputValue);
  const canAddCustom =
    !!customValue && !selectedLookup.has(customValue.toLowerCase());

  const addValues = (nextValues: string[]) => {
    if (disabled) return;

    const existing = new Set(value.map((item) => item.toLowerCase()));
    const deduped = nextValues.filter((item) => {
      const key = item.toLowerCase();
      if (existing.has(key)) return false;
      existing.add(key);
      return true;
    });

    if (!deduped.length) return;

    onChange([...value, ...deduped]);
    setInputValue("");
    setIsOpen(false);
  };

  const removeValue = (item: string) => {
    if (disabled) return;
    onChange(value.filter((selected) => selected !== item));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addValues(splitValues(inputValue));
      return;
    }

    if (event.key === "Backspace" && !inputValue && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text");

    if (!pasted.includes(",") && !pasted.includes("\n")) return;

    event.preventDefault();
    addValues(splitValues(pasted));
  };

  const handleBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 120);
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      window.clearTimeout(blurTimeoutRef.current);
    }
    if (!disabled) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "min-h-9 rounded-md border border-border/60 bg-muted/40 px-2 py-1.5 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-primary/30",
          disabled && "opacity-70",
          className,
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {value.map((item) => (
            <Badge
              key={item}
              variant="outline"
              className="h-6 gap-1 px-2 text-xs"
            >
              {item}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeValue(item)}
                  className="-mr-1 flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Remove ${item}`}
                >
                  <X className="size-3" />
                </button>
              )}
            </Badge>
          ))}
          {!disabled && (
            <Input
              value={inputValue}
              disabled={disabled}
              onChange={(event) => {
                setInputValue(event.target.value);
                setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={value.length ? "Add another..." : placeholder}
              className="h-8 min-w-36 flex-1 border-0 bg-transparent px-1 py-1 shadow-none focus-visible:ring-0"
            />
          )}
        </div>
      </div>

      {!disabled && isOpen && (suggestions.length > 0 || canAddCustom) && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border/60 bg-popover p-1 text-popover-foreground shadow-md">
          {canAddCustom && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => addValues([customValue])}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
            >
              <Plus className="size-3.5" />
              Add "{customValue}"
            </button>
          )}
          {suggestions.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => addValues([option])}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
            >
              <span>{option}</span>
              <Plus className="size-3.5 opacity-50" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
