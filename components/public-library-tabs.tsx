"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { PublicLibraryBookCard } from "@/components/public-library-book-card";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";
import type { ReadingStatus } from "@/app/generated/prisma/enums";

export type LibraryEntry = {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
};

const TABS: { value: ReadingStatus; label: string }[] = [
  { value: "WANT_TO_READ", label: "Want to Read" },
  { value: "CURRENTLY_READING", label: "Currently Reading" },
  { value: "FINISHED", label: "Finished" },
];

export function PublicLibraryTabs({ entries }: { entries: Record<ReadingStatus, LibraryEntry[]> }) {
  return (
    <Tabs.Root defaultValue="CURRENTLY_READING" className="mt-4">
      <Tabs.List className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className="relative px-4 py-3 text-sm font-medium text-ink-muted transition-colors data-[state=active]:text-ink"
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-ink-muted">{entries[tab.value].length}</span>
            <span className="absolute inset-x-2 -bottom-px h-0.5 scale-x-0 rounded-full bg-accent transition-transform data-[state=active]:scale-x-100" />
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {TABS.map((tab) => (
        <Tabs.Content key={tab.value} value={tab.value} className="pt-8">
          {entries[tab.value].length === 0 ? (
            <p className="text-ink-muted">Nothing on this shelf yet.</p>
          ) : (
            <StaggerGrid className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {entries[tab.value].map((entry) => (
                <StaggerItem key={entry.bookId}>
                  <PublicLibraryBookCard {...entry} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
