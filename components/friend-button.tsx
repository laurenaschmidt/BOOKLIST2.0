"use client";

import { useState, useTransition } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, UserPlus, X } from "lucide-react";
import {
  acceptFriendRequestAction,
  removeFriendConnectionAction,
  sendFriendRequestAction,
} from "@/lib/actions/friends";
import type { FriendshipStatus } from "@/lib/data/friends";

export function FriendButton({
  otherUserId,
  initialStatus,
}: {
  otherUserId: string;
  initialStatus: FriendshipStatus;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  if (status.type === "self") return null;

  function handleAdd() {
    startTransition(async () => {
      const result = await sendFriendRequestAction(otherUserId);
      if (result) setStatus({ type: result.status, requestId: result.requestId });
    });
  }

  function handleAccept(requestId: string) {
    startTransition(async () => {
      await acceptFriendRequestAction(requestId);
      setStatus({ type: "friends", requestId });
    });
  }

  function handleRemove(requestId: string) {
    startTransition(async () => {
      await removeFriendConnectionAction(requestId);
      setStatus({ type: "none" });
    });
  }

  if (status.type === "none") {
    return (
      <button
        onClick={handleAdd}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover active:scale-95 disabled:opacity-60"
      >
        <UserPlus className="h-4 w-4" />
        Add Friend
      </button>
    );
  }

  if (status.type === "pending_sent") {
    return (
      <button
        onClick={() => handleRemove(status.requestId)}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-ink-muted transition hover:text-accent active:scale-95 disabled:opacity-60"
      >
        Request sent
        <X className="h-3.5 w-3.5" />
      </button>
    );
  }

  if (status.type === "pending_received") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAccept(status.requestId)}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover active:scale-95 disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          Accept
        </button>
        <button
          onClick={() => handleRemove(status.requestId)}
          disabled={isPending}
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-ink-muted transition hover:text-accent active:scale-95 disabled:opacity-60"
        >
          Decline
        </button>
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-full bg-sage/20 px-4 py-2 text-sm font-medium text-sage transition active:scale-95 disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          Friends
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="center"
          sideOffset={8}
          className="z-50 min-w-40 rounded-xl border border-border bg-surface p-1.5 shadow-lg shadow-black/5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <DropdownMenu.Item
            onSelect={() => handleRemove(status.requestId)}
            className="cursor-pointer rounded-lg px-3 py-2 text-sm text-ink outline-none transition-colors hover:bg-surface-hover focus:bg-surface-hover"
          >
            Unfriend
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
