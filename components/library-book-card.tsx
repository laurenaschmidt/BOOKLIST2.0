"use client";

import { useTransition } from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Trash2 } from "lucide-react";
import { updateStatusAction, removeFromLibraryAction } from "@/lib/actions/library";
import { BookCover } from "@/components/book-cover";
import type { ReadingStatus } from "@/app/generated/prisma/enums";

const STATUS_LABELS: Record<ReadingStatus, string> = {
  WANT_TO_READ: "Want to Read",
  CURRENTLY_READING: "Currently Reading",
  FINISHED: "Finished",
};

const STATUS_ORDER: ReadingStatus[] = ["WANT_TO_READ", "CURRENTLY_READING", "FINISHED"];

export function LibraryBookCard({
  userBookId,
  bookId,
  title,
  author,
  coverUrl,
  status,
}: {
  userBookId: string;
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  status: ReadingStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(next: ReadingStatus) {
    startTransition(() => updateStatusAction(userBookId, next));
  }

  function handleRemove() {
    if (!confirm(`Remove "${title}" from your library?`)) return;
    startTransition(() => removeFromLibraryAction(userBookId));
  }

  return (
    <div className="group flex flex-col gap-3">
      <Link href={`/books/${bookId}`}>
        <BookCover src={coverUrl} title={title} />
      </Link>
      <div>
        <Link href={`/books/${bookId}`} className="line-clamp-2 text-sm font-medium text-ink hover:text-accent">
          {title}
        </Link>
        <p className="line-clamp-1 text-xs text-ink-muted">{author}</p>
      </div>

      <div className="flex items-center gap-1.5">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface-hover disabled:opacity-60"
            >
              {STATUS_LABELS[status]}
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="center"
              sideOffset={8}
              className="z-50 min-w-40 rounded-xl border border-border bg-surface p-1.5 shadow-lg shadow-black/5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
            >
              {STATUS_ORDER.map((key) => (
                <DropdownMenu.Item
                  key={key}
                  onSelect={() => handleStatusChange(key)}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm text-ink outline-none transition-colors hover:bg-surface-hover focus:bg-surface-hover"
                >
                  {STATUS_LABELS[key]}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <button
          onClick={handleRemove}
          disabled={isPending}
          aria-label="Remove from library"
          className="rounded-full border border-border bg-surface p-2 text-ink-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
