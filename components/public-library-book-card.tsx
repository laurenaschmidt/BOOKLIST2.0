import Link from "next/link";
import { BookCover } from "@/components/book-cover";

export function PublicLibraryBookCard({
  bookId,
  title,
  author,
  coverUrl,
}: {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Link href={`/books/${bookId}`}>
        <BookCover src={coverUrl} title={title} />
      </Link>
      <div>
        <Link href={`/books/${bookId}`} className="line-clamp-2 text-sm font-medium text-ink hover:text-accent">
          {title}
        </Link>
        <p className="line-clamp-1 text-xs text-ink-muted">{author}</p>
      </div>
    </div>
  );
}
