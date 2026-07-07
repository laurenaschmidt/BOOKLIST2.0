import Link from "next/link";
import { ListMusic } from "lucide-react";
import { BookCover } from "@/components/book-cover";
import { LyricsTypeBadge } from "@/components/playlists/lyrics-type-badge";
import type { LyricsType } from "@/app/generated/prisma/enums";

export function PlaylistPreviewCard({
  href,
  title,
  songCount,
  bookTitle,
  bookCoverUrl,
  lyricsType,
}: {
  href: string;
  title: string;
  songCount: number;
  bookTitle: string;
  bookCoverUrl: string | null;
  lyricsType?: LyricsType | null;
}) {
  return (
    <Link
      href={href}
      className="group flex gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <BookCover src={bookCoverUrl} title={bookTitle} className="w-20 shrink-0" />
      <div className="flex min-w-0 flex-col justify-center gap-1">
        <div className="flex items-center gap-1.5 text-dusty">
          <ListMusic className="h-3.5 w-3.5" />
          <span className="text-xs font-medium uppercase tracking-wide">
            {songCount} {songCount === 1 ? "song" : "songs"}
          </span>
        </div>
        <h3 className="truncate font-display text-lg font-semibold text-ink group-hover:text-accent">{title}</h3>
        <p className="truncate text-xs text-ink-muted">for {bookTitle}</p>
        <div className="mt-0.5">
          <LyricsTypeBadge lyricsType={lyricsType ?? null} />
        </div>
      </div>
    </Link>
  );
}
