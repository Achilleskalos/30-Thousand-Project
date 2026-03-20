CREATE TABLE IF NOT EXISTS dictionaries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category   VARCHAR(100) NOT NULL,
  code       VARCHAR(100) NOT NULL,
  label      VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active  BOOLEAN DEFAULT TRUE,
  remark     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, code)
);

-- Seed default dictionary values
INSERT INTO dictionaries (category, code, label, sort_order) VALUES
  ('expert_level',    'junior',    '初级',     1),
  ('expert_level',    'mid',       '中级',     2),
  ('expert_level',    'senior',    '高级',     3),
  ('expert_level',    'principal', '首席',     4),
  ('expert_domain',   'ai',        '人工智能', 1),
  ('expert_domain',   'bigdata',   '大数据',   2),
  ('expert_domain',   'cloud',     '云计算',   3),
  ('expert_domain',   'security',  '网络安全', 4),
  ('expert_domain',   'iot',       '物联网',   5),
  ('expert_domain',   'blockchain','区块链',   6),
  ('project_type',    'research',  '研究课题', 1),
  ('project_type',    'consulting','技术咨询', 2),
  ('project_type',    'dev',       '开发实施', 3),
  ('project_type',    'review',    '评审鉴定', 4)
ON CONFLICT (category, code) DO NOTHING;
