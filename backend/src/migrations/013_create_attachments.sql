CREATE TABLE IF NOT EXISTS attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  VARCHAR(50) NOT NULL,
  entity_id    UUID NOT NULL,
  file_name    VARCHAR(500) NOT NULL,
  file_path    VARCHAR(1000) NOT NULL,
  file_size    INTEGER,
  mime_type    VARCHAR(100),
  uploaded_by  UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS attachments_entity_idx ON attachments(entity_type, entity_id);
