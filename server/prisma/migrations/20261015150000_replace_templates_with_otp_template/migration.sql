-- DropForeignKey
ALTER TABLE "message_templates" DROP CONSTRAINT "message_templates_user_id_fkey";

-- AlterTable
ALTER TABLE "message_logs" DROP COLUMN "template_id",
DROP COLUMN "template_name";

-- DropTable
DROP TABLE "message_templates";

-- CreateTable
CREATE TABLE "otp_templates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "footer" TEXT,
    "show_copy_button" BOOLEAN NOT NULL DEFAULT true,
    "copy_button_text" TEXT NOT NULL DEFAULT 'Copy Code',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otp_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "otp_templates_user_id_key" ON "otp_templates"("user_id");

-- AddForeignKey
ALTER TABLE "otp_templates" ADD CONSTRAINT "otp_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

