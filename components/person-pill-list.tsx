import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";

type Person = { id: string; name: string; image: string | null };

export function PersonPillList({ people, emptyMessage }: { people: Person[]; emptyMessage: string }) {
  if (people.length === 0) {
    return <p className="mt-4 text-ink-muted">{emptyMessage}</p>;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {people.map((person) => (
        <Link
          key={person.id}
          href={`/people/${person.id}`}
          className="group flex items-center gap-2.5 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <UserAvatar name={person.name} image={person.image} size="sm" />
          <span className="text-sm font-medium text-ink group-hover:text-accent">{person.name}</span>
        </Link>
      ))}
    </div>
  );
}
