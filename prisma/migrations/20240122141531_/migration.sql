-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "foodAndBeverageId" INTEGER;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_foodAndBeverageId_fkey" FOREIGN KEY ("foodAndBeverageId") REFERENCES "FoodAndBeverage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
