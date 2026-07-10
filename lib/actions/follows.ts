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

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: userId, followingId: otherUserId } },
  });

  if (!existing) {
    await prisma.follow.create({ data: { followerId: userId, followingId: otherUserId } });
    await prisma.notification.create({
      data: { recipientId: otherUserId, actorId: userId, type: "NEW_FOLLOWER" },
    });
  }

  revalidatePath("/people");
  revalidatePath(`/people/${otherUserId}`);
  revalidatePath("/profile");
  revalidatePath("/notifications");
}

export async function unfollowUserAction(otherUserId: string) {
  const userId = await requireUserId();

  await prisma.follow.deleteMany({ where: { followerId: userId, followingId: otherUserId } });

  revalidatePath("/people");
  revalidatePath(`/people/${otherUserId}`);
  revalidatePath("/profile");
}
