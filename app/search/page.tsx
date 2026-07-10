import Link from "next/link";
import { Search as SearchIcon, TriangleAlert } from "lucide-react";
import { auth } from "@/lib/auth";
import { searchBooks, GoogleBooksApiError } from "@/lib/google-books";
import { getLibraryEntryIdsForUser, findOrCreateBook } from "@/lib/data/books";
import { BookCover } from "@/components/book-cover";
import { AddToLibraryMenu } from "@/components/add-to-library-menu";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await auth();
  const userId = session!.user.id;

  let results: Awaited<ReturnType<typeof searchBooks>> = [];
  let searchError: string | null = null;
  if (q) {
    try {
      results = await searchBooks(q);
    } catch (error) {
      searchError =
        error instanceof GoogleBooksApiError
          ? error.message
          : "Something went wrong searching for books. Try again in a moment.";
    }
  }

  // Cache every result locally so each has a stable id to link to and add from.
  const cachedBooks = await Promise.all(results.map((book) => findOrCreateBook(book)));
  const bookIdByGoogleId = new Map(cachedBooks.map((b) => [b.googleBooksId, b.id]));
  const libraryStatusByBookId = await getLibraryEntryIdsForUser(userId);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Search books</h1>
      <p className="mt-1 text-ink-muted">Find a book and add it to your library.</p>

      <form method="GET" className="relative mt-6 max-w-xl">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by title, author, or ISBN…"
          className="w-full rounded-full border border-border bg-surface py-3 pl-11 pr-4 text-sm text-ink outline-none transition-colors focus:border-accent"
        />
      </form>

      {searchError && (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm text-accent">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{searchError}</p>
        </div>
      )}

      {q && !searchError && results.length === 0 && (
        <p className="mt-10 text-ink-muted">No books found for &ldquo;{q}&rdquo;.</p>
      )}

      <StaggerGrid className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {results.map((book) => {
          const localBookId = bookIdByGoogleId.get(book.googleBooksId)!;
          const initialStatus = libraryStatusByBookId.get(localBookId);

          return (
            <StaggerItem key={book.googleBooksId} className="flex flex-col gap-3">
              <Link href={`/books/${localBookId}`}>
                <BookCover src={book.coverUrl} title={book.title} />
              </Link>
              <div>
                <p className="line-clamp-2 text-sm font-medium text-ink">{book.title}</p>
                <p className="line-clamp-1 text-xs text-ink-muted">{book.authors.join(", ")}</p>
              </div>
              <AddToLibraryMenu googleBooksId={book.googleBooksId} initialStatus={initialStatus} />
            </StaggerItem>
          );
        })}
      </StaggerGrid>
    </div>
  );
}
