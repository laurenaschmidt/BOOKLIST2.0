import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { getBookWithUserContext } from "@/lib/data/books";
import { BookCover } from "@/components/book-cover";
import { AddToLibraryMenu } from "@/components/add-to-library-menu";
import { PlaylistCard } from "@/components/playlist-card";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const { book, userBook, playlists } = await getBookWithUserContext(id, userId);
  if (!book) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-[220px_1fr]">
        <div className="flex flex-col gap-4">
          <BookCover src={book.coverUrl} title={book.title} className="w-full max-w-[220px]" />
          <AddToLibraryMenu googleBooksId={book.googleBooksId} initialStatus={userBook?.status} />
        </div>

        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">{book.title}</h1>
          {book.authors.length > 0 && (
            <p className="mt-1 text-lg text-ink-muted">by {book.authors.join(", ")}</p>
          )}

          {book.genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {book.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-dusty/15 px-3 py-1 text-xs font-medium text-dusty"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {book.description && (
            <p className="mt-6 max-w-2xl whitespace-pre-line leading-relaxed text-ink-muted">
              {book.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-14">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">Your playlists</h2>
          <Link
            href={`/books/${book.id}/playlists/new`}
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            New playlist
          </Link>
        </div>

        {playlists.length === 0 ? (
          <p className="mt-6 text-ink-muted">
            No playlists yet for this book. Create one to capture its mood.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                id={playlist.id}
                title={playlist.title}
                description={playlist.description}
                songCount={playlist.songs.length}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
