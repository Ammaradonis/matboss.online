-- MatBoss Online — Verification Script
-- Run AFTER migration.sql and seed.sql

-- Confirm the expected tables exist
\dt

-- Confirm the seed created rows
SELECT COUNT(*) AS total_slots
FROM availability;

-- Confirm slot distribution by day
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

-- Confirm blog post table exists and inspect recent entries
SELECT COUNT(*) AS total_blog_posts
FROM blog_posts;

SELECT id, slug, category, published_date, updated_at
FROM blog_posts
ORDER BY published_date DESC, updated_at DESC
LIMIT 10;
