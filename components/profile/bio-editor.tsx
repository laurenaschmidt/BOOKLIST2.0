"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { updateBioAction } from "@/lib/actions/profile";

export function BioEditor({ bio }: { bio: string | null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isEditing) {
    return (
      <form
        action={(formData) => {
          startTransition(async () => {
            await updateBioAction(formData);
            setIsEditing(false);
          });
        }}
        className="flex flex-col gap-2"
      >
        <textarea
          name="bio"
          defaultValue={bio ?? ""}
          rows={3}
          maxLength={500}
          autoFocus
          placeholder="Tell people what you like to read…"
          className="w-full resize-none rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
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
    );
  }

  return (
    <div className="group flex items-start gap-2">
      <p className="text-sm leading-relaxed text-ink-muted">
        {bio || "No bio yet."}
      </p>
      <button
        onClick={() => setIsEditing(true)}
        aria-label="Edit bio"
        className="shrink-0 rounded-full p-1 text-ink-muted opacity-100 transition-opacity hover:text-accent sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
