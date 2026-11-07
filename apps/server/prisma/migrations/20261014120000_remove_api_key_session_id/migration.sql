-- One account = one WhatsApp device, so API keys no longer bind to a session.
ALTER TABLE "api_keys" DROP COLUMN "session_id";
