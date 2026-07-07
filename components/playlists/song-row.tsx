"use client";

import Image from "next/image";
import { Music2, Pause, Play, X } from "lucide-react";

type Song = {
  id: string;
  title: string;
  artist: string;
  url: string | null;
  albumArtUrl: string | null;
  previewUrl: string | null;
};

export function SongRow({
  song,
  index,
  isPlaying,
  onTogglePreview,
  onRemove,
}: {
  song: Song;
  index: number;
  isPlaying: boolean;
  onTogglePreview: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
      <span className="w-5 shrink-0 text-center text-xs text-ink-muted">{index + 1}</span>
      {song.previewUrl ? (
        <button
          type="button"
          onClick={onTogglePreview}
          aria-label={isPlaying ? "Pause preview" : "Play preview"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-dusty transition-colors hover:text-accent"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      ) : (
        <Music2 className="h-4 w-4 shrink-0 text-dusty" />
      )}
      {song.albumArtUrl && (
        <Image
          src={song.albumArtUrl}
          alt={song.title}
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-md object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        {song.url ? (
          <a
            href={song.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-medium text-ink hover:text-accent"
          >
            {song.title}
          </a>
        ) : (
          <p className="truncate text-sm font-medium text-ink">{song.title}</p>
        )}
        <p className="truncate text-xs text-ink-muted">{song.artist}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${song.title}`}
          className="shrink-0 rounded-full p-1.5 text-ink-muted opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
