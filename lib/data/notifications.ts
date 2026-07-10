import { prisma } from "@/lib/prisma";

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    include: {
      actor: { select: { id: true, name: true, image: true } },
      playlist: { select: { id: true, title: true, book: { select: { title: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { recipientId: userId, read: false } });
}

export async function notifyFollowersOfNewPlaylist(actorId: string, playlistId: string) {
  const followers = await prisma.follow.findMany({
    where: { followingId: actorId },
    select: { followerId: true },
  });
  if (followers.length === 0) return;

  await prisma.notification.createMany({
    data: followers.map((f) => ({
      recipientId: f.followerId,
      actorId,
      type: "NEW_PLAYLIST" as const,
      playlistId,
    })),
  });
}
