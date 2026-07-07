import Link from "next/link";
import { ListMusic } from "lucide-react";

export function PlaylistCard({
  id,
  title,
  description,
  songCount,
  bookTitle,
}: {
  id: string;
  title: string;
  description: string | null;
  songCount: number;
  bookTitle?: string;
}) {
  return (
    <Link
      href={`/playlists/${id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-2 text-dusty">
        <ListMusic className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">
          {songCount} {songCount === 1 ? "song" : "songs"}
        </span>
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-ink group-hover:text-accent">{title}</h3>
        {bookTitle && <p className="text-xs text-ink-muted">for {bookTitle}</p>}
      </div>
      {description && <p className="line-clamp-2 text-sm text-ink-muted">{description}</p>}
    </Link>
  );
}
