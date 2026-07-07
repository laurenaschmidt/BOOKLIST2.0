"use client";

import { useActionState } from "react";
import { createPlaylistAction } from "@/lib/actions/playlists";
import { LyricsTypeSelect } from "@/components/playlists/lyrics-type-select";

export function NewPlaylistForm({ bookId }: { bookId: string }) {
  const action = createPlaylistAction.bind(null, bookId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-ink">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Rainy afternoons in the Shire"
          className="rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-ink">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="The mood, the atmosphere, why these songs fit…"
          className="resize-none rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
        />
      </div>

      <LyricsTypeSelect />

      {state?.error && <p className="text-sm text-accent">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 self-start rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create playlist"}
      </button>
    </form>
  );
}
