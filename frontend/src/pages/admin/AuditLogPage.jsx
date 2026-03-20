import { useState, useEffect } from 'react';
import { Table, Typography, Select, Input, Space, Tag, DatePicker, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getAuditLogs } from '../../api/auditApi';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const entityTypeColor = {
  expert_profile: 'blue',
  solution: 'green',
  project: 'orange',
  system_config: 'purple',
};

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ page: 1, limit: 20 });

  const load = async (params = filters) => {
    setLoading(true);
    try {
      const res = await getAuditLogs(params);
      const data = res.data.data;
      setLogs(data.data || []);
      setTotal(data.total || 0);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleFilter = (key, value) => {
    const next = { ...filters, [key]: value, page: 1 };
    setFilters(next);
    load(next);
  };

  const handleReset = () => {
    const next = { page: 1, limit: 20 };
    setFilters(next);
    load(next);
  };

  const columns = [
    {
      title: '时间',
      dataIndex: 'created_at',
      width: 160,
      render: v => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作用户',
      dataIndex: 'user_email',
      width: 180,
      render: (v, r) => v || r.user_id || '-',
    },
    {
      title: '实体类型',
      dataIndex: 'entity_type',
      width: 130,
      render: v => v ? <Tag color={entityTypeColor[v] || 'default'}>{v}</Tag> : '-',
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 180,
      render: v => <Tag>{v}</Tag>,
    },
    {
      title: '实体ID',
      dataIndex: 'entity_id',
      width: 140,
      render: v => v ? <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{v.slice(0, 8)}...</span> : '-',
    },
    {
      title: 'IP地址',
      dataIndex: 'ip_address',
      width: 130,
      render: v => v || '-',
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>操作日志</Title>

      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          placeholder="实体类型"
          allowClear
          style={{ width: 160 }}
          onChange={v => handleFilter('entityType', v)}
        >
          <Option value="expert_profile">专家资料</Option>
          <Option value="solution">方案</Option>
          <Option value="project">项目</Option>
          <Option value="system_config">系统配置</Option>
        </Select>

        <Input
          placeholder="操作类型关键字"
          prefix={<SearchOutlined />}
          style={{ width: 200 }}
          allowClear
          onPressEnter={e => handleFilter('action', e.target.value)}
          onClear={() => handleFilter('action', undefined)}
        />

        <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={logs}
        loading={loading}
        size="small"
        pagination={{
          total,
          current: filters.page,
          pageSize: filters.limit,
          showTotal: t => `共 ${t} 条`,
          onChange: (page) => {
            const next = { ...filters, page };
            setFilters(next);
            load(next);
          },
        }}
      />
    </div>
  );
};

export default AuditLogPage;
