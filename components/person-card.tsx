import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow-button";
import type { FollowStatus } from "@/lib/data/follows";

export type Person = {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  _count: { playlists: number };
};

export function PersonCard({ person, status }: { person: Person; status: FollowStatus }) {
  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/people/${person.id}`} className="flex items-start gap-4">
        <UserAvatar name={person.name} image={person.image} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-lg font-semibold text-ink group-hover:text-accent">
            {person.name}
          </h3>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-dusty">
            {person._count.playlists} {person._count.playlists === 1 ? "playlist" : "playlists"}
          </p>
          {person.bio && <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{person.bio}</p>}
        </div>
      </Link>
      <FollowButton otherUserId={person.id} initialFollowing={status.following} followsYou={status.followsYou} />
    </div>
  );
}
