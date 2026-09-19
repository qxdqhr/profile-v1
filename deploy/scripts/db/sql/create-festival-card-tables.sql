CREATE TABLE IF NOT EXISTS festival_card_configs (
  id TEXT PRIMARY KEY,
  name TEXT,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_festival_card_configs_updated_at
  ON festival_card_configs(updated_at DESC);

