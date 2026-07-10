"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { updateFavoriteArtistsAction } from "@/lib/actions/profile";

const MAX_ARTISTS = 15;

export function FavoriteArtistsEditor({ artists }: { artists: string[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(artists);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  function addArtist() {
    const trimmed = input.trim();
    if (!trimmed || draft.length >= MAX_ARTISTS || draft.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      setInput("");
      return;
    }
    setDraft((prev) => [...prev, trimmed]);
    setInput("");
  }

  function removeArtist(name: string) {
    setDraft((prev) => prev.filter((a) => a !== name));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addArtist();
    }
  }

  function handleSave() {
    startTransition(async () => {
      await updateFavoriteArtistsAction(draft);
      setIsEditing(false);
    });
  }

  function handleCancel() {
    setDraft(artists);
    setInput("");
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3">
        {draft.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {draft.map((artist) => (
              <span
                key={artist}
                className="flex items-center gap-1.5 rounded-full bg-dusty/15 py-1 pl-3 pr-1.5 text-sm font-medium text-dusty"
              >
                {artist}
                <button
                  type="button"
                  onClick={() => removeArtist(artist)}
                  aria-label={`Remove ${artist}`}
                  className="rounded-full p-0.5 transition-colors hover:bg-dusty/25"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add an artist…"
            maxLength={60}
            disabled={draft.length >= MAX_ARTISTS}
            className="flex-1 rounded-xl border border-border bg-canvas px-4 py-2 text-sm text-ink outline-none transition-colors focus:border-accent disabled:opacity-60"
          />
          <button
            type="button"
            onClick={addArtist}
            disabled={draft.length >= MAX_ARTISTS}
            className="flex items-center gap-1 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink transition hover:bg-surface-hover active:scale-95 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover active:scale-95 disabled:opacity-60"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-ink transition hover:bg-surface-hover active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-wrap items-center gap-2">
      {artists.length > 0 ? (
        artists.map((artist) => (
          <span key={artist} className="rounded-full bg-dusty/15 px-3 py-1.5 text-sm font-medium text-dusty">
            {artist}
          </span>
        ))
      ) : (
        <p className="text-sm text-ink-muted">No favorite artists yet.</p>
      )}
      <button
        onClick={() => setIsEditing(true)}
        aria-label="Edit favorite artists"
        className="shrink-0 rounded-full p-1 text-ink-muted opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
