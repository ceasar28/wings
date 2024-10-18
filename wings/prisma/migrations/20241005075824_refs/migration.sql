/*
  Warnings:

  - You are about to drop the column `deeplink` on the `BookingSession` table. All the data in the column will be lost.
  - You are about to drop the column `ref` on the `BookingSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BookingSession" DROP COLUMN "deeplink",
DROP COLUMN "ref",
ADD COLUMN     "Bonkamount" TEXT,
ADD COLUMN     "Bonkdeeplink" TEXT,
ADD COLUMN     "Bonkref" TEXT,
ADD COLUMN     "Solamount" TEXT,
ADD COLUMN     "Soldeeplink" TEXT,
ADD COLUMN     "Solref" TEXT,
ADD COLUMN     "USDCamount" TEXT,
ADD COLUMN     "USDCdeeplink" TEXT,
ADD COLUMN     "USDCref" TEXT;
