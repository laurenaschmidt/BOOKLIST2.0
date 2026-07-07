import { auth } from "@/lib/auth";
import { getUserLibrary } from "@/lib/data/books";
import { LibraryTabs, type LibraryEntry } from "@/components/library-tabs";
import type { ReadingStatus } from "@/app/generated/prisma/enums";

function toEntry(entry: { id: string; bookId: string; status: ReadingStatus; book: { title: string; authors: string[]; coverUrl: string | null } }): LibraryEntry {
  return {
    userBookId: entry.id,
    bookId: entry.bookId,
    title: entry.book.title,
    author: entry.book.authors.join(", "),
    coverUrl: entry.book.coverUrl,
    status: entry.status,
  };
}

export default async function LibraryPage() {
  const session = await auth();
  const userId = session!.user.id;

  const { wantToRead, currentlyReading, finished } = await getUserLibrary(userId);

  const entries: Record<ReadingStatus, LibraryEntry[]> = {
    WANT_TO_READ: wantToRead.map(toEntry),
    CURRENTLY_READING: currentlyReading.map(toEntry),
    FINISHED: finished.map(toEntry),
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Your library</h1>
      <p className="mt-1 text-ink-muted">Everything you&apos;re reading, want to read, and have finished.</p>
      <LibraryTabs entries={entries} />
    </div>
  );
}
