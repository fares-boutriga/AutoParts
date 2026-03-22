ALTER TABLE "outlets"
ADD COLUMN IF NOT EXISTS "telegramChatType" TEXT,
ADD COLUMN IF NOT EXISTS "telegramChatTitle" TEXT,
ADD COLUMN IF NOT EXISTS "telegramConnectedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "telegram_connection_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "telegram_connection_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "telegram_connection_tokens_tokenHash_key" ON "telegram_connection_tokens"("tokenHash");
CREATE INDEX IF NOT EXISTS "telegram_connection_tokens_outletId_expiresAt_idx" ON "telegram_connection_tokens"("outletId", "expiresAt");
CREATE INDEX IF NOT EXISTS "telegram_connection_tokens_expiresAt_consumedAt_idx" ON "telegram_connection_tokens"("expiresAt", "consumedAt");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'telegram_connection_tokens_outletId_fkey'
          AND table_name = 'telegram_connection_tokens'
    ) THEN
        ALTER TABLE "telegram_connection_tokens"
        ADD CONSTRAINT "telegram_connection_tokens_outletId_fkey"
            FOREIGN KEY ("outletId") REFERENCES "outlets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'telegram_connection_tokens_userId_fkey'
          AND table_name = 'telegram_connection_tokens'
    ) THEN
        ALTER TABLE "telegram_connection_tokens"
        ADD CONSTRAINT "telegram_connection_tokens_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
