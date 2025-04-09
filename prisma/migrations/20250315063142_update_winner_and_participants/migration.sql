/*
  Warnings:

  - You are about to drop the `core_luckydraw` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[civil_id]` on the table `core_kwsmember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "core_luckydraw" DROP CONSTRAINT "core_luckydraw_attendee_id_7d4ff97c_fk_core_attendee_id";

-- DropForeignKey
ALTER TABLE "core_luckydraw" DROP CONSTRAINT "core_luckydraw_event_id_a4a07889_fk_core_event_id";

-- DropTable
DROP TABLE "core_luckydraw";

-- CreateTable
CREATE TABLE "lucky_draw" (
    "id" BIGSERIAL NOT NULL,
    "sponsor" VARCHAR(255),
    "prize" VARCHAR(255) NOT NULL,
    "participants" JSON,
    "winner" JSON,
    "start_time" TIMESTAMP(6) NOT NULL,
    "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "raffleid" BIGINT NOT NULL,
    "status" BOOLEAN DEFAULT false,

    CONSTRAINT "lucky_draw_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "core_kwsmember_civil_id_key" ON "core_kwsmember"("civil_id");

-- AddForeignKey
ALTER TABLE "lucky_draw" ADD CONSTRAINT "fk_lucky_draw_raffle" FOREIGN KEY ("raffleid") REFERENCES "core_raffle"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
