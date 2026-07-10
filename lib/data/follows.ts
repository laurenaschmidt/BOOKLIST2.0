import { prisma } from "@/lib/prisma";

export type FollowStatus = { following: boolean; followsYou: boolean };

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  if (followerId === followingId) return false;
  const follow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  return !!follow;
}

export async function getFollowStatusMap(currentUserId: string): Promise<Map<string, FollowStatus>> {
  const [following, followers] = await Promise.all([
    prisma.follow.findMany({ where: { followerId: currentUserId }, select: { followingId: true } }),
    prisma.follow.findMany({ where: { followingId: currentUserId }, select: { followerId: true } }),
  ]);

  const followingIds = new Set(following.map((f) => f.followingId));
  const followerIds = new Set(followers.map((f) => f.followerId));

  const map = new Map<string, FollowStatus>();
  for (const id of new Set([...followingIds, ...followerIds])) {
    map.set(id, { following: followingIds.has(id), followsYou: followerIds.has(id) });
  }
  return map;
}

export async function getFollowers(userId: string) {
  const rows = await prisma.follow.findMany({
    where: { followingId: userId },
    include: { follower: { select: { id: true, name: true, image: true, bio: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => r.follower);
}

export async function getFollowing(userId: string) {
  const rows = await prisma.follow.findMany({
    where: { followerId: userId },
    include: { followed: { select: { id: true, name: true, image: true, bio: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => r.followed);
}
