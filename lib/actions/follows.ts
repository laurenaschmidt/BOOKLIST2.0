"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function followUserAction(otherUserId: string) {
  const userId = await requireUserId();
  if (userId === otherUserId) return;

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: userId, followingId: otherUserId } },
    update: {},
    create: { followerId: userId, followingId: otherUserId },
  });

  revalidatePath("/people");
  revalidatePath(`/people/${otherUserId}`);
  revalidatePath("/profile");
}

export async function unfollowUserAction(otherUserId: string) {
  const userId = await requireUserId();

  await prisma.follow.deleteMany({ where: { followerId: userId, followingId: otherUserId } });

  revalidatePath("/people");
  revalidatePath(`/people/${otherUserId}`);
  revalidatePath("/profile");
}
