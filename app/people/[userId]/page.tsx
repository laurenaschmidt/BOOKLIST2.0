import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPublicProfile } from "@/lib/data/people";
import { getFriends, getFriendshipStatus } from "@/lib/data/friends";
import { UserAvatar } from "@/components/user-avatar";
import { FriendButton } from "@/components/friend-button";
import { FriendsList } from "@/components/friends-list";
import { PlaylistPreviewCard } from "@/components/playlists/playlist-preview-card";
import { PublicLibraryTabs, type LibraryEntry } from "@/components/public-library-tabs";
import type { ReadingStatus } from "@/app/generated/prisma/enums";

function toEntry(entry: { bookId: string; book: { title: string; authors: string[]; coverUrl: string | null } }): LibraryEntry {
  return {
    bookId: entry.bookId,
    title: entry.book.title,
    author: entry.book.authors.join(", "),
    coverUrl: entry.book.coverUrl,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await auth();
  const currentUserId = session!.user.id;

  const profile = await getPublicProfile(userId);
  if (!profile) notFound();

  const { user, playlists, library } = profile;
  const [friendshipStatus, friends] = await Promise.all([
    getFriendshipStatus(currentUserId, userId),
    getFriends(userId),
  ]);

  const libraryEntries: Record<ReadingStatus, LibraryEntry[]> = {
    WANT_TO_READ: library.wantToRead.map(toEntry),
    CURRENTLY_READING: library.currentlyReading.map(toEntry),
    FINISHED: library.finished.map(toEntry),
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar name={user.name} image={user.image} size="lg" />
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{user.name}</h1>
            <p className="text-sm text-ink-muted">
              {playlists.length} {playlists.length === 1 ? "playlist" : "playlists"}
            </p>
          </div>
        </div>
        <FriendButton otherUserId={user.id} initialStatus={friendshipStatus} />
      </div>

      {user.bio && <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink-muted">{user.bio}</p>}

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Library</h2>
        <PublicLibraryTabs entries={libraryEntries} />
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

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">
          Friends {friends.length > 0 && `(${friends.length})`}
        </h2>
        <FriendsList friends={friends} emptyMessage={`${user.name} hasn't added any friends yet.`} />
      </div>
    </div>
  );
}
