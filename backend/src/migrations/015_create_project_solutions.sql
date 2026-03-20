CREATE TABLE IF NOT EXISTS project_solutions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  linked_by   UUID REFERENCES users(id),
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, solution_id)
);
