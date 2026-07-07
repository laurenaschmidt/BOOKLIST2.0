"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Music2, Pause, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import {
  addSongAction,
  deletePlaylistAction,
  removeSongAction,
  updatePlaylistDetailsAction,
} from "@/lib/actions/playlists";
import { ITunesSongSearch } from "@/components/playlists/itunes-song-search";
import { useAudioPreview } from "@/components/playlists/use-audio-preview";

type Song = {
  id: string;
  title: string;
  artist: string;
  url: string | null;
  albumArtUrl: string | null;
  previewUrl: string | null;
};

export function PlaylistManager({
  playlistId,
  bookId,
  bookTitle,
  title,
  description,
  songs,
}: {
  playlistId: string;
  bookId: string;
  bookTitle: string;
  title: string;
  description: string | null;
  songs: Song[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { playingId, toggle } = useAudioPreview();

  const updateDetails = updatePlaylistDetailsAction.bind(null, playlistId);
  const addSong = addSongAction.bind(null, playlistId);

  function handleAddSong(formData: FormData) {
    startTransition(async () => {
      await addSong(formData);
    });
  }

  function handleRemoveSong(songId: string) {
    startTransition(() => removeSongAction(playlistId, songId));
  }

  function handleDelete() {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    startTransition(() => deletePlaylistAction(playlistId));
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link href={`/books/${bookId}`} className="text-sm font-medium text-ink-muted hover:text-accent">
        ← {bookTitle}
      </Link>

      <div className="mt-3 flex items-start justify-between gap-4">
        {isEditing ? (
          <form
            action={(formData) => {
              startTransition(async () => {
                await updateDetails(formData);
                setIsEditing(false);
              });
            }}
            className="flex w-full flex-col gap-3"
          >
            <input
              name="title"
              defaultValue={title}
              required
              className="rounded-xl border border-border bg-canvas px-4 py-2 font-display text-2xl font-semibold text-ink outline-none focus:border-accent"
            />
            <textarea
              name="description"
              defaultValue={description ?? ""}
              rows={2}
              placeholder="Describe the mood…"
              className="resize-none rounded-xl border border-border bg-canvas px-4 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-ink hover:bg-surface-hover"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
            {description && <p className="mt-2 text-ink-muted">{description}</p>}
          </div>
        )}

        {!isEditing && (
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={() => setIsEditing(true)}
              aria-label="Edit playlist"
              className="rounded-full border border-border p-2 text-ink-muted transition-colors hover:text-ink"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              aria-label="Delete playlist"
              className="rounded-full border border-border p-2 text-ink-muted transition-colors hover:border-accent hover:text-accent"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-2">
        {songs.length === 0 ? (
          <p className="text-ink-muted">No songs yet. Add the first track below.</p>
        ) : (
          songs.map((song, index) => {
            const isPlaying = playingId === song.id;
            return (
              <div
                key={song.id}
                className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
              >
                <span className="w-5 shrink-0 text-center text-xs text-ink-muted">{index + 1}</span>
                {song.previewUrl ? (
                  <button
                    type="button"
                    onClick={() => toggle(song.id, song.previewUrl)}
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
                <button
                  onClick={() => handleRemoveSong(song.id)}
                  aria-label={`Remove ${song.title}`}
                  className="shrink-0 rounded-full p-1.5 text-ink-muted opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm font-medium text-ink">Add a song</p>
        <ITunesSongSearch playlistId={playlistId} />

        <button
          type="button"
          onClick={() => setShowManualEntry((prev) => !prev)}
          className="flex items-center gap-1 self-start text-xs font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showManualEntry ? "rotate-180" : ""}`} />
          {showManualEntry ? "Hide manual entry" : "Can't find it? Add manually"}
        </button>

        {showManualEntry && (
          <form action={handleAddSong} className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                name="title"
                placeholder="Song title"
                required
                className="rounded-xl border border-border bg-canvas px-4 py-2 text-sm text-ink outline-none focus:border-accent"
              />
              <input
                name="artist"
                placeholder="Artist"
                required
                className="rounded-xl border border-border bg-canvas px-4 py-2 text-sm text-ink outline-none focus:border-accent"
              />
            </div>
            <input
              name="url"
              placeholder="Link (optional) — Spotify, YouTube, etc."
              className="rounded-xl border border-border bg-canvas px-4 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center gap-1.5 self-start rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-hover disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Add song
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
