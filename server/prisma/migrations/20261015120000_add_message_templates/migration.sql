-- CreateTable
CREATE TABLE "message_templates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_templates_user_id_idx" ON "message_templates"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_templates_user_id_name_key" ON "message_templates"("user_id", "name");

-- AddForeignKey
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

