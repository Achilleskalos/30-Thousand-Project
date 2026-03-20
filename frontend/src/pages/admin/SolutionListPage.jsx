import { useState, useEffect } from 'react';
import { Table, Input, Select, Button, Space, Typography, message } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getSolutions } from '../../api/solutionApi';
import StatusTag from '../../components/common/StatusTag';

const { Title } = Typography;
const { Option } = Select;

const CATEGORIES = ['人工智能', '大数据', '云计算', '网络安全', '物联网', '区块链', '软件工程', '机械工程', '电气工程', '化工', '医疗', '金融科技'];

const SolutionListPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ page: 1, limit: 10, status: undefined, search: '', category: undefined });

  const fetchData = async (params = filters) => {
    setLoading(true);
    try {
      const res = await getSolutions(params);
      setData(res.data.data.data);
      setTotal(res.data.data.total);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const columns = [
    { title: '方案标题', dataIndex: 'title', ellipsis: true },
    { title: '专家', dataIndex: 'expert_name' },
    { title: '机构', dataIndex: 'organization', render: v => v || '-' },
    { title: '分类', dataIndex: 'category', render: v => v || '-' },
    { title: '状态', dataIndex: 'status', render: v => <StatusTag status={v} /> },
    { title: '提交时间', dataIndex: 'created_at', render: v => new Date(v).toLocaleDateString('zh-CN') },
    {
      title: '操作',
      render: (_, r) => (
        <Button icon={<EyeOutlined />} size="small" onClick={() => navigate(`/admin/solutions/${r.id}`)}>查看</Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>方案管理</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索方案标题/专家姓名"
          prefix={<SearchOutlined />}
          style={{ width: 240 }}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          onPressEnter={() => fetchData({ ...filters, page: 1 })}
        />
        <Select placeholder="筛选状态" allowClear style={{ width: 140 }}
          onChange={v => { const nf = { ...filters, status: v, page: 1 }; setFilters(nf); fetchData(nf); }}>
          <Option value="draft">草稿</Option>
          <Option value="submitted">已提交</Option>
          <Option value="under_review">评审中</Option>
          <Option value="revision_required">需修改</Option>
          <Option value="approved">已通过</Option>
          <Option value="rejected">已拒绝</Option>
          <Option value="archived">已归档</Option>
        </Select>
        <Select placeholder="筛选分类" allowClear style={{ width: 140 }}
          onChange={v => { const nf = { ...filters, category: v, page: 1 }; setFilters(nf); fetchData(nf); }}>
          {CATEGORIES.map(c => <Option key={c} value={c}>{c}</Option>)}
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

export default SolutionListPage;
