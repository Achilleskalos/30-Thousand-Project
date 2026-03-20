import { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Space, Typography, message } from 'antd';
import { SearchOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../../api/projectApi';
import StatusTag from '../../components/common/StatusTag';

const { Title } = Typography;
const { Option } = Select;

const ProjectListPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ page: 1, limit: 10, status: undefined, search: '' });

  const fetchData = async (params = filters) => {
    setLoading(true);
    try {
      const res = await getProjects(params);
      setData(res.data.data.data);
      setTotal(res.data.data.total);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const columns = [
    { title: '项目名称', dataIndex: 'title', ellipsis: true },
    { title: '专家人数', dataIndex: 'expert_count' },
    { title: '开始日期', dataIndex: 'start_date', render: v => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
    { title: '结束日期', dataIndex: 'end_date', render: v => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
    { title: '状态', dataIndex: 'status', render: v => <StatusTag status={v} /> },
    {
      title: '操作',
      render: (_, r) => (
        <Button icon={<EyeOutlined />} size="small" onClick={() => navigate(`/admin/projects/${r.id}`)}>查看</Button>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>项目管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/projects/new')}>新建项目</Button>
      </Space>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索项目名称"
          prefix={<SearchOutlined />}
          style={{ width: 240 }}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          onPressEnter={() => fetchData({ ...filters, page: 1 })}
        />
        <Select placeholder="筛选状态" allowClear style={{ width: 140 }}
          onChange={v => { const nf = { ...filters, status: v, page: 1 }; setFilters(nf); fetchData(nf); }}>
          <Option value="open">开放中</Option>
          <Option value="in_progress">进行中</Option>
          <Option value="completed">已完成</Option>
          <Option value="cancelled">已取消</Option>
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

export default ProjectListPage;
