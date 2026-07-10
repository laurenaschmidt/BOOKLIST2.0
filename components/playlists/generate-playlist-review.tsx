"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2, Music2, Pause, Play, RefreshCw, Sparkles } from "lucide-react";
import {
  createAiPlaylistAction,
  generateAiPlaylistAction,
  type GeneratedAiPlaylist,
} from "@/lib/actions/ai-playlist";
import { useAudioPreview } from "@/components/playlists/use-audio-preview";
import { staggerContainerVariants, staggerItemVariants } from "@/components/motion/stagger-grid";
import type { LyricsType } from "@/app/generated/prisma/enums";

const LYRICS_OPTIONS: { value: LyricsType; label: string }[] = [
  { value: "LYRICAL", label: "Has lyrics" },
  { value: "INSTRUMENTAL", label: "Instrumental" },
  { value: "MIXED", label: "Mixed" },
];

function LyricsPreferencePicker({
  value,
  onChange,
}: {
  value: LyricsType;
  onChange: (value: LyricsType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {LYRICS_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
            value === option.value
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border text-ink-muted hover:text-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function GeneratePlaylistReview({ bookId, bookTitle }: { bookId: string; bookTitle: string }) {
  const [status, setStatus] = useState<"setup" | "loading" | "ready" | "error">("setup");
  const [error, setError] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<GeneratedAiPlaylist | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [lyricsPreference, setLyricsPreference] = useState<LyricsType>("MIXED");
  const [isPending, startTransition] = useTransition();
  const { playingId, toggle } = useAudioPreview();

  async function generate() {
    setStatus("loading");
    setError(null);
    const result = await generateAiPlaylistAction(bookId, lyricsPreference);
    if (result.ok) {
      setPlaylist(result.playlist);
      setTitle(result.playlist.title);
      setDescription(result.playlist.description);
      setSelected(new Set(result.playlist.songs.map((_, index) => index)));
      setStatus("ready");
    } else {
      setError(result.error);
      setStatus("error");
    }
  }

  function toggleSong(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleCreate() {
    if (!playlist) return;
    const chosenSongs = playlist.songs.filter((_, index) => selected.has(index));
    startTransition(async () => {
      await createAiPlaylistAction(bookId, title, description, chosenSongs, lyricsPreference);
    });
  }

  if (status === "setup") {
    return (
      <div className="flex flex-col gap-6 py-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink">What kind of sound?</p>
          <LyricsPreferencePicker value={lyricsPreference} onChange={setLyricsPreference} />
        </div>
        <button
          type="button"
          onClick={generate}
          className="flex items-center justify-center gap-1.5 self-start rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover active:scale-95"
        >
          <Sparkles className="h-4 w-4" />
          Generate playlist
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 py-20 text-center"
      >
        <motion.span
          animate={{ scale: [1, 1.25, 1], rotate: [0, 20, -20, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="h-7 w-7 text-accent" />
        </motion.span>
        <p className="text-ink-muted">Reading between the lines of {bookTitle}…</p>
      </motion.div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-accent">{error}</p>
        <button
          type="button"
          onClick={generate}
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface-hover active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  if (!playlist) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-xl border border-border bg-canvas px-4 py-2 font-display text-2xl font-semibold text-ink outline-none focus:border-accent"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          className="resize-none rounded-xl border border-border bg-canvas px-4 py-2 text-sm text-ink outline-none focus:border-accent"
        />
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink">
            {selected.size} of {playlist.songs.length} songs selected
          </p>
          <div className="flex items-center gap-3">
            <LyricsPreferencePicker value={lyricsPreference} onChange={setLyricsPreference} />
            <button
              type="button"
              onClick={generate}
              className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-ink-muted transition hover:text-ink active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          </div>
        </div>

        <motion.div
          key={playlist.songs.map((s) => s.title).join("|")}
          variants={staggerContainerVariants}
          initial="hidden"
          animate="show"
          className="mt-3 flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border"
        >
          {playlist.songs.map((song, index) => {
            const key = `${song.title}|${song.artist}`;
            const isPlaying = playingId === key;
            const isSelected = selected.has(index);
            return (
              <motion.label
                key={key}
                variants={staggerItemVariants}
                className={`flex cursor-pointer items-start gap-3 bg-surface px-3 py-2.5 transition-opacity ${
                  isSelected ? "" : "opacity-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSong(index)}
                  className="mt-2.5 h-4 w-4 shrink-0 accent-accent"
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    toggle(key, song.previewUrl);
                  }}
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
                  <div className="mt-2.5 flex h-4 w-9 shrink-0 items-center justify-center">
                    <Music2 className="h-4 w-4 text-dusty" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{song.title}</p>
                  <p className="truncate text-xs text-ink-muted">{song.artist}</p>
                  <p className="mt-0.5 text-xs italic text-ink-muted/80">{song.reason}</p>
                </div>
              </motion.label>
            );
          })}
        </motion.div>
      </div>

      <button
        type="button"
        onClick={handleCreate}
        disabled={isPending || selected.size === 0 || !title.trim()}
        className="flex items-center justify-center gap-1.5 self-start rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover active:scale-95 disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Create playlist
      </button>
    </div>
  );
}
