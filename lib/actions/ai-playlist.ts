"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFullPlaylist, generateSongSuggestions, GeminiPlaylistError } from "@/lib/gemini";
import { enrichSuggestions, type EnrichedSongSuggestion } from "@/lib/ai-playlist";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

function bookContext(book: { title: string; authors: string[]; description: string | null; genres: string[] }) {
  return { title: book.title, authors: book.authors, description: book.description, genres: book.genres };
}

export type GeneratedAiPlaylist = {
  title: string;
  description: string;
  songs: EnrichedSongSuggestion[];
};

export type GenerateAiPlaylistResult =
  | { ok: true; playlist: GeneratedAiPlaylist }
  | { ok: false; error: string };

export async function generateAiPlaylistAction(bookId: string): Promise<GenerateAiPlaylistResult> {
  await requireUserId();

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) return { ok: false, error: "Couldn't find that book." };

  try {
    const generated = await generateFullPlaylist(bookContext(book));
    const songs = await enrichSuggestions(generated.songs);
    return { ok: true, playlist: { title: generated.title, description: generated.description, songs } };
  } catch (error) {
    if (error instanceof GeminiPlaylistError) return { ok: false, error: error.message };
    return { ok: false, error: "Something went wrong generating the playlist. Try again." };
  }
}

export async function createAiPlaylistAction(
  bookId: string,
  title: string,
  description: string,
  songs: EnrichedSongSuggestion[]
) {
  const userId = await requireUserId();

  const trimmedTitle = title.trim();
  if (!trimmedTitle) throw new Error("Playlist needs a title.");

  const playlist = await prisma.playlist.create({
    data: {
      title: trimmedTitle,
      description: description.trim() || null,
      userId,
      bookId,
      songs: {
        create: songs.map((song, index) => ({
          title: song.title,
          artist: song.artist,
          reason: song.reason,
          url: song.externalUrl,
          albumArtUrl: song.albumArtUrl,
          previewUrl: song.previewUrl,
          order: index,
        })),
      },
    },
  });

  revalidatePath(`/books/${bookId}`);
  redirect(`/playlists/${playlist.id}`);
}

export type SongSuggestionsResult =
  | { ok: true; suggestions: EnrichedSongSuggestion[] }
  | { ok: false; error: string };

export async function generateSongSuggestionsAction(playlistId: string): Promise<SongSuggestionsResult> {
  const userId = await requireUserId();

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId, userId },
    include: { book: true, songs: { select: { title: true, artist: true } } },
  });
  if (!playlist) return { ok: false, error: "Couldn't find that playlist." };

  try {
    const existingTitles = new Set(playlist.songs.map((s) => s.title.toLowerCase()));
    const suggestions = await generateSongSuggestions(bookContext(playlist.book), {
      count: 6,
      exclude: playlist.songs.map((s) => `${s.title} by ${s.artist}`),
      playlistTitle: playlist.title,
      playlistDescription: playlist.description ?? undefined,
    });
    const fresh = suggestions.filter((s) => !existingTitles.has(s.title.toLowerCase()));
    const enriched = await enrichSuggestions(fresh);
    return { ok: true, suggestions: enriched };
  } catch (error) {
    if (error instanceof GeminiPlaylistError) return { ok: false, error: error.message };
    return { ok: false, error: "Something went wrong getting suggestions. Try again." };
  }
}

export async function addAiSongAction(playlistId: string, song: EnrichedSongSuggestion) {
  const userId = await requireUserId();

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId, userId },
    select: { id: true, songs: { select: { order: true }, orderBy: { order: "desc" }, take: 1 } },
  });
  if (!playlist) return;

  const order = (playlist.songs[0]?.order ?? -1) + 1;

  await prisma.song.create({
    data: {
      playlistId,
      title: song.title,
      artist: song.artist,
      reason: song.reason,
      url: song.externalUrl,
      albumArtUrl: song.albumArtUrl,
      previewUrl: song.previewUrl,
      order,
    },
  });

  revalidatePath(`/playlists/${playlistId}`);
}
