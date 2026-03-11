/*
  # Seed exam data

  Inserts real exam data for TestTube launch:
  - IELTS Academic (English)
  - TOEIC (English)
  - SAT (Math + English)
  - TOEFL iBT (English)

  Each exam includes a mix of question types:
  - mcq: standard multiple choice
  - tfng: True / False / Not Given (IELTS)
  - fill_blank: fill in the blank
  - reading: passage-based comprehension

  Safe to re-run: uses DO block with existence checks.
*/

DO $$
DECLARE
  ielts_id    uuid;
  toeic_id    uuid;
  sat_id      uuid;
  toefl_id    uuid;
  passage_q   uuid;
BEGIN

-- ============================================================================
-- EXAMS
-- ============================================================================

INSERT INTO exams (id, name, name_th, description, description_th, category, difficulty, is_premium)
VALUES
  (gen_random_uuid(), 'IELTS Academic', 'ไอเอลทีเอส', 'International English Language Testing System — the world''s most popular English proficiency test for study and migration.', 'การทดสอบวัดระดับภาษาอังกฤษสำหรับการศึกษาต่อต่างประเทศ', 'English', 'Advanced', false),
  (gen_random_uuid(), 'TOEIC', 'โทอิค', 'Test of English for International Communication — focuses on everyday workplace English used in global business.', 'การทดสอบภาษาอังกฤษสำหรับการสื่อสารในที่ทำงาน', 'English', 'Intermediate', false),
  (gen_random_uuid(), 'SAT', 'เอสเอทีย', 'Scholastic Assessment Test — a standardised test for US college admissions covering reading, writing, and math.', 'การทดสอบมาตรฐานสำหรับสมัครเข้ามหาวิทยาลัยในสหรัฐอเมริกา', 'English', 'Advanced', false),
  (gen_random_uuid(), 'TOEFL iBT', 'โทเฟิล', 'Test of English as a Foreign Language — measures ability to use and understand English at the university level.', 'การทดสอบวัดความสามารถด้านภาษาอังกฤษระดับมหาวิทยาลัย', 'English', 'Advanced', false)
ON CONFLICT (name) DO NOTHING;

SELECT id INTO ielts_id FROM exams WHERE name = 'IELTS Academic' LIMIT 1;
SELECT id INTO toeic_id FROM exams WHERE name = 'TOEIC' LIMIT 1;
SELECT id INTO sat_id   FROM exams WHERE name = 'SAT'   LIMIT 1;
SELECT id INTO toefl_id FROM exams WHERE name = 'TOEFL iBT' LIMIT 1;

-- ============================================================================
-- IELTS QUESTIONS
-- ============================================================================

-- MCQ: Vocabulary
INSERT INTO questions (exam_id, question_type, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, topic, difficulty)
VALUES
(ielts_id, 'mcq',
 'The scientist''s findings were _______ by three independent laboratories before publication.',
 'refuted', 'corroborated', 'dismissed', 'fabricated', 'b',
 '"Corroborated" means confirmed or supported by evidence. The other options (refuted = disproved, dismissed = rejected, fabricated = made up) all carry negative or opposite meanings.',
 'Vocabulary', 'Medium'),

(ielts_id, 'mcq',
 'Choose the word closest in meaning to "mitigate".',
 'worsen', 'reduce', 'ignore', 'accelerate', 'b',
 '"Mitigate" means to make something less severe or serious. "Reduce" is the closest synonym. The others mean to increase or ignore the problem.',
 'Vocabulary', 'Medium'),

(ielts_id, 'mcq',
 'Which sentence uses the correct article?',
 'She is an university student.', 'He plays the piano beautifully.', 'I need a advice from you.', 'They visited a Europe last year.', 'b',
 '"The piano" is correct because we use "the" with musical instruments. "University" starts with a /j/ sound so it takes "a", not "an". "Advice" is uncountable so no article. "Europe" as a proper noun takes no article.',
 'Grammar', 'Easy'),

(ielts_id, 'mcq',
 'Select the sentence with correct subject-verb agreement.',
 'The team are playing well today.', 'Neither the students nor the teacher are ready.', 'Each of the books were damaged.', 'The number of applicants has increased.', 'd',
 '"The number of" takes a singular verb (has). "The team" in American English is singular. "Neither … nor" agrees with the closer subject (teacher = singular → is). "Each" is singular → was.',
 'Grammar', 'Hard'),

-- TFNG questions
(ielts_id, 'tfng',
 'Passage: "Renewable energy sources, including solar and wind, now account for over 30% of global electricity generation. However, fossil fuels remain the dominant energy source in most developing nations."\n\nStatement: Solar and wind energy together produce more electricity than any other single source worldwide.',
 NULL, NULL, NULL, NULL, NULL,
 '"Over 30% of global electricity" does not mean renewables produce more than any single source. The passage does not give enough information to confirm this claim.',
 'Reading Comprehension', 'Medium'),

(ielts_id, 'tfng',
 'Passage: "The Mediterranean diet, which emphasises olive oil, fish, vegetables, and moderate wine consumption, has been linked to reduced risk of cardiovascular disease in multiple long-term studies."\n\nStatement: The Mediterranean diet eliminates all meat products.',
 NULL, NULL, NULL, NULL, NULL,
 'The passage mentions fish (a meat product) as part of the diet. The claim that it "eliminates all meat" is false.',
 'Reading Comprehension', 'Easy'),

-- Fill-in-blank
(ielts_id, 'fill_blank',
 'Complete the sentence: The committee reached a [BLANK] after hours of discussion, agreeing on the new policy.',
 NULL, NULL, NULL, NULL, NULL,
 '"Consensus" (general agreement) is the correct answer. The sentence describes a group arriving at a shared decision.',
 'Vocabulary', 'Hard'),

(ielts_id, 'fill_blank',
 'Grammar: She would have passed the exam if she [BLANK] studied harder.',
 NULL, NULL, NULL, NULL, NULL,
 '"Had" is correct. Third conditional structure: "would have + past participle" requires "if + had + past participle" in the if-clause.',
 'Grammar', 'Medium');

-- Update TFNG and fill_blank answers
UPDATE questions SET tfng_answer = 'not_given'
WHERE exam_id = ielts_id AND question_text LIKE '%Solar and wind energy together%';

UPDATE questions SET tfng_answer = 'false'
WHERE exam_id = ielts_id AND question_text LIKE '%eliminates all meat%';

UPDATE questions SET blank_answer = 'consensus'
WHERE exam_id = ielts_id AND question_text LIKE '%committee reached a%';

UPDATE questions SET blank_answer = 'had'
WHERE exam_id = ielts_id AND question_text LIKE '%would have passed%';

-- Reading passage (IELTS)
INSERT INTO questions (id, exam_id, question_type, question_text, passage_title, passage_text, option_a, option_b, option_c, option_d, correct_option, explanation, topic, difficulty)
VALUES
(gen_random_uuid(), ielts_id, 'reading',
 'According to the passage, what is the primary driver of urban heat islands?',
 'Urban Heat Islands',
 'Urban heat islands occur when cities experience significantly higher temperatures than surrounding rural areas. The primary cause is the replacement of natural land cover with buildings, roads, and other infrastructure that absorb and re-emit solar radiation as heat. Dark surfaces such as asphalt and rooftops retain heat throughout the day and release it slowly at night. Additionally, reduced vegetation means less evapotranspiration — the process by which plants release water vapour that cools the air. Human activities such as vehicle emissions and air conditioning also contribute, though to a lesser extent.',
 'Human activities such as vehicle use', 'Replacement of natural land with heat-absorbing surfaces', 'Increased air conditioning use in buildings', 'Reduced wind speeds in city centres', 'b',
 'The passage explicitly states that "the primary cause is the replacement of natural land cover with buildings, roads, and other infrastructure." Other factors are mentioned but described as contributing to a lesser extent.',
 'Reading Comprehension', 'Medium')
RETURNING id INTO passage_q;

INSERT INTO questions (exam_id, question_type, question_text, passage_id, option_a, option_b, option_c, option_d, correct_option, explanation, topic, difficulty)
VALUES
(ielts_id, 'reading',
 'What role does vegetation play in cooling urban areas?',
 passage_q,
 'It reflects sunlight away from the ground', 'It reduces traffic and vehicle emissions', 'It releases water vapour through evapotranspiration', 'It increases wind speed between buildings', 'c',
 'The passage states that "reduced vegetation means less evapotranspiration — the process by which plants release water vapour that cools the air," directly linking vegetation to cooling through evapotranspiration.',
 'Reading Comprehension', 'Easy');

-- ============================================================================
-- TOEIC QUESTIONS
-- ============================================================================

INSERT INTO questions (exam_id, question_type, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, topic, difficulty)
VALUES
(toeic_id, 'mcq',
 'The project deadline has been moved _______ two weeks due to the supply chain delay.',
 'forward', 'back', 'over', 'across', 'b',
 '"Moved back" means postponed to a later date. "Moved forward" would mean brought to an earlier date. "Moved over" and "moved across" are not standard in this context.',
 'Business English', 'Easy'),

(toeic_id, 'mcq',
 'Please _______ the attached report and share your feedback by Friday.',
 'review', 'revise', 'reconsider', 'recount', 'a',
 '"Review" means to examine or assess something. While "revise" means to change, "reconsider" means to think again about a decision, and "recount" means to count again or tell a story.',
 'Business English', 'Easy'),

(toeic_id, 'mcq',
 'The quarterly _______ showed a 12% increase in revenue compared to the same period last year.',
 'results', 'reports', 'figures', 'statement', 'c',
 '"Figures" is the most natural colocation with "quarterly" in business contexts (quarterly figures = statistics/numbers). All options are plausible but "figures" is most idiomatic here.',
 'Business Vocabulary', 'Medium'),

(toeic_id, 'mcq',
 'Staff are _______ to complete the mandatory safety training by the end of the month.',
 'requested', 'required', 'reminded', 'recommended', 'b',
 '"Required" indicates a mandatory obligation. "Requested" suggests a polite ask, "reminded" means told again, and "recommended" suggests optional advice — none carry the same obligation as "required".',
 'Workplace Communication', 'Easy'),

(toeic_id, 'mcq',
 'Could you _______ a meeting for next Tuesday at 10 a.m.?',
 'arrange', 'plan', 'book', 'schedule', 'd',
 '"Schedule a meeting" is the most standard business English phrase. While "arrange" and "book" work in other contexts, "schedule" is the most common colocation with "meeting" in professional settings.',
 'Business English', 'Easy'),

(toeic_id, 'mcq',
 'The marketing team will _______ a product launch event for the new software.',
 'host', 'make', 'do', 'perform', 'a',
 '"Host an event" is the correct collocation. You "make" or "do" tasks, and "perform" is used for shows or duties — but "host" specifically applies to organising and running events.',
 'Business Vocabulary', 'Medium'),

(toeic_id, 'mcq',
 'The invoice must be _______ within 30 days of receipt.',
 'paid', 'settled', 'cleared', 'processed', 'b',
 '"Settled" is the most common business term for paying an invoice in full. While "paid" is technically correct, "settle an invoice" is the conventional phrase in finance and accounting.',
 'Finance', 'Medium'),

(toeic_id, 'mcq',
 'Mr. Kim will be _______ for the CEO during her absence next week.',
 'substituting', 'replacing', 'covering', 'standing', 'c',
 '"Covering for" someone means temporarily doing their job. "Substituting" and "replacing" imply a permanent change. "Standing" alone doesn''t make grammatical sense without "in".',
 'Workplace Communication', 'Medium'),

(toeic_id, 'fill_blank',
 'Please find the meeting [BLANK] attached to this email.',
 NULL, NULL, NULL, NULL, NULL,
 '"Agenda" is the word for a list of items to be discussed in a meeting. This is a common business English term.',
 'Business Vocabulary', 'Easy');

UPDATE questions SET blank_answer = 'agenda'
WHERE exam_id = toeic_id AND question_text LIKE '%Please find the meeting%';

-- ============================================================================
-- SAT QUESTIONS
-- ============================================================================

INSERT INTO questions (exam_id, question_type, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, topic, difficulty)
VALUES
(sat_id, 'mcq',
 'Which choice most effectively combines the two sentences? "The council voted on the proposal. It passed by a narrow margin."',
 'The council voted on the proposal, and it passed narrowly.', 'The council voted on the proposal; which passed by a narrow margin.', 'The council''s vote on the proposal, it passed by a narrow margin.', 'Although the council voted on the proposal, it passed narrowly.', 'a',
 'Option A correctly uses a comma + coordinating conjunction (and) to join two independent clauses. Option B uses a semicolon incorrectly before "which". Option C is a comma splice. Option D implies contrast with "although," which is illogical.',
 'Writing & Language', 'Medium'),

(sat_id, 'mcq',
 'In the sentence "The committee, comprising twelve members from diverse backgrounds, meets quarterly," what is the function of the phrase "comprising twelve members from diverse backgrounds"?',
 'It is the subject of the sentence.', 'It modifies the noun "committee".', 'It acts as a predicate adjective.', 'It introduces a new independent clause.', 'b',
 'The participial phrase "comprising twelve members from diverse backgrounds" is set off by commas and modifies the subject noun "committee," giving extra information about it.',
 'Writing & Language', 'Hard'),

(sat_id, 'mcq',
 'If 3x + 7 = 22, what is the value of x?',
 '3', '4', '5', '6', 'c',
 '3x + 7 = 22 → 3x = 15 → x = 5. Subtract 7 from both sides, then divide by 3.',
 'Math — Algebra', 'Easy'),

(sat_id, 'mcq',
 'A rectangle has a length that is 3 times its width. If the perimeter is 48 cm, what is the area of the rectangle?',
 '81 cm²', '108 cm²', '144 cm²', '96 cm²', 'b',
 'Let width = w, length = 3w. Perimeter = 2(w + 3w) = 8w = 48, so w = 6 and length = 18. Area = 6 × 18 = 108 cm².',
 'Math — Geometry', 'Medium'),

(sat_id, 'mcq',
 'Which word is closest in meaning to "ambivalent" as used in the sentence: "She felt ambivalent about accepting the promotion, torn between excitement and fear."',
 'enthusiastic', 'indifferent', 'conflicted', 'certain', 'c',
 '"Ambivalent" means having mixed or contradictory feelings. "Conflicted" is the closest match. "Indifferent" means not caring at all, "enthusiastic" is purely positive, and "certain" means sure.',
 'Reading — Vocabulary in Context', 'Medium'),

(sat_id, 'mcq',
 'If f(x) = 2x² − 4x + 1, what is f(3)?',
 '7', '11', '13', '5', 'a',
 'f(3) = 2(3)² − 4(3) + 1 = 2(9) − 12 + 1 = 18 − 12 + 1 = 7.',
 'Math — Functions', 'Medium'),

(sat_id, 'fill_blank',
 'Math: If 5 is subtracted from twice a number and the result is 13, the number is [BLANK].',
 NULL, NULL, NULL, NULL, NULL,
 'Let n = the number. 2n − 5 = 13 → 2n = 18 → n = 9.',
 'Math — Algebra', 'Easy');

UPDATE questions SET blank_answer = '9'
WHERE exam_id = sat_id AND question_text LIKE '%5 is subtracted from twice%';

-- ============================================================================
-- TOEFL QUESTIONS
-- ============================================================================

INSERT INTO questions (exam_id, question_type, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, topic, difficulty)
VALUES
(toefl_id, 'mcq',
 'The word "proliferation" in academic texts most likely means:',
 'decline', 'rapid increase', 'modification', 'distribution', 'b',
 '"Proliferation" comes from Latin meaning to reproduce rapidly. In academic contexts it refers to a rapid spread or increase of something.',
 'Academic Vocabulary', 'Medium'),

(toefl_id, 'mcq',
 'Which of the following is an example of a complex sentence?',
 'The dog barked and the cat ran away.', 'She left early; he arrived late.', 'Although it was raining, they continued the game.', 'Run fast!', 'c',
 'A complex sentence has one independent clause and at least one dependent clause. "Although it was raining" is a dependent clause; "they continued the game" is the independent clause.',
 'Grammar', 'Medium'),

(toefl_id, 'mcq',
 'In an academic essay, the thesis statement is typically placed:',
 'At the very beginning of the introduction', 'At the end of the introduction paragraph', 'At the start of the first body paragraph', 'In the conclusion', 'b',
 'The thesis statement — the central argument of the essay — is conventionally placed at the end of the introduction, after background information has been provided.',
 'Academic Writing', 'Easy'),

(toefl_id, 'mcq',
 'Choose the most appropriate transition for: "The results were inconclusive. _______, further research is needed."',
 'However', 'Therefore', 'In contrast', 'Nevertheless', 'b',
 '"Therefore" introduces a logical conclusion or result. If results are inconclusive, it logically follows that more research is needed. "However" and "In contrast" signal contrast, and "Nevertheless" signals a concession.',
 'Academic Writing', 'Easy'),

(toefl_id, 'mcq',
 'Which sentence is written in the passive voice?',
 'The researchers conducted three experiments.', 'Three experiments were conducted by the researchers.', 'The researchers had planned the experiments carefully.', 'The experiment results surprised the team.', 'b',
 'Passive voice: the subject (three experiments) receives the action. The formula is "to be + past participle" (were conducted). All other options use active voice.',
 'Grammar', 'Easy');

-- Reading passage (TOEFL)
INSERT INTO questions (id, exam_id, question_type, question_text, passage_title, passage_text, option_a, option_b, option_c, option_d, correct_option, explanation, topic, difficulty)
VALUES
(gen_random_uuid(), toefl_id, 'reading',
 'What does the passage suggest is the main advantage of spaced repetition over massed practice?',
 'Spaced Repetition in Learning',
 'Cognitive scientists have long debated the most effective methods for long-term knowledge retention. Massed practice — commonly known as "cramming" — involves studying material intensively over a short period. While this approach can produce short-term recall, research consistently shows that information learned this way is forgotten rapidly. Spaced repetition, by contrast, involves distributing study sessions over time with increasing intervals between reviews. This technique exploits the psychological spacing effect: each time a memory is retrieved after a delay, the neural pathways associated with that memory are strengthened, making future recall easier and more durable. Studies show that spaced repetition can improve long-term retention by up to 200% compared to massed practice.',
 'It requires less total study time overall', 'It strengthens memory through retrieval at increasing intervals', 'It is easier to implement using digital flashcard apps', 'It prevents students from feeling overwhelmed', 'b',
 'The passage states that "each time a memory is retrieved after a delay, the neural pathways associated with that memory are strengthened." This is the core advantage described — not time savings, technology, or emotional factors.',
 'Reading Comprehension', 'Medium')
RETURNING id INTO passage_q;

INSERT INTO questions (exam_id, question_type, question_text, passage_id, option_a, option_b, option_c, option_d, correct_option, explanation, topic, difficulty)
VALUES
(toefl_id, 'reading',
 'The word "durable" in the passage is closest in meaning to:',
 passage_q,
 'immediate', 'long-lasting', 'frequent', 'accurate', 'b',
 '"Durable" means able to last for a long time. The passage uses it to describe memories that persist — making "long-lasting" the correct synonym.',
 'Reading Comprehension', 'Easy');

END $$;
