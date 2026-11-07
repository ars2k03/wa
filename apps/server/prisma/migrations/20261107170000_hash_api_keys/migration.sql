-- Replace stored API keys with SHA-256 hashes. Existing keys keep working because
-- the server hashes each incoming key the same way before looking it up.
ALTER TABLE "api_keys" ADD COLUMN "key_hash" TEXT;
ALTER TABLE "api_keys" ADD COLUMN "key_prefix" TEXT;

UPDATE "api_keys"
SET "key_hash" = encode(sha256(convert_to("key", 'UTF8')), 'hex'),
    "key_prefix" = left("key", 18);

ALTER TABLE "api_keys" ALTER COLUMN "key_hash" SET NOT NULL;
ALTER TABLE "api_keys" ALTER COLUMN "key_prefix" SET NOT NULL;

-- Message logs reference the key by ID, so they no longer hold the secret.
ALTER TABLE "message_logs" ADD COLUMN "api_key_id" TEXT;

UPDATE "message_logs" AS l
SET "api_key_id" = k."id"
FROM "api_keys" AS k
WHERE l."api_key" = k."key";

DROP INDEX "message_logs_api_key_idx";
ALTER TABLE "message_logs" DROP COLUMN "api_key";

DROP INDEX "api_keys_key_idx";
DROP INDEX "api_keys_key_key";
ALTER TABLE "api_keys" DROP COLUMN "key";

CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");
CREATE INDEX "message_logs_api_key_id_idx" ON "message_logs"("api_key_id");
