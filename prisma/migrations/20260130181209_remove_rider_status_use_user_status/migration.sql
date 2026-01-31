/*
  Warnings:

  - You are about to drop the column `status` on the `DeliveryRider` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DeliveryRider" DROP COLUMN "status";

-- DropEnum
DROP TYPE "RiderStatus";
