import { prisma } from "@/lib/prisma";
import type { UserTaste } from "@/lib/gemini";

const MAX_PREVIOUS_SONGS = 30;

export async function getUserTaste(userId: string): Promise<UserTaste> {
  const [user, songs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { favoriteArtists: true } }),
    prisma.song.findMany({
      where: { playlist: { userId } },
      select: { title: true, artist: true },
      orderBy: { playlist: { createdAt: "desc" } },
      take: MAX_PREVIOUS_SONGS,
    }),
  ]);

  const seen = new Set<string>();
  const previousSongs: { title: string; artist: string }[] = [];
  for (const song of songs) {
    const key = `${song.title.toLowerCase()}|${song.artist.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      previousSongs.push(song);
    }
  }

  return { favoriteArtists: user?.favoriteArtists ?? [], previousSongs };
}
