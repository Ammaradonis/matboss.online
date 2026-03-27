-- MatBoss Online — Seed Script
-- Generates 91 days of available time slots starting from today.
-- Schedule: Weekdays 7-9 AM & 5-8 PM, Saturday 8-11 AM, Sunday 9-11 AM
-- All times in Pacific Time (San Diego).
-- Run AFTER migration.sql

-- Clear existing future slots (safe to re-run)
DELETE FROM availability
WHERE slot_date >= CURRENT_DATE
  AND is_booked = FALSE;

-- Generate slots using a series + cross join approach
INSERT INTO availability (slot_date, start_time, end_time)
SELECT
    d.slot_date,
    t.start_time,
    t.end_time
FROM
    -- Generate 91 days starting from today
    (
        SELECT (CURRENT_DATE + i)::date AS slot_date
        FROM generate_series(0, 90) AS s(i)
    ) d
CROSS JOIN LATERAL (
    -- Weekday morning slots: 7:00-9:00 in 30-min blocks
    SELECT start_time, end_time
    FROM (VALUES
        ('07:00'::time, '07:30'::time),
        ('07:30'::time, '08:00'::time),
        ('08:00'::time, '08:30'::time),
        ('08:30'::time, '09:00'::time)
    ) AS morning(start_time, end_time)
    WHERE EXTRACT(DOW FROM d.slot_date) BETWEEN 1 AND 5  -- Mon-Fri

    UNION ALL

    -- Weekday evening slots: 17:00-20:00 in 30-min blocks
    SELECT start_time, end_time
    FROM (VALUES
        ('17:00'::time, '17:30'::time),
        ('17:30'::time, '18:00'::time),
        ('18:00'::time, '18:30'::time),
        ('18:30'::time, '19:00'::time),
        ('19:00'::time, '19:30'::time),
        ('19:30'::time, '20:00'::time)
    ) AS evening(start_time, end_time)
    WHERE EXTRACT(DOW FROM d.slot_date) BETWEEN 1 AND 5  -- Mon-Fri

    UNION ALL

    -- Saturday morning slots: 8:00-11:00 in 30-min blocks
    SELECT start_time, end_time
    FROM (VALUES
        ('08:00'::time, '08:30'::time),
        ('08:30'::time, '09:00'::time),
        ('09:00'::time, '09:30'::time),
        ('09:30'::time, '10:00'::time),
        ('10:00'::time, '10:30'::time),
        ('10:30'::time, '11:00'::time)
    ) AS saturday(start_time, end_time)
    WHERE EXTRACT(DOW FROM d.slot_date) = 6  -- Saturday

    UNION ALL

    -- Sunday morning slots: 9:00-11:00 in 30-min blocks
    SELECT start_time, end_time
    FROM (VALUES
        ('09:00'::time, '09:30'::time),
        ('09:30'::time, '10:00'::time),
        ('10:00'::time, '10:30'::time),
        ('10:30'::time, '11:00'::time)
    ) AS sunday(start_time, end_time)
    WHERE EXTRACT(DOW FROM d.slot_date) = 0  -- Sunday
) t
ON CONFLICT (slot_date, start_time, end_time) DO NOTHING;

-- Verify the seed
SELECT
    CASE EXTRACT(DOW FROM slot_date)
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
    END AS day_name,
    COUNT(*) AS total_slots,
    COUNT(*) FILTER (WHERE NOT is_booked) AS available_slots
FROM availability
WHERE slot_date >= CURRENT_DATE
GROUP BY EXTRACT(DOW FROM slot_date)
ORDER BY EXTRACT(DOW FROM slot_date);
