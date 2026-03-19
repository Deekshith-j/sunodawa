-- SunoDawa Supabase Migration
-- Run this in your Supabase SQL Editor

-- ── Scans Table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  medicine_name TEXT,
  language TEXT DEFAULT 'Hindi',
  data JSONB NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ── Reminders Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  medicine_name TEXT,
  time TEXT,
  dose TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data JSONB NOT NULL
);

-- ── Consultations Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consultations (
  id TEXT PRIMARY KEY,
  messages JSONB,
  assessment JSONB,
  language TEXT DEFAULT 'Hindi',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Enable Row Level Security (RLS) ──────────────────────────────
-- For anonymous public access (no auth needed for this app)
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users (adjust as needed)
CREATE POLICY "Public read scans" ON scans FOR SELECT USING (true);
CREATE POLICY "Public insert scans" ON scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update scans" ON scans FOR UPDATE USING (true);
CREATE POLICY "Public delete scans" ON scans FOR DELETE USING (true);

CREATE POLICY "Public read reminders" ON reminders FOR SELECT USING (true);
CREATE POLICY "Public insert reminders" ON reminders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update reminders" ON reminders FOR UPDATE USING (true);
CREATE POLICY "Public delete reminders" ON reminders FOR DELETE USING (true);

CREATE POLICY "Public insert consultations" ON consultations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read consultations" ON consultations FOR SELECT USING (true);
