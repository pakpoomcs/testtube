/*
  # Mark existing users as onboarding completed

  The onboarding_completed column was added with DEFAULT false, which means
  every user who signed up before the onboarding feature exists gets redirected
  to onboarding on their next login.

  Fix: mark all profiles that already existed before this migration as completed.
  New signups will correctly start with false and go through the wizard.
*/

UPDATE profiles
SET onboarding_completed = true
WHERE onboarding_completed = false;
