/*
  # Deduplicate exams and add unique constraint on name

  The initial seed had no unique constraint on exams.name, allowing duplicate
  rows if the migration was run more than once or exams already existed.

  This migration:
  1. For each duplicate exam name, keeps the row with the most questions
     attached (falls back to oldest row if tied).
  2. Reassigns any questions from the dropped duplicate to the kept row.
  3. Deletes the duplicate exam rows.
  4. Adds a UNIQUE constraint on exams.name to prevent future duplicates.
*/

DO $$
DECLARE
  rec       RECORD;
  keep_id   uuid;
  drop_id   uuid;
BEGIN
  -- Find all exam names that appear more than once
  FOR rec IN
    SELECT name
    FROM exams
    GROUP BY name
    HAVING COUNT(*) > 1
  LOOP
    -- Pick the row with the most questions as the keeper
    SELECT e.id INTO keep_id
    FROM exams e
    LEFT JOIN questions q ON q.exam_id = e.id
    WHERE e.name = rec.name
    GROUP BY e.id
    ORDER BY COUNT(q.id) DESC, e.created_at ASC
    LIMIT 1;

    -- For every other row with this name, move questions then delete
    FOR drop_id IN
      SELECT id FROM exams WHERE name = rec.name AND id <> keep_id
    LOOP
      -- Reassign questions from duplicate to keeper
      UPDATE questions SET exam_id = keep_id WHERE exam_id = drop_id;
      -- Also reassign any test_sessions / user_results
      UPDATE test_sessions SET exam_id = keep_id WHERE exam_id = drop_id;
      UPDATE user_results   SET exam_id = keep_id WHERE exam_id = drop_id;
      -- Now safe to delete
      DELETE FROM exams WHERE id = drop_id;
    END LOOP;
  END LOOP;
END $$;

-- Prevent duplicates in the future
ALTER TABLE exams ADD CONSTRAINT exams_name_unique UNIQUE (name);
