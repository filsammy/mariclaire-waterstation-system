-- CreateEnum
CREATE TYPE "RiderStatus" AS ENUM ('ONLINE', 'OFFLINE', 'BUSY');

-- AlterTable
ALTER TABLE "DeliveryRider" ADD COLUMN     "status" "RiderStatus" NOT NULL DEFAULT 'OFFLINE';

-- CreateIndex
CREATE INDEX "Customer_customerType_idx" ON "Customer"("customerType");
