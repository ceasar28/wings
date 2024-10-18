/*
  Warnings:

  - A unique constraint covering the columns `[chat_id]` on the table `BookingSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BookingSession_chat_id_key" ON "BookingSession"("chat_id");
