-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_ownerId_fkey";

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "UserAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
