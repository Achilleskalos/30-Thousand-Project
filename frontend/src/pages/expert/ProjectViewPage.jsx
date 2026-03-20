import { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, Typography, message, Tag, Divider, Table, Avatar, Progress, Tabs, Modal, Form, InputNumber, Input } from 'antd';
import { ArrowLeftOutlined, UserOutlined, EditOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, updateProgress } from '../../api/projectApi';
import MilestonesTab from '../../components/project/MilestonesTab';
import DeliverablesTab from '../../components/project/DeliverablesTab';
import StatusTag from '../../components/common/StatusTag';
import useAuthStore from '../../store/authStore';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ProjectViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressModal, setProgressModal] = useState(false);
  const [progressForm] = Form.useForm();

  const load = () => {
    getProjectById(id)
      .then(res => setProject(res.data.data))
      .catch(() => message.error('加载失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  if (loading || !project) return null;

  const myRecord = project.experts?.find(e => e.user_id === user?.id && e.status !== 'removed');

  const handleUpdateProgress = async () => {
    const values = progressForm.getFieldsValue();
    try {
      await updateProgress(id, values);
      message.success('进度已更新');
      setProgressModal(false);
      progressForm.resetFields();
      load();
    } catch { message.error('更新失败'); }
  };

  const memberColumns = [
    { title: '专家', render: (_, r) => <Space><Avatar icon={<UserOutlined />} src={r.avatar_url} /><span>{r.full_name}</span></Space> },
    { title: '职称', dataIndex: 'expert_title', render: v => v || '-' },
    { title: '机构', dataIndex: 'organization', render: v => v || '-' },
    { title: '角色', dataIndex: 'role', render: v => v || '-' },
    { title: '进度', dataIndex: 'progress_pct', render: v => <Progress percent={v || 0} size="small" style={{ width: 100 }} /> },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/expert/projects')}>返回</Button>
        <Title level={4} style={{ margin: 0 }}>项目详情</Title>
      </Space>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>{project.title}</Title>
          <StatusTag status={project.status} />
        </Space>

        <Descriptions column={2} bordered>
          <Descriptions.Item label="开始日期">{project.start_date ? new Date(project.start_date).toLocaleDateString('zh-CN') : '-'}</Descriptions.Item>
          <Descriptions.Item label="结束日期">{project.end_date ? new Date(project.end_date).toLocaleDateString('zh-CN') : '-'}</Descriptions.Item>
          <Descriptions.Item label="所需技能" span={2}>
            {project.required_skills?.map(t => <Tag key={t}>{t}</Tag>) || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="所需领域" span={2}>
            {project.required_domains?.map(t => <Tag key={t} color="blue">{t}</Tag>) || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="项目描述" span={2}>{project.description || '-'}</Descriptions.Item>
        </Descriptions>

        <Divider />
        {myRecord && (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
            <Space>
              <Text>我的进度：</Text>
              <Progress percent={myRecord.progress_pct || 0} style={{ width: 200 }} />
              <Button size="small" icon={<EditOutlined />} onClick={() => {
                progressForm.setFieldsValue({ progress_pct: myRecord.progress_pct || 0, progress_notes: myRecord.progress_notes || '' });
                setProgressModal(true);
              }}>更新进度</Button>
            </Space>
          </div>
        )}

        <Tabs items={[
          { key: 'members', label: '项目成员', children: (
            <Table rowKey="id" columns={memberColumns}
              dataSource={project.experts?.filter(e => e.status !== 'removed') || []} pagination={false} />
          )},
          { key: 'milestones', label: '里程碑', children: <MilestonesTab projectId={id} readonly={true} /> },
          { key: 'deliverables', label: '交付物', children: <DeliverablesTab projectId={id} isAdmin={false} /> },
        ]} />
      </Card>

      <Modal title="更新我的进度" open={progressModal} onOk={handleUpdateProgress}
        onCancel={() => { setProgressModal(false); progressForm.resetFields(); }}
        okText="保存" cancelText="取消">
        <Form form={progressForm} layout="vertical">
          <Form.Item name="progress_pct" label="完成百分比">
            <InputNumber min={0} max={100} addonAfter="%" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="progress_notes" label="进度备注">
            <TextArea rows={3} placeholder="说明当前进展情况..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectViewPage;
