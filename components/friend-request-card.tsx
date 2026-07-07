"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { acceptFriendRequestAction, removeFriendConnectionAction } from "@/lib/actions/friends";
import { UserAvatar } from "@/components/user-avatar";

export function FriendRequestCard({
  requestId,
  sender,
}: {
  requestId: string;
  sender: { id: string; name: string; image: string | null };
}) {
  const [isHandled, setIsHandled] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAccept() {
    startTransition(async () => {
      await acceptFriendRequestAction(requestId);
      setIsHandled(true);
    });
  }

  function handleDecline() {
    startTransition(async () => {
      await removeFriendConnectionAction(requestId);
      setIsHandled(true);
    });
  }

  if (isHandled) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <Link href={`/people/${sender.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <UserAvatar name={sender.name} image={sender.image} size="md" />
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold text-ink hover:text-accent">{sender.name}</p>
          <p className="text-xs text-ink-muted">wants to be friends</p>
        </div>
      </Link>
      <div className="flex shrink-0 gap-1.5">
        <button
          onClick={handleAccept}
          disabled={isPending}
          aria-label="Accept friend request"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={handleDecline}
          disabled={isPending}
          aria-label="Decline friend request"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
