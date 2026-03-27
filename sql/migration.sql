-- MatBoss Online — Database Migration
-- Database: matboss_online
-- Run this ONCE to set up the schema.

-- 1. Create the database (run as superuser if needed):
-- CREATE DATABASE matboss_online;

-- 2. Connect to matboss_online, then run everything below.

-- ============================================
-- AVAILABILITY TABLE
-- Stores all bookable time slots (91 days out)
-- ============================================
CREATE TABLE IF NOT EXISTS availability (
    id              SERIAL PRIMARY KEY,
    slot_date       DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    is_booked       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate slots on the same date/time
    UNIQUE (slot_date, start_time, end_time)
);

CREATE INDEX IF NOT EXISTS idx_availability_date
    ON availability (slot_date);

CREATE INDEX IF NOT EXISTS idx_availability_date_available
    ON availability (slot_date, is_booked)
    WHERE is_booked = FALSE;


-- ============================================
-- BOOKINGS TABLE
-- Stores confirmed booking records
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id                      SERIAL PRIMARY KEY,
    booking_id              VARCHAR(20) UNIQUE NOT NULL,   -- MAT-YYYYMMDD-XXXX
    slot_id                 INTEGER NOT NULL REFERENCES availability(id),
    school_name             VARCHAR(255) NOT NULL,
    owner_name              VARCHAR(255) NOT NULL,
    email                   VARCHAR(255) NOT NULL,
    phone                   VARCHAR(50) NOT NULL,
    num_students            INTEGER NOT NULL,
    current_software        VARCHAR(255) NOT NULL,
    website                 VARCHAR(255),
    monthly_trial_volume    INTEGER,
    biggest_challenge       TEXT,
    timezone                VARCHAR(100) NOT NULL DEFAULT 'America/Los_Angeles',
    status                  VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_booking_id
    ON bookings (booking_id);

CREATE INDEX IF NOT EXISTS idx_bookings_email
    ON bookings (email);

CREATE INDEX IF NOT EXISTS idx_bookings_created
    ON bookings (created_at DESC);
