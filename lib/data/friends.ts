import { prisma } from "@/lib/prisma";

export type FriendshipStatus =
  | { type: "self" }
  | { type: "none" }
  | { type: "pending_sent"; requestId: string }
  | { type: "pending_received"; requestId: string }
  | { type: "friends"; requestId: string };

export async function getFriendshipStatus(
  currentUserId: string,
  otherUserId: string
): Promise<FriendshipStatus> {
  if (currentUserId === otherUserId) return { type: "self" };

  const request = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    },
  });

  if (!request) return { type: "none" };
  if (request.status === "ACCEPTED") return { type: "friends", requestId: request.id };
  if (request.senderId === currentUserId) return { type: "pending_sent", requestId: request.id };
  return { type: "pending_received", requestId: request.id };
}

export async function getFriendshipStatusMap(
  currentUserId: string
): Promise<Map<string, FriendshipStatus>> {
  const requests = await prisma.friendRequest.findMany({
    where: { OR: [{ senderId: currentUserId }, { receiverId: currentUserId }] },
  });

  const map = new Map<string, FriendshipStatus>();
  for (const request of requests) {
    const otherUserId = request.senderId === currentUserId ? request.receiverId : request.senderId;
    if (request.status === "ACCEPTED") {
      map.set(otherUserId, { type: "friends", requestId: request.id });
    } else if (request.senderId === currentUserId) {
      map.set(otherUserId, { type: "pending_sent", requestId: request.id });
    } else {
      map.set(otherUserId, { type: "pending_received", requestId: request.id });
    }
  }
  return map;
}

export async function getFriends(userId: string) {
  const requests = await prisma.friendRequest.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: { id: true, name: true, image: true, bio: true } },
      receiver: { select: { id: true, name: true, image: true, bio: true } },
    },
  });

  return requests.map((r) => (r.senderId === userId ? r.receiver : r.sender));
}

export async function getPendingReceivedRequests(userId: string) {
  return prisma.friendRequest.findMany({
    where: { receiverId: userId, status: "PENDING" },
    include: { sender: { select: { id: true, name: true, image: true, bio: true } } },
    orderBy: { createdAt: "desc" },
  });
}
