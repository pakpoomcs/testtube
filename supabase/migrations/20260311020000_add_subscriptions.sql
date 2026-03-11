/*
  # Add subscription fields to profiles

  Adds subscription tracking to user profiles:
  - subscription_status: 'free' | 'premium' | 'cancelled'
  - subscription_expires_at: when premium access expires (null = free)
  - stripe_customer_id: Stripe customer reference (set when user first checks out)

  Daily question limits are enforced by counting user_results rows
  for today — no separate table needed.

  Free tier:  50 questions/day, free exams only
  Premium:    Unlimited questions, all exams/questions
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_status     text    NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_customer_id      text;

-- Index for webhook lookups by stripe customer id
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
