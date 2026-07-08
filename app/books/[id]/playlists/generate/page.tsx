import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GeneratePlaylistReview } from "@/components/playlists/generate-playlist-review";

export default async function GeneratePlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await prisma.book.findUnique({ where: { id }, select: { id: true, title: true } });
  if (!book) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Generate with AI</h1>
      <p className="mt-1 text-ink-muted">for {book.title}</p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <GeneratePlaylistReview bookId={book.id} bookTitle={book.title} />
      </div>
    </div>
  );
}
