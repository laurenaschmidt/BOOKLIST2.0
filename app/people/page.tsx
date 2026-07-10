import { auth } from "@/lib/auth";
import { getOtherUsers } from "@/lib/data/people";
import { getFollowStatusMap } from "@/lib/data/follows";
import { PeopleDirectory } from "@/components/people-directory";
import type { FollowStatus } from "@/lib/data/follows";

export default async function PeoplePage() {
  const session = await auth();
  const userId = session!.user.id;

  const [people, statusMap] = await Promise.all([getOtherUsers(userId), getFollowStatusMap(userId)]);

  const following = people.filter((p) => statusMap.get(p.id)?.following);
  const everyoneElse = people.filter((p) => !statusMap.get(p.id)?.following);
  const statuses: Record<string, FollowStatus> = Object.fromEntries(statusMap);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">People</h1>
      <p className="mt-1 text-ink-muted">See what everyone else is listening to while they read.</p>

      {people.length === 0 ? (
        <p className="mt-8 text-ink-muted">No one else has joined yet.</p>
      ) : (
        <PeopleDirectory following={following} everyoneElse={everyoneElse} statuses={statuses} />
      )}
    </div>
  );
}
