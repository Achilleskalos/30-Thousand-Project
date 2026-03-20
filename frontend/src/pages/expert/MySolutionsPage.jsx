import { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, message, Tag } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getMySolutions, submitSolution } from '../../api/solutionApi';
import StatusTag from '../../components/common/StatusTag';

const { Title } = Typography;

const MySolutionsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getMySolutions({ page: p, limit: 10 });
      setData(res.data.data.data);
      setTotal(res.data.data.total);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (id) => {
    try {
      await submitSolution(id);
      message.success('已提交审核');
      fetchData(page);
    } catch (err) { message.error(err.response?.data?.error?.message || '提交失败'); }
  };

  const columns = [
    { title: '方案标题', dataIndex: 'title', ellipsis: true },
    { title: '分类', dataIndex: 'category', render: v => v || '-' },
    { title: '标签', dataIndex: 'tags', render: v => v?.map(t => <Tag key={t}>{t}</Tag>) || '-' },
    { title: '状态', dataIndex: 'status', render: v => <StatusTag status={v} /> },
    { title: '更新时间', dataIndex: 'updated_at', render: v => new Date(v).toLocaleDateString('zh-CN') },
    {
      title: '操作',
      render: (_, r) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => navigate(`/expert/solutions/${r.id}`)}>查看</Button>
          {['draft', 'revision_required'].includes(r.status) && (
            <>
              <Button icon={<EditOutlined />} size="small" onClick={() => navigate(`/expert/solutions/${r.id}/edit`)}>编辑</Button>
              <Button icon={<SendOutlined />} size="small" type="primary" onClick={() => handleSubmit(r.id)}>提交</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>我的方案</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/expert/solutions/new')}>新建方案</Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ total, pageSize: 10, current: page, onChange: (p) => { setPage(p); fetchData(p); } }}
      />
    </div>
  );
};

export default MySolutionsPage;
