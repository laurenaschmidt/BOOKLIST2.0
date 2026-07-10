"use client";

import { SongRow } from "@/components/playlists/song-row";
import { useAudioPreview } from "@/components/playlists/use-audio-preview";
import { StaggerGrid, StaggerItem } from "@/components/motion/stagger-grid";

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
    <StaggerGrid className="flex flex-col gap-2">
      {songs.map((song, index) => (
        <StaggerItem key={song.id}>
          <SongRow
            song={song}
            index={index}
            isPlaying={playingId === song.id}
            onTogglePreview={() => toggle(song.id, song.previewUrl)}
          />
        </StaggerItem>
      ))}
    </StaggerGrid>
  );
}
