import { prisma } from "@/lib/prisma";
import type { GoogleBookResult } from "@/lib/google-books";
import type { ReadingStatus } from "@/app/generated/prisma/enums";

export async function findOrCreateBook(googleBook: GoogleBookResult) {
  return prisma.book.upsert({
    where: { googleBooksId: googleBook.googleBooksId },
    update: {},
    create: {
      googleBooksId: googleBook.googleBooksId,
      title: googleBook.title,
      authors: googleBook.authors,
      description: googleBook.description,
      coverUrl: googleBook.coverUrl,
      genres: googleBook.genres,
      pageCount: googleBook.pageCount,
      publishedDate: googleBook.publishedDate,
    },
  });
}

export async function getUserLibrary(userId: string) {
  const entries = await prisma.userBook.findMany({
    where: { userId },
    include: { book: true },
    orderBy: { addedAt: "desc" },
  });

  return {
    wantToRead: entries.filter((e) => e.status === "WANT_TO_READ"),
    currentlyReading: entries.filter((e) => e.status === "CURRENTLY_READING"),
    finished: entries.filter((e) => e.status === "FINISHED"),
  };
}

export async function getLibraryEntryIdsForUser(userId: string) {
  const entries = await prisma.userBook.findMany({
    where: { userId },
    select: { bookId: true, status: true },
  });
  return new Map(entries.map((e) => [e.bookId, e.status]));
}

export async function addBookToLibrary(userId: string, bookId: string, status: ReadingStatus) {
  return prisma.userBook.upsert({
    where: { userId_bookId: { userId, bookId } },
    update: { status },
    create: { userId, bookId, status },
  });
}

export async function updateLibraryStatus(userId: string, userBookId: string, status: ReadingStatus) {
  const now = new Date();
  return prisma.userBook.update({
    where: { id: userBookId, userId },
    data: {
      status,
      startedAt: status === "CURRENTLY_READING" ? now : undefined,
      finishedAt: status === "FINISHED" ? now : undefined,
    },
  });
}

export async function removeFromLibrary(userId: string, userBookId: string) {
  return prisma.userBook.delete({ where: { id: userBookId, userId } });
}

export async function getBookWithUserContext(bookId: string, userId: string) {
  const [book, userBook, playlists] = await Promise.all([
    prisma.book.findUnique({ where: { id: bookId } }),
    prisma.userBook.findUnique({ where: { userId_bookId: { userId, bookId } } }),
    prisma.playlist.findMany({
      where: { bookId, userId },
      include: { songs: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { book, userBook, playlists };
}
