CREATE TABLE IF NOT EXISTS solution_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  stage       INTEGER NOT NULL,
  reviewer_id UUID REFERENCES users(id),
  verdict     VARCHAR(20) CHECK (verdict IN ('approved','rejected','revision_required')),
  comments    TEXT,
  reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
