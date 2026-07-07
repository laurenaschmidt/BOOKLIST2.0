-- CreateEnum
CREATE TYPE "LyricsType" AS ENUM ('INSTRUMENTAL', 'LYRICAL', 'MIXED');

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "lyricsType" "LyricsType";
