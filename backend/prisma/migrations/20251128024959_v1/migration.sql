/*
  Warnings:

  - Added the required column `endingscore` to the `round_player_status` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "round_player_status" ADD COLUMN     "endingscore" INTEGER NOT NULL;
