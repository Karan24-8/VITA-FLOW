-- ============================================================
-- VITA-FLOW — AI Agent: CONSULTANT_AVAILABILITY table
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create the table
-- consultant_id is UUID to match cons_id in your CONSULTANTS table

CREATE TABLE IF NOT EXISTS "CONSULTANT_AVAILABILITY" (
    id               SERIAL PRIMARY KEY,
    consultant_id    UUID REFERENCES "CONSULTANTS"(cons_id) ON DELETE CASCADE,
    available_from   TIMESTAMPTZ NOT NULL,
    available_to     TIMESTAMPTZ NOT NULL,
    booked           BOOLEAN DEFAULT FALSE
);

-- 2. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_cons_avail_consultant
    ON "CONSULTANT_AVAILABILITY"(consultant_id);

CREATE INDEX IF NOT EXISTS idx_cons_avail_from
    ON "CONSULTANT_AVAILABILITY"(available_from);

-- ============================================================
-- 3. Seed availability slots
-- First run this to get your real cons_id values:
--   SELECT cons_id, name FROM "CONSULTANTS";
-- Then replace the UUIDs below with real ones.
-- Dates must be in the future — update them as needed.
-- UUIDs must be wrapped in single quotes.
-- ============================================================

INSERT INTO "CONSULTANT_AVAILABILITY" (consultant_id, available_from, available_to)
VALUES
    ('1a2b3c4d-1234-4321-8123-abcdef123424', '2026-04-17 09:00:00+05:30', '2026-04-24 10:00:00+05:30'),
    ('1a2b3c4d-1234-4321-8123-abcdef123410', '2026-04-18 14:00:00+05:30', '2026-04-25 15:00:00+05:30'),
    ('1a2b3c4d-1234-4321-8123-abcdef123453', '2026-04-19 08:00:00+05:30', '2026-04-26 09:00:00+05:30'),
    ('1a2b3c4d-1234-4321-8123-abcdef123435', '2026-04-20 17:00:00+05:30', '2026-04-27 18:00:00+05:30'),
    ('1a2b3c4d-1234-4321-8123-abcdef123433', '2026-04-21 11:00:00+05:30', '2026-04-28 12:00:00+05:30'),
    ('1a2b3c4d-1234-4321-8123-abcdef123431', '2026-04-22 15:00:00+05:30', '2026-04-29 16:00:00+05:30'),
    ('1a2b3c4d-1234-4321-8123-abcdef123403', '2026-04-23 10:00:00+05:30', '2026-04-30 11:00:00+05:30');

-- ============================================================
-- NOTE: Even without this seed data, the AI agent still works.
-- It will find consultants via the CONSULTANTS table and use
-- their available_days + available_time text fields as a fallback
-- to tell users when each consultant is generally available.
-- Structured slots here just enable more precise time filtering.
-- ============================================================
