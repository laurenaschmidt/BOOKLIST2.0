"use client";

import { useState, useTransition } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Plus } from "lucide-react";
import { addToLibraryAction } from "@/lib/actions/library";
import { cn } from "@/lib/utils";
import type { ReadingStatus } from "@/app/generated/prisma/enums";

const STATUS_LABELS: Record<ReadingStatus, string> = {
  WANT_TO_READ: "Want to Read",
  CURRENTLY_READING: "Currently Reading",
  FINISHED: "Finished",
};

const STATUS_ORDER: ReadingStatus[] = ["WANT_TO_READ", "CURRENTLY_READING", "FINISHED"];

export function AddToLibraryMenu({
  googleBooksId,
  initialStatus,
}: {
  googleBooksId: string;
  initialStatus?: ReadingStatus | null;
}) {
  const [status, setStatus] = useState<ReadingStatus | null>(initialStatus ?? null);
  const [isPending, startTransition] = useTransition();

  function handleSelect(next: ReadingStatus) {
    startTransition(async () => {
      await addToLibraryAction(googleBooksId, next);
      setStatus(next);
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          disabled={isPending}
          className={cn(
            "flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 disabled:opacity-60",
            status
              ? "bg-sage/20 text-sage"
              : "bg-accent text-accent-foreground hover:bg-accent-hover"
          )}
        >
          {status ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {status ? STATUS_LABELS[status] : "Add to library"}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="center"
          sideOffset={8}
          className="z-50 min-w-44 rounded-xl border border-border bg-surface p-1.5 shadow-lg shadow-black/5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {STATUS_ORDER.map((key) => (
            <DropdownMenu.Item
              key={key}
              onSelect={() => handleSelect(key)}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-ink outline-none transition-colors hover:bg-surface-hover focus:bg-surface-hover"
            >
              {STATUS_LABELS[key]}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
