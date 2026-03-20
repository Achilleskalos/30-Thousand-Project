import { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, Typography, message, Tag, Divider, Timeline, Tabs } from 'antd';
import { ArrowLeftOutlined, EditOutlined, SendOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getSolutionById, submitSolution } from '../../api/solutionApi';
import AttachmentPanel from '../../components/common/AttachmentPanel';
import StatusTag from '../../components/common/StatusTag';

const { Title, Text, Paragraph } = Typography;

const SolutionViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getSolutionById(id);
      setSolution(res.data.data);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleSubmit = async () => {
    try {
      await submitSolution(id);
      message.success('已提交审核');
      load();
    } catch (err) { message.error(err.response?.data?.error?.message || '提交失败'); }
  };

  if (loading || !solution) return null;

  const canEdit = ['draft', 'revision_required'].includes(solution.status);

  const infoTab = (
    <>
      <Descriptions column={2} bordered>
        <Descriptions.Item label="分类">{solution.category || '-'}</Descriptions.Item>
        <Descriptions.Item label="更新时间">{new Date(solution.updated_at).toLocaleDateString('zh-CN')}</Descriptions.Item>
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
                <Text type="secondary">{new Date(r.reviewed_at).toLocaleDateString('zh-CN')}</Text>
                {r.comments && <><br /><Text>{r.comments}</Text></>}
              </div>
            ),
          }))} />
        </>
      )}

      <Divider />
      <Space>
        {canEdit && (
          <>
            <Button icon={<EditOutlined />} onClick={() => navigate(`/expert/solutions/${id}/edit`)}>编辑</Button>
            <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}>提交审核</Button>
          </>
        )}
      </Space>
    </>
  );

  const tabs = [
    { key: 'info', label: '方案详情', children: infoTab },
    { key: 'attachments', label: '附件', children: <AttachmentPanel entityType="solution" entityId={id} readonly={!canEdit} /> },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/expert/solutions')}>返回</Button>
        <Title level={4} style={{ margin: 0 }}>方案详情</Title>
      </Space>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>{solution.title}</Title>
          <StatusTag status={solution.status} />
        </Space>
        <Tabs items={tabs} />
      </Card>
    </div>
  );
};

export default SolutionViewPage;
