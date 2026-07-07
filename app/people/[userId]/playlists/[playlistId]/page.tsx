import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPlaylist } from "@/lib/data/people";
import { UserAvatar } from "@/components/user-avatar";
import { ReadOnlySongList } from "@/components/playlists/read-only-song-list";
import { LyricsTypeBadge } from "@/components/playlists/lyrics-type-badge";

export default async function PublicPlaylistPage({
  params,
}: {
  params: Promise<{ userId: string; playlistId: string }>;
}) {
  const { userId, playlistId } = await params;
  const playlist = await getPublicPlaylist(userId, playlistId);
  if (!playlist) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link href={`/people/${userId}`} className="flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-accent">
        <UserAvatar name={playlist.user.name} image={playlist.user.image} size="sm" />
        {playlist.user.name}
      </Link>

      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">{playlist.title}</h1>
      {playlist.description && <p className="mt-2 text-ink-muted">{playlist.description}</p>}
      <div className="mt-2">
        <LyricsTypeBadge lyricsType={playlist.lyricsType} />
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        for{" "}
        <Link href={`/books/${playlist.book.id}`} className="font-medium text-accent hover:text-accent-hover">
          {playlist.book.title}
        </Link>
      </p>

      <div className="mt-8">
        <ReadOnlySongList songs={playlist.songs} />
      </div>
    </div>
  );
}
