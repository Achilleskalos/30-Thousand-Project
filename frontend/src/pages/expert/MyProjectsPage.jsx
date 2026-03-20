import { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, message, Progress, Modal, Form, InputNumber, Input } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getMyProjects, updateProgress } from '../../api/projectApi';
import StatusTag from '../../components/common/StatusTag';

const { Title, Text } = Typography;
const { TextArea } = Input;

const MyProjectsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [progressModal, setProgressModal] = useState({ open: false, project: null });
  const [form] = Form.useForm();

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getMyProjects({ page: p, limit: 10 });
      setData(res.data.data.data);
      setTotal(res.data.data.total);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleProgressUpdate = async () => {
    const values = form.getFieldsValue();
    try {
      await updateProgress(progressModal.project.id, values);
      message.success('进度已更新');
      setProgressModal({ open: false, project: null });
      form.resetFields();
      fetchData(page);
    } catch { message.error('更新失败'); }
  };

  const columns = [
    { title: '项目名称', dataIndex: 'title', ellipsis: true },
    { title: '我的角色', dataIndex: 'role', render: v => v || '-' },
    { title: '项目状态', dataIndex: 'status', render: v => <StatusTag status={v} /> },
    { title: '我的进度', dataIndex: 'progress_pct', render: v => <Progress percent={v || 0} size="small" style={{ width: 100 }} /> },
    { title: '结束日期', dataIndex: 'end_date', render: v => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
    {
      title: '操作',
      render: (_, r) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => navigate(`/expert/projects/${r.id}`)}>查看</Button>
          {r.member_status === 'active' && (
            <Button icon={<EditOutlined />} size="small"
              onClick={() => { form.setFieldsValue({ progress_pct: r.progress_pct, progress_notes: r.progress_notes }); setProgressModal({ open: true, project: r }); }}>
              更新进度
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>我的项目</Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ total, pageSize: 10, current: page, onChange: (p) => { setPage(p); fetchData(p); } }}
      />

      <Modal title="更新项目进度" open={progressModal.open} onOk={handleProgressUpdate}
        onCancel={() => { setProgressModal({ open: false, project: null }); form.resetFields(); }}
        okText="确认" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item name="progress_pct" label="完成进度（%）" rules={[{ required: true, message: '请输入进度' }]}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="progress_notes" label="进度说明">
            <TextArea rows={3} placeholder="描述当前工作进展..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyProjectsPage;
