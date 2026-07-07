"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getGoogleBook } from "@/lib/google-books";
import { prisma } from "@/lib/prisma";
import { findOrCreateBook, addBookToLibrary, updateLibraryStatus, removeFromLibrary } from "@/lib/data/books";
import type { ReadingStatus } from "@/app/generated/prisma/enums";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function addToLibraryAction(googleBooksId: string, status: ReadingStatus) {
  const userId = await requireUserId();

  let book = await prisma.book.findUnique({ where: { googleBooksId } });
  if (!book) {
    const googleBook = await getGoogleBook(googleBooksId);
    if (!googleBook) throw new Error("Book not found");
    book = await findOrCreateBook(googleBook);
  }

  await addBookToLibrary(userId, book.id, status);

  revalidatePath("/library");
  revalidatePath("/search");
  revalidatePath(`/books/${book.id}`);

  return { bookId: book.id };
}

export async function updateStatusAction(userBookId: string, status: ReadingStatus) {
  const userId = await requireUserId();
  await updateLibraryStatus(userId, userBookId, status);
  revalidatePath("/library");
  revalidatePath("/profile");
}

export async function removeFromLibraryAction(userBookId: string) {
  const userId = await requireUserId();
  await removeFromLibrary(userId, userBookId);
  revalidatePath("/library");
}
