-- Run this once against your PRODUCTION Postgres database after switching
-- the Prisma datasource provider to "postgresql" and running `prisma db push`.
-- This is what makes double-booking impossible even under concurrent
-- requests hitting the database at the exact same instant -- it is enforced
-- by Postgres itself, not by application code.

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Only "held" (temporary checkout hold) and "confirmed" bookings occupy a
-- slot. Cancelled bookings free it up automatically because the exclusion
-- constraint only applies to rows matching the WHERE clause.
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS time_range tsrange
  GENERATED ALWAYS AS (
    tsrange(
      (date || ' ' || "startTime")::timestamp,
      (date || ' ' || "endTime")::timestamp,
      '[)'
    )
  ) STORED;

ALTER TABLE "Booking"
  ADD CONSTRAINT booking_no_overlap
  EXCLUDE USING gist (
    date WITH =,
    time_range WITH &&
  )
  WHERE (status IN ('held', 'confirmed'));

-- Any INSERT/UPDATE that would create an overlapping (date, time_range) pair
-- with another held/confirmed booking is rejected at the database layer with
-- a `23P01 exclusion_violation` error, regardless of what the application
-- checked a moment earlier. lib/booking.ts catches this error code and
-- returns "slot no longer available" to the client.
