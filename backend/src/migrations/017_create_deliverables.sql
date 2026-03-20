CREATE TABLE IF NOT EXISTS deliverables (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title        VARCHAR(500) NOT NULL,
  description  TEXT,
  due_date     DATE,
  status       VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','submitted','approved','rejected')),
  submitted_by UUID REFERENCES expert_profiles(id),
  submitted_at TIMESTAMPTZ,
  reviewed_by  UUID REFERENCES users(id),
  reviewed_at  TIMESTAMPTZ,
  review_note  TEXT,
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS deliverables_project_idx ON deliverables(project_id);
