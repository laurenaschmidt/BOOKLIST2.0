"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Pause, Play, Plus, Sparkles } from "lucide-react";
import { addAiSongAction, generateSongSuggestionsAction } from "@/lib/actions/ai-playlist";
import { useAudioPreview } from "@/components/playlists/use-audio-preview";
import type { EnrichedSongSuggestion } from "@/lib/ai-playlist";

function songKey(song: EnrichedSongSuggestion) {
  return `${song.title}|${song.artist}`;
}

export function AiSongRecommendations({ playlistId }: { playlistId: string }) {
  const [suggestions, setSuggestions] = useState<EnrichedSongSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { playingId, toggle } = useAudioPreview();

  async function handleGetSuggestions() {
    setIsLoading(true);
    setError(null);
    const result = await generateSongSuggestionsAction(playlistId);
    if (result.ok) {
      setSuggestions(result.suggestions);
    } else {
      setError(result.error);
      setSuggestions(null);
    }
    setIsLoading(false);
  }

  function handleAdd(song: EnrichedSongSuggestion) {
    startTransition(async () => {
      await addAiSongAction(playlistId, song);
      setAddedKeys((prev) => new Set(prev).add(songKey(song)));
    });
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          AI song recommendations
        </p>
        <button
          type="button"
          onClick={handleGetSuggestions}
          disabled={isLoading}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-hover disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {suggestions ? "Get new ideas" : "Get suggestions"}
        </button>
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      {suggestions && suggestions.length === 0 && !error && (
        <p className="text-sm text-ink-muted">No new suggestions right now — try again in a bit.</p>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
          {suggestions.map((song) => {
            const key = songKey(song);
            const isPlaying = playingId === key;
            const isAdded = addedKeys.has(key);
            return (
              <div key={key} className="flex items-start gap-3 bg-surface px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => toggle(key, song.previewUrl)}
                  disabled={!song.previewUrl}
                  aria-label={isPlaying ? "Pause preview" : "Play preview"}
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-ink-muted transition-colors enabled:hover:text-accent disabled:opacity-30"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>

                {song.albumArtUrl ? (
                  <Image
                    src={song.albumArtUrl}
                    alt={song.title}
                    width={36}
                    height={36}
                    className="mt-0.5 h-9 w-9 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="mt-0.5 h-9 w-9 shrink-0 rounded-md bg-surface-hover" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{song.title}</p>
                  <p className="truncate text-xs text-ink-muted">{song.artist}</p>
                  <p className="mt-0.5 text-xs italic text-ink-muted/80">{song.reason}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdd(song)}
                  disabled={isPending || isAdded}
                  className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
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
