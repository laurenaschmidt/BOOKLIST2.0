"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export type PlaylistActionState = { error?: string } | undefined;

export async function createPlaylistAction(
  bookId: string,
  _prevState: PlaylistActionState,
  formData: FormData
): Promise<PlaylistActionState> {
  const userId = await requireUserId();

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!title) {
    return { error: "Give your playlist a title." };
  }

  const playlist = await prisma.playlist.create({
    data: { title, description, userId, bookId },
  });

  revalidatePath(`/books/${bookId}`);
  redirect(`/playlists/${playlist.id}`);
}

export async function updatePlaylistDetailsAction(playlistId: string, formData: FormData) {
  const userId = await requireUserId();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  if (!title) return;

  const playlist = await prisma.playlist.update({
    where: { id: playlistId, userId },
    data: { title, description },
  });

  revalidatePath(`/playlists/${playlistId}`);
  revalidatePath(`/books/${playlist.bookId}`);
  revalidatePath("/playlists");
}

export async function deletePlaylistAction(playlistId: string) {
  const userId = await requireUserId();
  const playlist = await prisma.playlist.delete({ where: { id: playlistId, userId } });
  revalidatePath(`/books/${playlist.bookId}`);
  revalidatePath("/playlists");
  redirect(`/books/${playlist.bookId}`);
}

export async function addSongAction(playlistId: string, formData: FormData) {
  const userId = await requireUserId();

  const title = (formData.get("title") as string)?.trim();
  const artist = (formData.get("artist") as string)?.trim();
  const url = (formData.get("url") as string)?.trim() || null;
  if (!title || !artist) return;

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId, userId },
    select: { id: true, songs: { select: { order: true }, orderBy: { order: "desc" }, take: 1 } },
  });
  if (!playlist) return;

  const nextOrder = (playlist.songs[0]?.order ?? -1) + 1;

  await prisma.song.create({
    data: { playlistId, title, artist, url, order: nextOrder },
  });

  revalidatePath(`/playlists/${playlistId}`);
}

export async function removeSongAction(playlistId: string, songId: string) {
  const userId = await requireUserId();
  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId, userId }, select: { id: true } });
  if (!playlist) return;

  await prisma.song.delete({ where: { id: songId, playlistId } });
  revalidatePath(`/playlists/${playlistId}`);
}
