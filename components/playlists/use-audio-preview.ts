"use client";

import { useEffect, useRef, useState } from "react";

export function useAudioPreview() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function toggle(id: string, previewUrl: string | null) {
    if (!previewUrl) return;

    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    audioRef.current?.pause();
    const audio = new Audio(previewUrl);
    audio.play();
    audio.onended = () => setPlayingId(null);
    audioRef.current = audio;
    setPlayingId(id);
  }

  return { playingId, toggle };
}
