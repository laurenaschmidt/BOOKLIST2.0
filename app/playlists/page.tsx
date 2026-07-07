import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookCover } from "@/components/book-cover";
import { ListMusic } from "lucide-react";

export default async function PlaylistsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const playlists = await prisma.playlist.findMany({
    where: { userId },
    include: { book: { select: { id: true, title: true, coverUrl: true } }, songs: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Your playlists</h1>
      <p className="mt-1 text-ink-muted">Every soundtrack you&apos;ve built, across every book.</p>

      {playlists.length === 0 ? (
        <p className="mt-10 text-ink-muted">
          You haven&apos;t made a playlist yet. Open a book from your{" "}
          <Link href="/library" className="font-medium text-accent hover:text-accent-hover">
            library
          </Link>{" "}
          to start one.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/playlists/${playlist.id}`}
              className="group flex gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <BookCover
                src={playlist.book.coverUrl}
                title={playlist.book.title}
                className="w-20 shrink-0"
              />
              <div className="flex min-w-0 flex-col justify-center gap-1">
                <div className="flex items-center gap-1.5 text-dusty">
                  <ListMusic className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
                  </span>
                </div>
                <h3 className="truncate font-display text-lg font-semibold text-ink group-hover:text-accent">
                  {playlist.title}
                </h3>
                <p className="truncate text-xs text-ink-muted">for {playlist.book.title}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
