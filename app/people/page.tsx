import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOtherUsers } from "@/lib/data/people";
import { getFriendshipStatusMap, getPendingReceivedRequests } from "@/lib/data/friends";
import { UserAvatar } from "@/components/user-avatar";
import { FriendButton } from "@/components/friend-button";
import { FriendRequestCard } from "@/components/friend-request-card";
import type { FriendshipStatus } from "@/lib/data/friends";

export default async function PeoplePage() {
  const session = await auth();
  const userId = session!.user.id;

  const [people, statusMap, pendingRequests] = await Promise.all([
    getOtherUsers(userId),
    getFriendshipStatusMap(userId),
    getPendingReceivedRequests(userId),
  ]);

  const pendingReceivedIds = new Set(pendingRequests.map((r) => r.senderId));
  const friends = people.filter((p) => statusMap.get(p.id)?.type === "friends");
  const everyoneElse = people.filter(
    (p) => statusMap.get(p.id)?.type !== "friends" && !pendingReceivedIds.has(p.id)
  );

  function statusFor(personId: string): FriendshipStatus {
    return statusMap.get(personId) ?? { type: "none" };
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">People</h1>
      <p className="mt-1 text-ink-muted">See what everyone else is listening to while they read.</p>

      {pendingRequests.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold text-ink">Friend requests</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map((request) => (
              <FriendRequestCard key={request.id} requestId={request.id} sender={request.sender} />
            ))}
          </div>
        </div>
      )}

      {friends.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink">Friends</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {friends.map((person) => (
              <PersonCard key={person.id} person={person} status={statusFor(person.id)} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        {friends.length > 0 && <h2 className="font-display text-xl font-semibold text-ink">Everyone else</h2>}
        {everyoneElse.length === 0 && friends.length === 0 && pendingRequests.length === 0 ? (
          <p className="mt-4 text-ink-muted">No one else has joined yet.</p>
        ) : everyoneElse.length === 0 ? (
          <p className="mt-4 text-ink-muted">That&apos;s everyone.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 sm:grid-cols-2 lg:grid-cols-3">
            {everyoneElse.map((person) => (
              <PersonCard key={person.id} person={person} status={statusFor(person.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PersonCard({
  person,
  status,
}: {
  person: { id: string; name: string; image: string | null; bio: string | null; _count: { playlists: number } };
  status: FriendshipStatus;
}) {
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
      <FriendButton otherUserId={person.id} initialStatus={status} />
    </div>
  );
}
