-- AlterTable
ALTER TABLE "User" ADD COLUMN     "favoriteArtists" TEXT[] DEFAULT ARRAY[]::TEXT[];
