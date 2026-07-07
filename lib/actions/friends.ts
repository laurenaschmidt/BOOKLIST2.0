"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function sendFriendRequestAction(
  receiverId: string
): Promise<{ status: "friends" | "pending_sent"; requestId: string } | undefined> {
  const senderId = await requireUserId();
  if (senderId === receiverId) return;

  // If the other person already sent a request our way, treat this as
  // accepting theirs instead of creating a second, conflicting row.
  const reverseRequest = await prisma.friendRequest.findUnique({
    where: { senderId_receiverId: { senderId: receiverId, receiverId: senderId } },
  });

  let result: { status: "friends" | "pending_sent"; requestId: string };
  if (reverseRequest) {
    if (reverseRequest.status === "PENDING") {
      await prisma.friendRequest.update({ where: { id: reverseRequest.id }, data: { status: "ACCEPTED" } });
    }
    result = { status: "friends", requestId: reverseRequest.id };
  } else {
    const request = await prisma.friendRequest.upsert({
      where: { senderId_receiverId: { senderId, receiverId } },
      update: {},
      create: { senderId, receiverId },
    });
    result = { status: "pending_sent", requestId: request.id };
  }

  revalidatePath("/people");
  revalidatePath(`/people/${receiverId}`);
  return result;
}

export async function acceptFriendRequestAction(requestId: string) {
  const userId = await requireUserId();

  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!request || request.receiverId !== userId) return;

  await prisma.friendRequest.update({ where: { id: requestId }, data: { status: "ACCEPTED" } });

  revalidatePath("/people");
  revalidatePath(`/people/${request.senderId}`);
}

export async function removeFriendConnectionAction(requestId: string) {
  const userId = await requireUserId();

  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!request || (request.senderId !== userId && request.receiverId !== userId)) return;

  const otherUserId = request.senderId === userId ? request.receiverId : request.senderId;
  await prisma.friendRequest.delete({ where: { id: requestId } });

  revalidatePath("/people");
  revalidatePath(`/people/${otherUserId}`);
}
