CREATE TABLE IF NOT EXISTS milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       VARCHAR(500) NOT NULL,
  description TEXT,
  due_date    DATE,
  status      VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','completed','overdue')),
  completed_at TIMESTAMPTZ,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS milestones_project_idx ON milestones(project_id);
