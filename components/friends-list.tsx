import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";

type Friend = { id: string; name: string; image: string | null };

export function FriendsList({ friends, emptyMessage }: { friends: Friend[]; emptyMessage: string }) {
  if (friends.length === 0) {
    return <p className="mt-4 text-ink-muted">{emptyMessage}</p>;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {friends.map((friend) => (
        <Link
          key={friend.id}
          href={`/people/${friend.id}`}
          className="group flex items-center gap-2.5 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <UserAvatar name={friend.name} image={friend.image} size="sm" />
          <span className="text-sm font-medium text-ink group-hover:text-accent">{friend.name}</span>
        </Link>
      ))}
    </div>
  );
}
