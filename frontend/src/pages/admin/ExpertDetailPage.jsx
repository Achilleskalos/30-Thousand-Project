import { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, Modal, Input, Typography, message, Tag, Avatar, Divider, Tabs, Timeline } from 'antd';
import { UserOutlined, ArrowLeftOutlined, CheckOutlined, CloseOutlined, PauseOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getExpertById, updateExpertStatus } from '../../api/expertApi';
import { getAuditLogs } from '../../api/auditApi';
import AttachmentPanel from '../../components/common/AttachmentPanel';
import StatusTag from '../../components/common/StatusTag';

const { Title, Text } = Typography;
const { TextArea } = Input;

const actionLabels = {
  expert_profile_updated: '资料更新',
  expert_status_changed: '状态变更',
};

const ExpertDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, action: null });
  const [reviewNote, setReviewNote] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);

  const load = async () => {
    try {
      const res = await getExpertById(id);
      setExpert(res.data.data);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  const loadAudit = async (profileId) => {
    try {
      const res = await getAuditLogs({ entityType: 'expert_profile', entityId: profileId });
      setAuditLogs(res.data.data.data || res.data.data || []);
    } catch {}
  };

  useEffect(() => { load(); }, [id]);
  useEffect(() => { if (expert) loadAudit(expert.id); }, [expert]);

  const handleAction = async () => {
    try {
      await updateExpertStatus(id, { status: modal.action, reviewNote });
      message.success('操作成功');
      setModal({ open: false, action: null });
      setReviewNote('');
      load();
    } catch { message.error('操作失败'); }
  };

  const actionMap = {
    approved:  { label: '通过审核', color: 'green' },
    rejected:  { label: '拒绝申请', color: 'red' },
    suspended: { label: '暂停账号', color: 'orange' },
  };

  if (loading || !expert) return null;

  const infoTab = (
    <>
      <Descriptions column={2} bordered>
        <Descriptions.Item label="邮箱">{expert.email}</Descriptions.Item>
        <Descriptions.Item label="电话">{expert.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="机构">{expert.organization || '-'}</Descriptions.Item>
        <Descriptions.Item label="工作年限">{expert.years_exp ? `${expert.years_exp}年` : '-'}</Descriptions.Item>
        <Descriptions.Item label="专业领域" span={2}>
          {expert.domain_tags?.map(t => <Tag key={t} color="blue">{t}</Tag>) || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="技能标签" span={2}>
          {expert.skills?.map(t => <Tag key={t}>{t}</Tag>) || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="个人简介" span={2}>{expert.bio || '-'}</Descriptions.Item>
        {expert.review_note && <Descriptions.Item label="审核备注" span={2}>{expert.review_note}</Descriptions.Item>}
      </Descriptions>
      <Divider />
      <Space>
        <Button type="primary" icon={<CheckOutlined />} onClick={() => setModal({ open: true, action: 'approved' })}>通过审核</Button>
        <Button danger icon={<CloseOutlined />} onClick={() => setModal({ open: true, action: 'rejected' })}>拒绝申请</Button>
        <Button icon={<PauseOutlined />} onClick={() => setModal({ open: true, action: 'suspended' })}>暂停账号</Button>
      </Space>
    </>
  );

  const historyTab = (
    <Timeline
      items={auditLogs.length === 0 ? [{ children: <Text type="secondary">暂无操作记录</Text> }] : auditLogs.map(log => ({
        color: log.action === 'expert_status_changed' ? 'blue' : 'gray',
        children: (
          <div>
            <Text strong>{actionLabels[log.action] || log.action}</Text>
            <br />
            <Text type="secondary">{log.user_email} · {new Date(log.created_at).toLocaleString('zh-CN')}</Text>
            {log.action === 'expert_status_changed' && log.new_data && (
              <>
                <br />
                <Text>状态变更为：<StatusTag status={log.new_data.status} /></Text>
                {log.new_data.reviewNote && <Text>  备注：{log.new_data.reviewNote}</Text>}
              </>
            )}
          </div>
        ),
      }))}
    />
  );

  const tabs = [
    { key: 'info', label: '基本信息', children: infoTab },
    { key: 'attachments', label: '证书附件', children: <AttachmentPanel entityType="expert_profile" entityId={expert.id} /> },
    { key: 'history', label: '操作历史', children: historyTab },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/experts')}>返回列表</Button>
        <Title level={4} style={{ margin: 0 }}>专家详情</Title>
      </Space>

      <Card>
        <Space align="start" size={24} style={{ marginBottom: 16 }}>
          <Avatar size={80} icon={<UserOutlined />} src={expert.avatar_url} />
          <div>
            <Title level={4} style={{ margin: 0 }}>{expert.full_name}</Title>
            <Text type="secondary">{expert.title} · {expert.organization}</Text>
            <br />
            <StatusTag status={expert.status} />
          </div>
        </Space>
        <Tabs items={tabs} />
      </Card>

      <Modal
        title={actionMap[modal.action]?.label}
        open={modal.open}
        onOk={handleAction}
        onCancel={() => { setModal({ open: false, action: null }); setReviewNote(''); }}
        okText="确认" cancelText="取消"
      >
        <Text>备注说明（可选）：</Text>
        <TextArea rows={3} value={reviewNote} onChange={e => setReviewNote(e.target.value)}
          placeholder="填写审核备注..." style={{ marginTop: 8 }} />
      </Modal>
    </div>
  );
};

export default ExpertDetailPage;
