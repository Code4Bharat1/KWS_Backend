/*
  Warnings:

  - You are about to drop the column `ticket_no` on the `core_raffleTicket` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[raffle_id,kws_id]` on the table `core_raffleTicket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kws_id` to the `core_raffleTicket` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "unique_ticket_created_per_raffle";

-- AlterTable
ALTER TABLE "core_raffleTicket" DROP COLUMN "ticket_no",
ADD COLUMN     "kws_id" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "core_raffle_attendee" ALTER COLUMN "phone" SET DATA TYPE BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "unique_ticket_created_per_raffle" ON "core_raffleTicket"("raffle_id", "kws_id");
