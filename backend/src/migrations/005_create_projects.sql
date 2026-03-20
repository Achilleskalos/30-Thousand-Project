CREATE TABLE IF NOT EXISTS projects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            VARCHAR(500) NOT NULL,
  description      TEXT,
  required_skills  TEXT[] DEFAULT '{}',
  required_domains TEXT[] DEFAULT '{}',
  status           VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open','in_progress','completed','cancelled')),
  start_date       DATE,
  end_date         DATE,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS project_skills_idx ON projects USING GIN(required_skills);
