import { BookOpen, BookMarked, CheckCircle2, Library } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeReadingStats } from "@/lib/data/stats";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { BioEditor } from "@/components/profile/bio-editor";

export default async function ProfilePage() {
  const session = await auth();
  const userId = session!.user.id;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, email: true, image: true, bio: true, createdAt: true },
  });
  const stats = await computeReadingStats(userId);

  const statCards = [
    { label: "Currently reading", value: stats.currentlyReading, icon: BookOpen },
    { label: "Want to read", value: stats.wantToRead, icon: BookMarked },
    { label: "Finished", value: stats.finished, icon: CheckCircle2 },
    { label: "Pages read", value: stats.pagesRead.toLocaleString(), icon: Library },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        <AvatarUploader name={user.name} image={user.image} />
        <div className="flex-1">
          <h1 className="font-display text-2xl font-semibold text-ink">{user.name}</h1>
          <p className="text-sm text-ink-muted">{user.email}</p>
          <div className="mt-3">
            <BioEditor bio={user.bio} />
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-surface p-5 text-center shadow-sm">
            <stat.icon className="mx-auto h-5 w-5 text-accent" strokeWidth={1.5} />
            <p className="mt-2 font-display text-2xl font-semibold text-ink">{stat.value}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {stats.topGenres.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink">Favorite genres</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {stats.topGenres.map(({ genre, count }) => (
              <span
                key={genre}
                className="rounded-full bg-dusty/15 px-3 py-1.5 text-sm font-medium text-dusty"
              >
                {genre} · {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {stats.finishedThisYear > 0 && (
        <p className="mt-10 text-sm text-ink-muted">
          You&apos;ve finished <span className="font-semibold text-ink">{stats.finishedThisYear}</span>{" "}
          {stats.finishedThisYear === 1 ? "book" : "books"} this year.
        </p>
      )}
    </div>
  );
}
