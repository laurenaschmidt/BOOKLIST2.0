"use client";

import { useState, useTransition } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import { followUserAction, unfollowUserAction } from "@/lib/actions/follows";

export function FollowButton({
  otherUserId,
  initialFollowing,
  followsYou,
}: {
  otherUserId: string;
  initialFollowing: boolean;
  followsYou?: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isHovering, setIsHovering] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !following;
    setFollowing(next);
    setIsHovering(false);
    startTransition(async () => {
      if (next) await followUserAction(otherUserId);
      else await unfollowUserAction(otherUserId);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        disabled={isPending}
        className={
          following
            ? `flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition active:scale-95 disabled:opacity-60 ${
                isHovering ? "border-accent/40 bg-accent/10 text-accent" : "border-border bg-surface text-ink"
              }`
            : "flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover active:scale-95 disabled:opacity-60"
        }
      >
        {following ? (
          <>
            <UserCheck className="h-4 w-4" />
            {isHovering ? "Unfollow" : "Following"}
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Follow
          </>
        )}
      </button>
      {followsYou && (
        <span className="rounded-full bg-dusty/15 px-2.5 py-1 text-xs font-medium text-dusty">Follows you</span>
      )}
    </div>
  );
}
