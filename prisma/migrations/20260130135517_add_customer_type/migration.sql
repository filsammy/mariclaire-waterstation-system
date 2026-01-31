-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('REGULAR', 'OUTLET_RESELLER');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "customerType" "CustomerType" NOT NULL DEFAULT 'REGULAR';
