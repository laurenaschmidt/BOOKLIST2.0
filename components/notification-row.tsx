import Link from "next/link";
import { Sparkles, UserPlus } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { formatRelativeTime } from "@/lib/utils";

type Notification = {
  id: string;
  type: "NEW_FOLLOWER" | "NEW_PLAYLIST";
  read: boolean;
  createdAt: Date;
  actor: { id: string; name: string; image: string | null };
  playlist: { id: string; title: string; book: { title: string } } | null;
};

export function NotificationRow({ notification }: { notification: Notification }) {
  const href =
    notification.type === "NEW_PLAYLIST" && notification.playlist
      ? `/people/${notification.actor.id}/playlists/${notification.playlist.id}`
      : `/people/${notification.actor.id}`;

  return (
    <Link
      href={href}
      className={`flex items-start gap-3 rounded-2xl border p-4 shadow-sm transition-colors hover:bg-surface-hover ${
        notification.read ? "border-border bg-surface" : "border-accent/30 bg-accent/5"
      }`}
    >
      <UserAvatar name={notification.actor.name} image={notification.actor.image} size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink">
          <span className="font-semibold">{notification.actor.name}</span>{" "}
          {notification.type === "NEW_FOLLOWER" ? (
            "started following you"
          ) : (
            <>
              created a playlist{" "}
              <span className="font-medium">&ldquo;{notification.playlist?.title}&rdquo;</span> for{" "}
              {notification.playlist?.book.title}
            </>
          )}
        </p>
        <p className="mt-0.5 text-xs text-ink-muted">{formatRelativeTime(notification.createdAt)}</p>
      </div>
      <div className="mt-0.5 shrink-0 text-dusty">
        {notification.type === "NEW_FOLLOWER" ? (
          <UserPlus className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>
    </Link>
  );
}
