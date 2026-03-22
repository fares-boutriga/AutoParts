ALTER TABLE "outlets"
DROP COLUMN IF EXISTS "whatsappAlertsEnabled",
DROP COLUMN IF EXISTS "whatsappNumber";

ALTER TABLE "outlets"
ADD COLUMN IF NOT EXISTS "telegramAlertsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "telegramChatId" TEXT;
