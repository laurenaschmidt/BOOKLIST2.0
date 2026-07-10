"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { PersonCard, type Person } from "@/components/person-card";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";
import type { FollowStatus } from "@/lib/data/follows";

export function PeopleDirectory({
  following,
  everyoneElse,
  statuses,
}: {
  following: Person[];
  everyoneElse: Person[];
  statuses: Record<string, FollowStatus>;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;

  const filteredFollowing = isSearching ? following.filter((p) => p.name.toLowerCase().includes(q)) : following;
  const filteredEveryoneElse = isSearching
    ? everyoneElse.filter((p) => p.name.toLowerCase().includes(q))
    : everyoneElse;
  const noResults = isSearching && filteredFollowing.length === 0 && filteredEveryoneElse.length === 0;

  function statusFor(personId: string): FollowStatus {
    return statuses[personId] ?? { following: false, followsYou: false };
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

      {filteredFollowing.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold text-ink">Following</h2>
          <StaggerGrid className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFollowing.map((person) => (
              <StaggerItem key={person.id}>
                <PersonCard person={person} status={statusFor(person.id)} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      )}

      {!noResults && (filteredEveryoneElse.length > 0 || (!isSearching && following.length > 0)) && (
        <div className="mt-10">
          {filteredFollowing.length > 0 && (
            <h2 className="font-display text-xl font-semibold text-ink">Everyone else</h2>
          )}
          {filteredEveryoneElse.length === 0 ? (
            <p className="mt-4 text-ink-muted">That&apos;s everyone.</p>
          ) : (
            <StaggerGrid className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEveryoneElse.map((person) => (
                <StaggerItem key={person.id}>
                  <PersonCard person={person} status={statusFor(person.id)} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}
        </div>
      )}
    </>
  );
}
