"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Pause, Play, Plus, Search } from "lucide-react";
import { addITunesSongAction } from "@/lib/actions/playlists";
import { useAudioPreview } from "@/components/playlists/use-audio-preview";
import type { ITunesTrackResult } from "@/lib/itunes";

export function ITunesSongSearch({ playlistId }: { playlistId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ITunesTrackResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const abortRef = useRef<AbortController | null>(null);
  const { playingId, toggle } = useAudioPreview();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const timeout = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsSearching(true);
      setError(null);
      try {
        const res = await fetch(`/api/itunes/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Search failed");
        setResults(data.tracks ?? []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  function handleAdd(track: ITunesTrackResult) {
    startTransition(async () => {
      await addITunesSongAction(playlistId, track);
      setAddedIds((prev) => new Set(prev).add(track.trackId));
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for a song…"
          className="w-full rounded-xl border border-border bg-canvas py-2.5 pl-10 pr-9 text-sm text-ink outline-none transition-colors focus:border-accent"
        />
        {isSearching && (
          <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-muted" />
        )}
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      {results.length > 0 && (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
          {results.map((track) => {
            const isPlaying = playingId === String(track.trackId);
            const isAdded = addedIds.has(track.trackId);
            return (
              <div key={track.trackId} className="flex items-center gap-3 bg-surface px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => toggle(String(track.trackId), track.previewUrl)}
                  disabled={!track.previewUrl}
                  aria-label={isPlaying ? "Pause preview" : "Play preview"}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-ink-muted transition-colors enabled:hover:text-accent disabled:opacity-30"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>

                {track.albumArtUrl ? (
                  <Image
                    src={track.albumArtUrl}
                    alt={track.title}
                    width={36}
                    height={36}
                    className="h-9 w-9 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 shrink-0 rounded-md bg-surface-hover" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{track.title}</p>
                  <p className="truncate text-xs text-ink-muted">{track.artist}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdd(track)}
                  disabled={isPending || isAdded}
                  className="flex shrink-0 items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
                >
                  {isAdded ? (
                    "Added"
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
