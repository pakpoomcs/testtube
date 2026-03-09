# TestTube Setup Instructions

## Database Setup Complete

Your database schema has been successfully created with the following tables:

- **profiles** - User profiles and admin status
- **exams** - Exam metadata
- **questions** - Individual exam questions
- **user_results** - User answers to questions
- **test_sessions** - Complete test session records

All tables have Row Level Security enabled.

## Next Steps

### 1. Create Your First User

Sign up through the application at `/auth`. This will automatically create a profile.

### 2. Make Yourself Admin (Database Access Required)

You'll need to manually update your profile in the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Table Editor > profiles
3. Find your user record
4. Set `is_admin` to `true`

Alternatively, run this SQL in the Supabase SQL Editor:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

### 3. Add Exam Data

Once you're an admin, navigate to `/admin` to:

- Create exams (IELTS, TOEIC, ONET, etc.)
- Add questions to each exam
- Manage existing content

### 4. Sample Data (Optional)

If you want to add sample data quickly, run this in Supabase SQL Editor:

```sql
-- Sample IELTS Exam
INSERT INTO exams (name, name_th, description, description_th, category, difficulty, is_premium)
VALUES (
  'IELTS',
  'ไอเอลทีเอส',
  'International English Language Testing System',
  'ระบบการทดสอบภาษาอังกฤษระดับสากล',
  'English',
  'Advanced',
  false
) RETURNING id;

-- Copy the returned ID and use it below (replace YOUR_EXAM_ID)

-- Sample Questions
INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, topic, difficulty, is_premium)
VALUES
  (
    'YOUR_EXAM_ID',
    'Which sentence uses the present perfect correctly?',
    'I have went to the store yesterday.',
    'I have gone to the store yesterday.',
    'I have been to the store three times this week.',
    'I am going to the store yesterday.',
    'c',
    'Present perfect is used for actions that happened at an unspecified time or have relevance to the present. Option C correctly uses "have been" with a time period that includes the present ("this week").',
    'Grammar',
    'Medium',
    false
  ),
  (
    'YOUR_EXAM_ID',
    'What does "break the ice" mean?',
    'To literally break ice',
    'To make people feel more relaxed in a social situation',
    'To stop a conversation',
    'To tell a joke',
    'b',
    '"Break the ice" is an idiom meaning to initiate conversation or help people feel comfortable in a social setting, especially when meeting for the first time.',
    'Vocabulary',
    'Easy',
    false
  );
```

## Troubleshooting

### "No exams available"
- Log in as admin and create exams via `/admin`

### "User not authorized"
- Ensure your profile has `is_admin = true` in the database

### "Cannot read properties"
- Clear browser cache and sign in again
- Verify database tables exist in Supabase dashboard

### Connection errors
- Check that `.env` file has correct Supabase URL and anon key
- Verify Supabase project is not paused

## Architecture Notes

- Auth handled by Supabase Auth
- Profiles auto-created on signup via database trigger
- RLS policies restrict data access based on user authentication
- Admin panel only visible to users with `is_admin = true`
