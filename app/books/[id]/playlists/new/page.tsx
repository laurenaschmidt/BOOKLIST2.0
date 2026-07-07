import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewPlaylistForm } from "@/components/playlists/new-playlist-form";

export default async function NewPlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await prisma.book.findUnique({ where: { id }, select: { id: true, title: true } });
  if (!book) notFound();

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">New playlist</h1>
      <p className="mt-1 text-ink-muted">for {book.title}</p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <NewPlaylistForm bookId={book.id} />
      </div>
    </div>
  );
}
