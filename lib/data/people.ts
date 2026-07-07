import { prisma } from "@/lib/prisma";

export async function getOtherUsers(currentUserId: string) {
  return prisma.user.findMany({
    where: { id: { not: currentUserId } },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      _count: { select: { playlists: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getPublicProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, image: true },
  });
  if (!user) return null;

  const playlists = await prisma.playlist.findMany({
    where: { userId },
    include: { book: { select: { id: true, title: true, coverUrl: true } }, songs: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return { user, playlists };
}

export async function getPublicPlaylist(userId: string, playlistId: string) {
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
    include: {
      user: { select: { id: true, name: true, image: true } },
      book: { select: { id: true, title: true } },
      songs: { orderBy: { order: "asc" } },
    },
  });

  if (!playlist || playlist.userId !== userId) return null;
  return playlist;
}
