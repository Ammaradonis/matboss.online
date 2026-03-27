# MatBoss Admin Guide — Managing Your Booking Calendar

This guide is written for non-technical users. Follow each step exactly.

---

## 1. How Your Calendar Works

Your booking calendar shows available 30-minute slots for the next 91 days.
The schedule is stored in two places:

- **Database** (`availability` table) — this is what the live site reads from
- **Config file** (`availability-config.json`) — this defines your default schedule template

---

## 2. Changing Your Weekly Schedule

### Option A: Edit the Config File (Easiest)

1. Open the file `availability-config.json` in the project root
2. Find the `weekly_schedule` section
3. Each day has `enabled` (true/false) and `blocks` (time ranges)

**Example: Close Sundays completely**
```json
"sunday": { "enabled": false, "blocks": [] }
```

**Example: Add a lunch slot on Wednesdays**
```json
"wednesday": {
  "enabled": true,
  "blocks": [
    {"start": "07:00", "end": "09:00"},
    {"start": "12:00", "end": "13:00"},
    {"start": "17:00", "end": "20:00"}
  ]
}
```

**Example: Change Saturday hours to 9 AM – 12 PM**
```json
"saturday": { "enabled": true, "blocks": [{"start": "09:00", "end": "12:00"}] }
```

4. After editing, re-run the seed script (see Section 4)

### Option B: Edit the Database Directly

Connect to your PostgreSQL database and run queries:

**Block a specific date (e.g., holiday)**
```sql
UPDATE availability SET is_booked = TRUE
WHERE slot_date = '2026-07-04';
```

**Add a one-off slot**
```sql
INSERT INTO availability (slot_date, start_time, end_time)
VALUES ('2026-04-15', '14:00', '14:30');
```

**Remove a time from a specific day**
```sql
DELETE FROM availability
WHERE slot_date = '2026-04-15'
  AND start_time = '07:00'
  AND is_booked = FALSE;
```

---

## 3. Adding Blackout Dates (Holidays, Vacations)

1. Open `availability-config.json`
2. Add dates to the `blackout_dates` array:

```json
"blackout_dates": [
  "2026-12-25",
  "2026-01-01",
  "2026-07-04",
  "2026-11-26"
]
```

3. Re-run the seed script (Section 4)

Or block dates directly in the database:
```sql
UPDATE availability SET is_booked = TRUE
WHERE slot_date IN ('2026-07-04', '2026-11-26');
```

---

## 4. Re-Seeding Availability (Refreshing Slots)

When you change your schedule template, regenerate the slots:

```bash
# Connect to your database and run the seed script
psql -U postgres -h localhost -p 4040 -d matboss_online -f sql/seed.sql
```

This will:
- Remove all future un-booked slots
- Regenerate 91 days of fresh slots based on the current schedule
- Leave existing bookings untouched

**Safe to run anytime** — it only deletes un-booked future slots.

Verify the result:
```bash
psql -U postgres -h localhost -p 4040 -d matboss_online -f sql/verify.sql
```

---

## 5. Viewing Bookings

See all confirmed bookings:
```sql
SELECT booking_id, owner_name, school_name, email, phone,
       a.slot_date, a.start_time, a.end_time
FROM bookings b
JOIN availability a ON a.id = b.slot_id
ORDER BY a.slot_date DESC, a.start_time;
```

See today's bookings:
```sql
SELECT booking_id, owner_name, school_name, phone,
       a.start_time, a.end_time
FROM bookings b
JOIN availability a ON a.id = b.slot_id
WHERE a.slot_date = CURRENT_DATE
ORDER BY a.start_time;
```

---

## 6. Environment Variables (Netlify)

Set these in **Netlify > Site Settings > Environment Variables**:

| Variable      | Value                        |
|---------------|------------------------------|
| `DB_HOST`     | `localhost` for local setup  |
| `DB_PORT`     | `4040` for this local setup  |
| `DB_NAME`     | `matboss_online`             |
| `DB_USER`     | `postgres`                   |
| `DB_PASSWORD` | Your database password       |
| `DB_SSL`      | `true` (for remote DBs)      |

---

## 7. Quick Reference: Time Format

All times use **24-hour format** in **Pacific Time**:
- `07:00` = 7:00 AM
- `13:00` = 1:00 PM
- `17:00` = 5:00 PM
- `20:00` = 8:00 PM

---

## 8. Need Help?

Contact: alkhederammar147@gmail.com
