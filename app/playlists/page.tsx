import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlaylistPreviewCard } from "@/components/playlists/playlist-preview-card";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";

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
        <StaggerGrid className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <StaggerItem key={playlist.id}>
              <PlaylistPreviewCard
                href={`/playlists/${playlist.id}`}
                title={playlist.title}
                songCount={playlist.songs.length}
                bookTitle={playlist.book.title}
                bookCoverUrl={playlist.book.coverUrl}
                lyricsType={playlist.lyricsType}
              />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
