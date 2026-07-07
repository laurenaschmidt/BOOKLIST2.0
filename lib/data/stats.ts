import { prisma } from "@/lib/prisma";

export async function computeReadingStats(userId: string) {
  const entries = await prisma.userBook.findMany({
    where: { userId },
    include: { book: { select: { pageCount: true, genres: true } } },
  });

  const wantToRead = entries.filter((e) => e.status === "WANT_TO_READ").length;
  const currentlyReading = entries.filter((e) => e.status === "CURRENTLY_READING").length;
  const finishedEntries = entries.filter((e) => e.status === "FINISHED");

  const pagesRead = finishedEntries.reduce((sum, e) => sum + (e.book.pageCount ?? 0), 0);

  const currentYear = new Date().getFullYear();
  const finishedThisYear = finishedEntries.filter(
    (e) => e.finishedAt && e.finishedAt.getFullYear() === currentYear
  ).length;

  const genreCounts = new Map<string, number>();
  for (const entry of finishedEntries) {
    for (const genre of entry.book.genres) {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
    }
  }
  const topGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre, count]) => ({ genre, count }));

  return {
    totalBooks: entries.length,
    wantToRead,
    currentlyReading,
    finished: finishedEntries.length,
    finishedThisYear,
    pagesRead,
    topGenres,
  };
}
