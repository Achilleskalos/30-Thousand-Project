CREATE TABLE IF NOT EXISTS messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id    UUID NOT NULL,
  sender_id    UUID REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  subject      VARCHAR(500),
  body         TEXT NOT NULL,
  is_read      BOOLEAN DEFAULT false,
  parent_id    UUID REFERENCES messages(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_thread_idx ON messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON messages(recipient_id, is_read);
