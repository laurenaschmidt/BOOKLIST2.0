"use client";

import { SongRow } from "@/components/playlists/song-row";
import { useAudioPreview } from "@/components/playlists/use-audio-preview";

type Song = {
  id: string;
  title: string;
  artist: string;
  url: string | null;
  albumArtUrl: string | null;
  previewUrl: string | null;
  reason?: string | null;
};

export function ReadOnlySongList({ songs }: { songs: Song[] }) {
  const { playingId, toggle } = useAudioPreview();

  if (songs.length === 0) {
    return <p className="text-ink-muted">No songs in this playlist yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {songs.map((song, index) => (
        <SongRow
          key={song.id}
          song={song}
          index={index}
          isPlaying={playingId === song.id}
          onTogglePreview={() => toggle(song.id, song.previewUrl)}
        />
      ))}
    </div>
  );
}
