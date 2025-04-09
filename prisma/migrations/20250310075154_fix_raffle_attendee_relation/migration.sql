-- CreateTable
CREATE TABLE "core_raffle_attendee" (
    "id" BIGSERIAL NOT NULL,
    "kws_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" INTEGER,
    "civil_id" TEXT NOT NULL,
    "num_people" INTEGER NOT NULL,
    "attended_time" TIMESTAMPTZ(6) NOT NULL,
    "raffle_id" BIGINT,

    CONSTRAINT "core_raffle_attendee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "core_raffle_attendee_raffle_id_idx" ON "core_raffle_attendee"("raffle_id");

-- AddForeignKey
ALTER TABLE "core_raffle_attendee" ADD CONSTRAINT "core_raffle_attendee_raffle_id_fkey" FOREIGN KEY ("raffle_id") REFERENCES "core_raffle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
