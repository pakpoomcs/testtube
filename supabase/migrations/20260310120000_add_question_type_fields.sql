/*
  # Add question type fields to questions table

  Adds support for multiple question types used by TestScreen:
  - question_type: mcq | reading | tfng | fill_blank (default: mcq)
  - tfng_answer: answer for True/False/Not Given questions
  - blank_answer: correct answer for fill-in-the-blank questions
  - passage_text: reading passage shared across multiple questions
  - passage_title: title of the reading passage
  - passage_id: references another question that holds the passage (for grouping)
*/

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS question_type  text NOT NULL DEFAULT 'mcq',
  ADD COLUMN IF NOT EXISTS tfng_answer    text,
  ADD COLUMN IF NOT EXISTS blank_answer   text,
  ADD COLUMN IF NOT EXISTS passage_text   text,
  ADD COLUMN IF NOT EXISTS passage_title  text,
  ADD COLUMN IF NOT EXISTS passage_id     uuid REFERENCES questions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_questions_passage_id ON questions(passage_id);
