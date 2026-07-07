import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/data/people";
import { UserAvatar } from "@/components/user-avatar";
import { PlaylistPreviewCard } from "@/components/playlists/playlist-preview-card";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const profile = await getPublicProfile(userId);
  if (!profile) notFound();

  const { user, playlists } = profile;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="flex items-center gap-4">
        <UserAvatar name={user.name} image={user.image} size="lg" />
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{user.name}</h1>
          <p className="text-sm text-ink-muted">
            {playlists.length} {playlists.length === 1 ? "playlist" : "playlists"}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Playlists</h2>

        {playlists.length === 0 ? (
          <p className="mt-4 text-ink-muted">{user.name} hasn&apos;t made any playlists yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <PlaylistPreviewCard
                key={playlist.id}
                href={`/people/${user.id}/playlists/${playlist.id}`}
                title={playlist.title}
                songCount={playlist.songs.length}
                bookTitle={playlist.book.title}
                bookCoverUrl={playlist.book.coverUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
