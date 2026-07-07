import Link from "next/link";
import { BookX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <BookX className="h-10 w-10 text-ink-muted" strokeWidth={1.5} />
      <h1 className="font-display text-2xl font-semibold text-ink">Page not found</h1>
      <p className="max-w-sm text-ink-muted">
        This page doesn&apos;t exist, or the book you&apos;re looking for isn&apos;t in your library.
      </p>
      <Link
        href="/library"
        className="mt-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
      >
        Back to your library
      </Link>
    </div>
  );
}
