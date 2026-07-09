"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { PersonCard, type Person } from "@/components/person-card";
import type { FriendshipStatus } from "@/lib/data/friends";

export function PeopleDirectory({
  friends,
  everyoneElse,
  statuses,
}: {
  friends: Person[];
  everyoneElse: Person[];
  statuses: Record<string, FriendshipStatus>;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;

  const filteredFriends = isSearching ? friends.filter((p) => p.name.toLowerCase().includes(q)) : friends;
  const filteredEveryoneElse = isSearching
    ? everyoneElse.filter((p) => p.name.toLowerCase().includes(q))
    : everyoneElse;
  const noResults = isSearching && filteredFriends.length === 0 && filteredEveryoneElse.length === 0;

  function statusFor(personId: string): FriendshipStatus {
    return statuses[personId] ?? { type: "none" };
  }

  return (
    <>
      <div className="relative mt-6 max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search people by name…"
          className="w-full rounded-xl border border-border bg-canvas py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-colors focus:border-accent"
        />
      </div>

      {noResults && <p className="mt-6 text-ink-muted">No one matches &quot;{query}&quot;.</p>}

      {filteredFriends.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold text-ink">Friends</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFriends.map((person) => (
              <PersonCard key={person.id} person={person} status={statusFor(person.id)} />
            ))}
          </div>
        </div>
      )}

      {!noResults && (filteredEveryoneElse.length > 0 || (!isSearching && friends.length > 0)) && (
        <div className="mt-10">
          {filteredFriends.length > 0 && (
            <h2 className="font-display text-xl font-semibold text-ink">Everyone else</h2>
          )}
          {filteredEveryoneElse.length === 0 ? (
            <p className="mt-4 text-ink-muted">That&apos;s everyone.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEveryoneElse.map((person) => (
                <PersonCard key={person.id} person={person} status={statusFor(person.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
