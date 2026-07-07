import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlaylistManager } from "@/components/playlists/playlist-manager";

export default async function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: { book: { select: { id: true, title: true } }, songs: { orderBy: { order: "asc" } } },
  });

  if (!playlist || playlist.userId !== userId) notFound();

  return (
    <PlaylistManager
      playlistId={playlist.id}
      bookId={playlist.book.id}
      bookTitle={playlist.book.title}
      title={playlist.title}
      description={playlist.description}
      lyricsType={playlist.lyricsType}
      songs={playlist.songs}
    />
  );
}
