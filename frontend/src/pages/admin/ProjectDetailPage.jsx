import { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, Modal, Input, Select, Typography, message, Tag, Divider, Table, Avatar, Progress, Form, Tabs } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, UserOutlined, LinkOutlined, BulbOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, updateProject, addExpertToProject, removeExpertFromProject, getProjectSolutions, linkSolutionToProject, unlinkSolutionFromProject, getProjectRecommendations } from '../../api/projectApi';
import { getExperts } from '../../api/expertApi';
import { getSolutions } from '../../api/solutionApi';
import MilestonesTab from '../../components/project/MilestonesTab';
import DeliverablesTab from '../../components/project/DeliverablesTab';
import StatusTag from '../../components/common/StatusTag';

const { Title, Text } = Typography;
const { Option } = Select;

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [linkModal, setLinkModal] = useState(false);
  const [recoModal, setRecoModal] = useState(false);
  const [experts, setExperts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [availableSolutions, setAvailableSolutions] = useState([]);
  const [linkedSolutions, setLinkedSolutions] = useState([]);
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [linkForm] = Form.useForm();

  const load = async () => {
    try {
      const [projRes, solRes] = await Promise.all([getProjectById(id), getProjectSolutions(id)]);
      setProject(projRes.data.data);
      setLinkedSolutions(solRes.data.data);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const loadExperts = async () => {
    try {
      const res = await getExperts({ status: 'approved', limit: 100 });
      setExperts(res.data.data.data);
    } catch { message.error('加载专家失败'); }
  };

  const loadSolutions = async () => {
    try {
      const res = await getSolutions({ status: 'approved', limit: 100 });
      setAvailableSolutions(res.data.data.data);
    } catch { message.error('加载方案失败'); }
  };

  const loadRecommendations = async () => {
    try {
      const res = await getProjectRecommendations(id);
      setRecommendations(res.data.data);
    } catch { message.error('加载推荐失败'); }
  };

  const handleAddExpert = async () => {
    const values = form.getFieldsValue();
    if (!values.expertId) { message.warning('请选择专家'); return; }
    try {
      await addExpertToProject(id, values);
      message.success('专家已加入项目');
      setAddModal(false);
      form.resetFields();
      load();
    } catch (err) { message.error(err.response?.data?.error?.message || '操作失败'); }
  };

  const handleRemove = async (expertId) => {
    try {
      await removeExpertFromProject(id, expertId);
      message.success('已移除');
      load();
    } catch { message.error('操作失败'); }
  };

  const handleStatusUpdate = async () => {
    const values = statusForm.getFieldsValue();
    try {
      await updateProject(id, values);
      message.success('状态已更新');
      setStatusModal(false);
      statusForm.resetFields();
      load();
    } catch { message.error('操作失败'); }
  };

  const handleLinkSolution = async () => {
    const values = linkForm.getFieldsValue();
    if (!values.solutionId) { message.warning('请选择方案'); return; }
    try {
      await linkSolutionToProject(id, values);
      message.success('方案已关联');
      setLinkModal(false);
      linkForm.resetFields();
      load();
    } catch (err) { message.error(err.response?.data?.error?.message || '操作失败'); }
  };

  const handleUnlinkSolution = async (solutionId) => {
    try {
      await unlinkSolutionFromProject(id, solutionId);
      message.success('已解除关联');
      load();
    } catch { message.error('操作失败'); }
  };

  const expertColumns = [
    { title: '专家', render: (_, r) => <Space><Avatar icon={<UserOutlined />} src={r.avatar_url} /><span>{r.full_name}</span></Space> },
    { title: '职称', dataIndex: 'expert_title', render: v => v || '-' },
    { title: '机构', dataIndex: 'organization', render: v => v || '-' },
    { title: '角色', dataIndex: 'role', render: v => v || '-' },
    { title: '进度', dataIndex: 'progress_pct', render: v => <Progress percent={v || 0} size="small" style={{ width: 100 }} /> },
    {
      title: '操作',
      render: (_, r) => (
        <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleRemove(r.expert_id)}>移除</Button>
      ),
    },
  ];

  if (loading || !project) return null;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/projects')}>返回列表</Button>
        <Title level={4} style={{ margin: 0 }}>项目详情</Title>
      </Space>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>{project.title}</Title>
          <StatusTag status={project.status} />
          <Button size="small" onClick={() => { statusForm.setFieldsValue({ status: project.status }); setStatusModal(true); }}>更改状态</Button>
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

        <Tabs items={[
          {
            key: 'experts',
            label: `项目成员 (${project.experts?.filter(e => e.status !== 'removed').length || 0})`,
            children: (
              <>
                <Space style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />}
                    onClick={() => { loadExperts(); setAddModal(true); }}>添加专家</Button>
                  <Button icon={<BulbOutlined />}
                    onClick={() => { loadRecommendations(); setRecoModal(true); }}>智能推荐</Button>
                </Space>
                <Table rowKey="id" columns={expertColumns}
                  dataSource={project.experts?.filter(e => e.status !== 'removed') || []} pagination={false} />
              </>
            ),
          },
          { key: 'milestones', label: '里程碑', children: <MilestonesTab projectId={id} /> },
          { key: 'deliverables', label: '交付物', children: <DeliverablesTab projectId={id} isAdmin={true} /> },
          {
            key: 'solutions',
            label: `关联方案 (${linkedSolutions.length})`,
            children: (
              <>
                <Button type="primary" icon={<LinkOutlined />} style={{ marginBottom: 16 }}
                  onClick={() => { loadSolutions(); setLinkModal(true); }}>关联方案</Button>
                <Table rowKey="id" pagination={false} dataSource={linkedSolutions} columns={[
                  { title: '方案标题', dataIndex: 'title', ellipsis: true },
                  { title: '状态', dataIndex: 'solution_status', render: v => <StatusTag status={v} /> },
                  { title: '分类', dataIndex: 'category', render: v => v || '-' },
                  { title: '专家', dataIndex: 'expert_name' },
                  { title: '备注', dataIndex: 'note', render: v => v || '-' },
                  { title: '操作', render: (_, r) => (
                    <Button danger size="small" onClick={() => handleUnlinkSolution(r.solution_id)}>解除关联</Button>
                  )},
                ]} />
              </>
            ),
          },
        ]} />
      </Card>

      <Modal title="添加专家" open={addModal} onOk={handleAddExpert}
        onCancel={() => { setAddModal(false); form.resetFields(); }}
        okText="确认" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item name="expertId" label="选择专家" rules={[{ required: true, message: '请选择专家' }]}>
            <Select showSearch placeholder="搜索专家姓名"
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
              options={experts.map(e => ({ label: `${e.full_name} · ${e.organization || ''}`, value: e.id }))} />
          </Form.Item>
          <Form.Item name="role" label="担任角色">
            <Input placeholder="如：技术顾问、主研究员" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="更改项目状态" open={statusModal} onOk={handleStatusUpdate}
        onCancel={() => { setStatusModal(false); statusForm.resetFields(); }}
        okText="确认" cancelText="取消">
        <Form form={statusForm} layout="vertical">
          <Form.Item name="status" label="项目状态" rules={[{ required: true }]}>
            <Select>
              <Option value="open">开放中</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="智能推荐专家" open={recoModal} footer={null}
        onCancel={() => setRecoModal(false)} width={700}>
        <Table rowKey="id" size="small" pagination={false} dataSource={recommendations} columns={[
          { title: '专家', dataIndex: 'full_name' },
          { title: '机构', dataIndex: 'organization', render: v => v || '-' },
          { title: '匹配分', dataIndex: 'match_score', render: v => <Text strong style={{ color: '#1890ff' }}>{v}</Text> },
          { title: '工作年限', dataIndex: 'years_exp', render: v => v ? `${v}年` : '-' },
          { title: '操作', render: (_, r) => (
            <Button size="small" type="primary" onClick={async () => {
              try {
                await addExpertToProject(id, { expertId: r.id });
                message.success(`${r.full_name} 已加入项目`);
                load();
              } catch (err) { message.error(err.response?.data?.error?.message || '操作失败'); }
            }}>加入项目</Button>
          )},
        ]} />
      </Modal>

      <Modal title="关联方案" open={linkModal} onOk={handleLinkSolution}
        onCancel={() => { setLinkModal(false); linkForm.resetFields(); }}
        okText="确认" cancelText="取消">
        <Form form={linkForm} layout="vertical">
          <Form.Item name="solutionId" label="选择方案" rules={[{ required: true, message: '请选择方案' }]}>
            <Select showSearch placeholder="搜索方案标题"
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
              options={availableSolutions.map(s => ({ label: `${s.title} · ${s.expert_name || ''}`, value: s.id }))} />
          </Form.Item>
          <Form.Item name="note" label="备注">
            <Input placeholder="说明关联原因或用途..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
