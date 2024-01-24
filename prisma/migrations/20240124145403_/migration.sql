-- CreateTable
CREATE TABLE "NewsViewer" (
    "newsId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "NewsViewer_pkey" PRIMARY KEY ("newsId","accountId")
);

-- AddForeignKey
ALTER TABLE "NewsViewer" ADD CONSTRAINT "NewsViewer_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsViewer" ADD CONSTRAINT "NewsViewer_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
