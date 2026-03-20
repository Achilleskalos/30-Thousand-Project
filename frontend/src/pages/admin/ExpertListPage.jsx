import { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Space, Typography, message, Avatar } from 'antd';
import { SearchOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getExperts } from '../../api/expertApi';
import StatusTag from '../../components/common/StatusTag';

const { Title } = Typography;
const { Option } = Select;

const ExpertListPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ page: 1, limit: 10, status: undefined, search: '' });

  const fetchData = async (params = filters) => {
    setLoading(true);
    try {
      const res = await getExperts(params);
      setData(res.data.data.data);
      setTotal(res.data.data.total);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const columns = [
    {
      title: '专家',
      render: (_, r) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={r.avatar_url} />
          <span>{r.full_name}</span>
        </Space>
      ),
    },
    { title: '邮箱', dataIndex: 'email' },
    { title: '机构', dataIndex: 'organization', render: v => v || '-' },
    { title: '领域', dataIndex: 'domain_tags', render: v => v?.join('、') || '-' },
    { title: '工作年限', dataIndex: 'years_exp', render: v => v ? `${v}年` : '-' },
    { title: '状态', dataIndex: 'status', render: v => <StatusTag status={v} /> },
    {
      title: '操作',
      render: (_, r) => (
        <Button icon={<EyeOutlined />} size="small" onClick={() => navigate(`/admin/experts/${r.id}`)}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>专家管理</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索姓名/邮箱/机构"
          prefix={<SearchOutlined />}
          style={{ width: 240 }}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          onPressEnter={() => fetchData({ ...filters, page: 1 })}
        />
        <Select
          placeholder="筛选状态"
          allowClear
          style={{ width: 140 }}
          onChange={v => { const nf = { ...filters, status: v, page: 1 }; setFilters(nf); fetchData(nf); }}
        >
          <Option value="pending">待审核</Option>
          <Option value="approved">已通过</Option>
          <Option value="rejected">已拒绝</Option>
          <Option value="suspended">已暂停</Option>
        </Select>
        <Button type="primary" onClick={() => fetchData({ ...filters, page: 1 })}>搜索</Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ total, pageSize: filters.limit, current: filters.page, onChange: (page) => { const nf = { ...filters, page }; setFilters(nf); fetchData(nf); } }}
      />
    </div>
  );
};

export default ExpertListPage;
