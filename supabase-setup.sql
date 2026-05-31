-- SEO Audit Pro — Supabase setup script
-- Run this in Supabase → SQL Editor → New query

CREATE TABLE IF NOT EXISTS "Analysis" (
  "id"               TEXT        NOT NULL,
  "url"              TEXT        NOT NULL,
  "email"            TEXT,
  "name"             TEXT,
  "score"            INTEGER     NOT NULL,
  "freeIssues"       TEXT        NOT NULL,
  "fullReport"       TEXT,
  "reportType"       TEXT,
  "stripeSessionId"  TEXT,
  "stripeCustomerId" TEXT,
  "paid"             BOOLEAN     NOT NULL DEFAULT false,
  "paidAt"           TIMESTAMPTZ,
  "pdfSent"          BOOLEAN     NOT NULL DEFAULT false,
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- Auto-update updatedAt on every row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER "Analysis_updatedAt"
BEFORE UPDATE ON "Analysis"
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Useful indexes for the admin dashboard queries
CREATE INDEX IF NOT EXISTS "Analysis_createdAt_idx" ON "Analysis" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Analysis_paid_idx"      ON "Analysis" ("paid");
CREATE INDEX IF NOT EXISTS "Analysis_email_idx"     ON "Analysis" ("email");
