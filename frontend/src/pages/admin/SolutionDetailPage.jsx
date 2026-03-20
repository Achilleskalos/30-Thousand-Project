import { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, Modal, Input, Select, Typography, message, Tag, Divider, Timeline, Tabs, Table } from 'antd';
import { ArrowLeftOutlined, EditOutlined, InboxOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getSolutionById, reviewSolution, archiveSolution, getSolutionVersions, getSolutionProjects } from '../../api/solutionApi';
import AttachmentPanel from '../../components/common/AttachmentPanel';
import StatusTag from '../../components/common/StatusTag';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SolutionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState([]);
  const [linkedProjects, setLinkedProjects] = useState([]);
  const [modal, setModal] = useState({ open: false });
  const [verdict, setVerdict] = useState('');
  const [comments, setComments] = useState('');

  const load = async () => {
    try {
      const [solRes, verRes, projRes] = await Promise.all([
        getSolutionById(id),
        getSolutionVersions(id),
        getSolutionProjects(id),
      ]);
      setSolution(solRes.data.data);
      setVersions(verRes.data.data);
      setLinkedProjects(projRes.data.data);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleReview = async () => {
    if (!verdict) { message.warning('请选择审核结果'); return; }
    try {
      await reviewSolution(id, { verdict, comments });
      message.success('审核完成');
      setModal({ open: false });
      setVerdict(''); setComments('');
      load();
    } catch { message.error('操作失败'); }
  };

  const handleArchive = async () => {
    try {
      await archiveSolution(id);
      message.success('已归档');
      load();
    } catch { message.error('操作失败'); }
  };

  if (loading || !solution) return null;

  const canReview = ['submitted', 'under_review'].includes(solution.status);
  const canArchive = ['approved', 'rejected'].includes(solution.status);

  const infoTab = (
    <>
      <Descriptions column={2} bordered>
        <Descriptions.Item label="专家">{solution.expert_name}</Descriptions.Item>
        <Descriptions.Item label="机构">{solution.organization || '-'}</Descriptions.Item>
        <Descriptions.Item label="分类">{solution.category || '-'}</Descriptions.Item>
        <Descriptions.Item label="提交时间">{new Date(solution.created_at).toLocaleDateString('zh-CN')}</Descriptions.Item>
        <Descriptions.Item label="标签" span={2}>
          {solution.tags?.map(t => <Tag key={t}>{t}</Tag>) || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="摘要" span={2}>{solution.abstract || '-'}</Descriptions.Item>
        <Descriptions.Item label="方案内容" span={2}>
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{solution.content || '-'}</Paragraph>
        </Descriptions.Item>
      </Descriptions>

      {solution.reviews?.length > 0 && (
        <>
          <Divider>审核记录</Divider>
          <Timeline items={solution.reviews.map(r => ({
            color: r.verdict === 'approved' ? 'green' : r.verdict === 'rejected' ? 'red' : 'orange',
            children: (
              <div>
                <Text strong>第{r.stage}轮审核</Text> · <StatusTag status={r.verdict} />
                <br />
                <Text type="secondary">{r.reviewer_email} · {new Date(r.reviewed_at).toLocaleDateString('zh-CN')}</Text>
                {r.comments && <><br /><Text>{r.comments}</Text></>}
              </div>
            ),
          }))} />
        </>
      )}

      <Divider />
      <Space>
        {canReview && <Button type="primary" icon={<EditOutlined />} onClick={() => setModal({ open: true })}>审核方案</Button>}
        {canArchive && <Button icon={<InboxOutlined />} onClick={handleArchive}>归档</Button>}
      </Space>
    </>
  );

  const versionsTab = (
    versions.length === 0
      ? <Text type="secondary">暂无历史版本</Text>
      : <Timeline items={versions.map(v => ({
          children: (
            <div>
              <Text strong>版本 {v.version}</Text>
              <Text type="secondary"> · {v.saved_by_email} · {new Date(v.created_at).toLocaleString('zh-CN')}</Text>
              <br />
              <Text>标题：{v.title}</Text>
              {v.abstract && <><br /><Text type="secondary">摘要：{v.abstract.slice(0, 100)}{v.abstract.length > 100 ? '...' : ''}</Text></>}
            </div>
          ),
        }))}
      />
  );

  const projectsTab = (
    linkedProjects.length === 0
      ? <Text type="secondary">暂未关联项目</Text>
      : <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={linkedProjects}
          columns={[
            { title: '项目名称', dataIndex: 'project_title' },
            { title: '项目状态', dataIndex: 'project_status', render: v => <StatusTag status={v} /> },
            { title: '关联时间', dataIndex: 'created_at', render: v => new Date(v).toLocaleDateString('zh-CN') },
            { title: '备注', dataIndex: 'note', render: v => v || '-' },
          ]}
        />
  );

  const tabs = [
    { key: 'info', label: '方案详情', children: infoTab },
    { key: 'attachments', label: '附件', children: <AttachmentPanel entityType="solution" entityId={id} /> },
    { key: 'versions', label: `历史版本 (${versions.length})`, children: versionsTab },
    { key: 'projects', label: `关联项目 (${linkedProjects.length})`, children: projectsTab },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/solutions')}>返回列表</Button>
        <Title level={4} style={{ margin: 0 }}>方案详情</Title>
      </Space>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>{solution.title}</Title>
          <StatusTag status={solution.status} />
        </Space>
        <Tabs items={tabs} />
      </Card>

      <Modal title="审核方案" open={modal.open} onOk={handleReview}
        onCancel={() => { setModal({ open: false }); setVerdict(''); setComments(''); }}
        okText="确认" cancelText="取消">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text>审核结果：</Text>
            <Select style={{ width: '100%', marginTop: 8 }} value={verdict} onChange={setVerdict} placeholder="请选择">
              <Option value="approved"><Text style={{ color: 'green' }}>通过</Text></Option>
              <Option value="revision_required"><Text style={{ color: 'orange' }}>需要修改</Text></Option>
              <Option value="rejected"><Text style={{ color: 'red' }}>拒绝</Text></Option>
            </Select>
          </div>
          <div>
            <Text>审核意见（可选）：</Text>
            <TextArea rows={4} value={comments} onChange={e => setComments(e.target.value)}
              placeholder="填写审核意见..." style={{ marginTop: 8 }} />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default SolutionDetailPage;
