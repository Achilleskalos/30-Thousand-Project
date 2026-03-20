CREATE TABLE IF NOT EXISTS solution_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  version     INTEGER NOT NULL,
  title       VARCHAR(500),
  abstract    TEXT,
  content     TEXT,
  category    VARCHAR(100),
  tags        TEXT[] DEFAULT '{}',
  saved_by    UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS solution_versions_solution_idx ON solution_versions(solution_id, version DESC);
