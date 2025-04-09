/*
  Warnings:

  - You are about to drop the column `end_date` on the `core_raffle` table. All the data in the column will be lost.
  - You are about to drop the column `organizer_id` on the `core_raffle` table. All the data in the column will be lost.
  - You are about to drop the column `prize` on the `core_raffle` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `core_raffle` table. All the data in the column will be lost.
  - Added the required column `end_time` to the `core_raffle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `core_raffle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "core_kwsmember" ALTER COLUMN "civil_id" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "core_raffle" DROP COLUMN "end_date",
DROP COLUMN "organizer_id",
DROP COLUMN "prize",
DROP COLUMN "start_date",
ADD COLUMN     "attendees" JSONB,
ADD COLUMN     "end_time" TIMESTAMPTZ(6) NOT NULL,
ADD COLUMN     "luckySpins" JSONB,
ADD COLUMN     "start_time" TIMESTAMPTZ(6) NOT NULL,
ADD COLUMN     "winners" JSONB;
