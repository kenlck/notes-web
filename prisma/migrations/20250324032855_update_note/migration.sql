-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_folder_id_fkey";

-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "last_opened_at" TIMESTAMP(3),
ALTER COLUMN "folder_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
