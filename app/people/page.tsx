import { auth } from "@/lib/auth";
import { getOtherUsers } from "@/lib/data/people";
import { getFriendshipStatusMap, getPendingReceivedRequests } from "@/lib/data/friends";
import { FriendRequestCard } from "@/components/friend-request-card";
import { PeopleDirectory } from "@/components/people-directory";
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
  const statuses: Record<string, FriendshipStatus> = Object.fromEntries(statusMap);

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

      {friends.length === 0 && everyoneElse.length === 0 && pendingRequests.length === 0 ? (
        <p className="mt-8 text-ink-muted">No one else has joined yet.</p>
      ) : (
        <PeopleDirectory friends={friends} everyoneElse={everyoneElse} statuses={statuses} />
      )}
    </div>
  );
}
