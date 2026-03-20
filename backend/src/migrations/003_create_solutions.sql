CREATE TABLE IF NOT EXISTS solutions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id     UUID NOT NULL REFERENCES expert_profiles(id) ON DELETE CASCADE,
  title         VARCHAR(500) NOT NULL,
  abstract      TEXT,
  content       TEXT,
  category      VARCHAR(100),
  tags          TEXT[] DEFAULT '{}',
  attachments   JSONB DEFAULT '[]',
  status        VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft','submitted','under_review','revision_required','approved','rejected','archived')),
  current_stage INTEGER DEFAULT 0,
  search_vector TSVECTOR,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS solutions_search_idx ON solutions USING GIN(search_vector);

CREATE OR REPLACE FUNCTION solutions_tsvector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('pg_catalog.english', coalesce(NEW.title,'')), 'A') ||
    setweight(to_tsvector('pg_catalog.english', coalesce(NEW.abstract,'')), 'B') ||
    setweight(to_tsvector('pg_catalog.english', coalesce(NEW.content,'')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS solutions_tsvector_update ON solutions;
CREATE TRIGGER solutions_tsvector_update
  BEFORE INSERT OR UPDATE ON solutions
  FOR EACH ROW EXECUTE FUNCTION solutions_tsvector_trigger();
