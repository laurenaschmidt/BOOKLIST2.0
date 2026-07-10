import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPublicProfile } from "@/lib/data/people";
import { isFollowing, getFollowers, getFollowing } from "@/lib/data/follows";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow-button";
import { PersonPillList } from "@/components/person-pill-list";
import { PlaylistPreviewCard } from "@/components/playlists/playlist-preview-card";
import { PublicLibraryTabs, type LibraryEntry } from "@/components/public-library-tabs";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";
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
  const [followingThem, followsMe, followers, followingList] = await Promise.all([
    isFollowing(currentUserId, userId),
    isFollowing(userId, currentUserId),
    getFollowers(userId),
    getFollowing(userId),
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
        {currentUserId !== user.id && (
          <FollowButton otherUserId={user.id} initialFollowing={followingThem} followsYou={followsMe} />
        )}
      </div>

      {user.bio && <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink-muted">{user.bio}</p>}

      {user.favoriteArtists.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-medium uppercase tracking-wide text-dusty">Favorite artists</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {user.favoriteArtists.map((artist) => (
              <span key={artist} className="rounded-full bg-dusty/15 px-3 py-1.5 text-sm font-medium text-dusty">
                {artist}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Library</h2>
        <PublicLibraryTabs entries={libraryEntries} />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Playlists</h2>

        {playlists.length === 0 ? (
          <p className="mt-4 text-ink-muted">{user.name} hasn&apos;t made any playlists yet.</p>
        ) : (
          <StaggerGrid className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <StaggerItem key={playlist.id}>
                <PlaylistPreviewCard
                  href={`/people/${user.id}/playlists/${playlist.id}`}
                  title={playlist.title}
                  songCount={playlist.songs.length}
                  bookTitle={playlist.book.title}
                  bookCoverUrl={playlist.book.coverUrl}
                  lyricsType={playlist.lyricsType}
                />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Following {followingList.length > 0 && `(${followingList.length})`}
          </h2>
          <PersonPillList people={followingList} emptyMessage={`${user.name} isn't following anyone yet.`} />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Followers {followers.length > 0 && `(${followers.length})`}
          </h2>
          <PersonPillList people={followers} emptyMessage={`${user.name} doesn't have any followers yet.`} />
        </div>
      </div>
    </div>
  );
}
