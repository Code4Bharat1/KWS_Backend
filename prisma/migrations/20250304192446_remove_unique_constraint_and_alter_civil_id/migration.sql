/*
  Warnings:

  - You are about to alter the column `civil_id` on the `core_kwsmember` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(12)`.

*/
-- DropIndex
DROP INDEX "core_kwsmember_civil_id_key";

-- AlterTable
ALTER TABLE "core_kwsmember" ALTER COLUMN "civil_id" SET DATA TYPE VARCHAR(12);

-- CreateTable
CREATE TABLE "core_raffleTicket" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "civil_id" VARCHAR(12) NOT NULL,
    "ticket_no" VARCHAR(50) NOT NULL,
    "amount_in_kwd" DECIMAL(10,3) NOT NULL,
    "raffle_id" BIGINT,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "core_raffleTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "core_raffleTicket_raffle_id_c6580ce6" ON "core_raffleTicket"("raffle_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_ticket_created_per_raffle" ON "core_raffleTicket"("raffle_id", "ticket_no");

-- AddForeignKey
ALTER TABLE "core_raffleTicket" ADD CONSTRAINT "core_raffleTicket_raffle_id_c6580ce6_fk_core_raffle_id" FOREIGN KEY ("raffle_id") REFERENCES "core_raffle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
