import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOtherUsers } from "@/lib/data/people";
import { UserAvatar } from "@/components/user-avatar";

export default async function PeoplePage() {
  const session = await auth();
  const userId = session!.user.id;

  const people = await getOtherUsers(userId);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">People</h1>
      <p className="mt-1 text-ink-muted">See what everyone else is listening to while they read.</p>

      {people.length === 0 ? (
        <p className="mt-10 text-ink-muted">No one else has joined yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => (
            <Link
              key={person.id}
              href={`/people/${person.id}`}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
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
          ))}
        </div>
      )}
    </div>
  );
}
