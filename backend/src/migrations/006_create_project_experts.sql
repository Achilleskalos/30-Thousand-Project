CREATE TABLE IF NOT EXISTS project_experts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  expert_id      UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
  role           VARCHAR(100),
  joined_at      TIMESTAMPTZ DEFAULT NOW(),
  progress_pct   INTEGER DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  progress_notes TEXT,
  status         VARCHAR(30) DEFAULT 'active' CHECK (status IN ('invited','active','completed','removed')),
  UNIQUE(project_id, expert_id)
);
