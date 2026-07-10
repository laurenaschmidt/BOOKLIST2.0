-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate data: every existing friend request (pending or accepted) becomes
-- a one-way follow from whoever sent it. Accepted requests would ideally
-- become a mutual follow in both directions, but a plain INSERT ... SELECT
-- with an OR'd reverse row is simplest and pending requests only had one
-- real direction of intent anyway.
INSERT INTO "Follow" ("id", "followerId", "followingId", "createdAt")
SELECT gen_random_uuid()::text, "senderId", "receiverId", "createdAt" FROM "FriendRequest"
ON CONFLICT DO NOTHING;

INSERT INTO "Follow" ("id", "followerId", "followingId", "createdAt")
SELECT gen_random_uuid()::text, "receiverId", "senderId", "createdAt" FROM "FriendRequest"
WHERE "status" = 'ACCEPTED'
ON CONFLICT DO NOTHING;

-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_senderId_fkey";

-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_receiverId_fkey";

-- DropTable
DROP TABLE "FriendRequest";

-- DropEnum
DROP TYPE "FriendRequestStatus";
