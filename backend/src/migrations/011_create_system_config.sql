CREATE TABLE IF NOT EXISTS system_config (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key  VARCHAR(100) NOT NULL UNIQUE,
  config_val  TEXT,
  label       VARCHAR(255),
  group_name  VARCHAR(100) DEFAULT 'general',
  remark      TEXT,
  updated_by  UUID REFERENCES users(id),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO system_config (config_key, config_val, label, group_name) VALUES
  ('platform_name',       '专家管理平台',  '平台名称',       'general'),
  ('platform_version',    '1.0.0',         '平台版本',       'general'),
  ('review_max_days',     '7',             '审核最大天数',   'review'),
  ('max_solutions_per_expert', '20',       '每位专家最多方案数', 'solution'),
  ('file_max_size_mb',    '20',            '文件最大大小(MB)', 'upload'),
  ('allowed_file_types',  'pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,png,zip', '允许的文件类型', 'upload')
ON CONFLICT (config_key) DO NOTHING;
