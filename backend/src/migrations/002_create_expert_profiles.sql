CREATE TABLE IF NOT EXISTS expert_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name     VARCHAR(255) NOT NULL,
  title         VARCHAR(255),
  organization  VARCHAR(255),
  phone         VARCHAR(50),
  bio           TEXT,
  domain_tags   TEXT[] DEFAULT '{}',
  skills        TEXT[] DEFAULT '{}',
  years_exp     INTEGER,
  linkedin_url  VARCHAR(500),
  avatar_url    VARCHAR(500),
  status        VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','suspended')),
  review_note   TEXT,
  reviewed_by   UUID REFERENCES users(id),
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expert_domains_idx ON expert_profiles USING GIN(domain_tags);
CREATE INDEX IF NOT EXISTS expert_skills_idx ON expert_profiles USING GIN(skills);
