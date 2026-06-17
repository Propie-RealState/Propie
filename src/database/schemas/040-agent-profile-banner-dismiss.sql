ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS agent_profile_banner_dismissed BOOLEAN NOT NULL DEFAULT false;
