import { useState, useEffect, useRef } from 'react';
import { Layout, List, Card, Input, Button, Typography, Space, Badge, Avatar, Divider, message, Empty, Modal, Form, Select } from 'antd';
import { SendOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import { getInbox, getThread, sendMessage } from '../../api/messageApi';
import { getExperts } from '../../api/expertApi';
import useAuthStore from '../../store/authStore';
import dayjs from 'dayjs';

const { Sider, Content } = Layout;
const { Text, Title } = Typography;
const { TextArea } = Input;

const MessagesPage = () => {
  const { user } = useAuthStore();
  const [inbox, setInbox] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [composeModal, setComposeModal] = useState(false);
  const [experts, setExperts] = useState([]);
  const [composeForm] = Form.useForm();
  const bottomRef = useRef(null);

  const loadInbox = async () => {
    try {
      const res = await getInbox();
      setInbox(res.data.data);
    } catch { message.error('加载收件箱失败'); }
  };

  const loadThread = async (threadId) => {
    try {
      const res = await getThread(threadId);
      setThreadMessages(res.data.data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch { message.error('加载消息失败'); }
  };

  useEffect(() => { loadInbox(); }, []);

  useEffect(() => {
    if (activeThread) {
      loadThread(activeThread.thread_id);
      const interval = setInterval(() => loadThread(activeThread.thread_id), 10000);
      return () => clearInterval(interval);
    }
  }, [activeThread?.thread_id]);

  const handleSelectThread = (item) => {
    setActiveThread(item);
  };

  const handleReply = async () => {
    if (!replyBody.trim()) return;
    setSending(true);
    try {
      // Find the other participant from thread messages
      const otherMsg = threadMessages.find(m => m.sender_id !== user.id) ||
                       threadMessages.find(m => m.recipient_id !== user.id);
      const otherId = otherMsg
        ? (otherMsg.sender_id !== user.id ? otherMsg.sender_id : otherMsg.recipient_id)
        : activeThread.sender_id;
      await sendMessage({
        recipientId: otherId,
        body: replyBody,
        threadId: activeThread.thread_id,
        subject: activeThread.subject,
      });
      setReplyBody('');
      loadThread(activeThread.thread_id);
      loadInbox();
    } catch { message.error('发送失败'); }
    finally { setSending(false); }
  };

  const handleCompose = async () => {
    const values = composeForm.getFieldsValue();
    if (!values.recipientId || !values.body) { message.warning('请填写收件人和消息内容'); return; }
    try {
      await sendMessage({ recipientId: values.recipientId, subject: values.subject, body: values.body });
      message.success('消息已发送');
      setComposeModal(false);
      composeForm.resetFields();
      loadInbox();
    } catch { message.error('发送失败'); }
  };

  const loadExperts = async () => {
    try {
      const res = await getExperts({ limit: 200 });
      setExperts(res.data.data.data || []);
    } catch {}
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>消息中心</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { loadExperts(); setComposeModal(true); }}>新消息</Button>
      </Space>

      <Layout style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 8, minHeight: 500 }}>
        <Sider width={280} style={{ background: '#fafafa', borderRight: '1px solid #f0f0f0', borderRadius: '8px 0 0 8px' }}>
          <div style={{ padding: '8px 0', overflowY: 'auto', maxHeight: 550 }}>
            {inbox.length === 0 && <Empty description="暂无消息" style={{ marginTop: 40 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            {inbox.map(item => (
              <div key={item.thread_id}
                onClick={() => handleSelectThread(item)}
                style={{
                  padding: '12px 16px', cursor: 'pointer',
                  background: activeThread?.thread_id === item.thread_id ? '#e6f4ff' : 'transparent',
                  borderBottom: '1px solid #f0f0f0',
                }}>
                <Space>
                  <Avatar icon={<UserOutlined />} size="small" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong ellipsis style={{ maxWidth: 140 }}>
                        {item.sender_id === user.id ? item.recipient_email : item.sender_email}
                      </Text>
                      {parseInt(item.unread_count) > 0 && <Badge count={item.unread_count} size="small" />}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.subject || '(无主题)'}</Text>
                    <div><Text type="secondary" style={{ fontSize: 11 }}>{dayjs(item.created_at).format('MM-DD HH:mm')}</Text></div>
                  </div>
                </Space>
              </div>
            ))}
          </div>
        </Sider>

        <Content style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
          {!activeThread ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Empty description="选择一个会话查看消息" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ) : (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                <Text strong>{activeThread.subject || '(无主题)'}</Text>
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>共 {activeThread.message_count} 条消息</Text>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 16, maxHeight: 380 }}>
                {threadMessages.map(msg => {
                  const isMine = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                      {!isMine && <Avatar icon={<UserOutlined />} size="small" style={{ marginRight: 8, flexShrink: 0, marginTop: 4 }} />}
                      <div style={{ maxWidth: '70%' }}>
                        <div style={{
                          background: isMine ? '#1677ff' : '#f5f5f5',
                          color: isMine ? '#fff' : '#000',
                          padding: '8px 12px', borderRadius: 8,
                        }}>
                          <Text style={{ color: 'inherit' }}>{msg.body}</Text>
                        </div>
                        <div style={{ textAlign: isMine ? 'right' : 'left', marginTop: 2 }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>{dayjs(msg.created_at).format('MM-DD HH:mm')}</Text>
                        </div>
                      </div>
                      {isMine && <Avatar icon={<UserOutlined />} size="small" style={{ marginLeft: 8, flexShrink: 0, marginTop: 4 }} />}
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <Divider style={{ margin: 0 }} />
              <div style={{ padding: 12, display: 'flex', gap: 8 }}>
                <TextArea
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  placeholder="输入回复内容，Enter 发送，Shift+Enter 换行"
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  style={{ flex: 1 }}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={handleReply} loading={sending}>发送</Button>
              </div>
            </>
          )}
        </Content>
      </Layout>

      <Modal title="发起新消息" open={composeModal} onOk={handleCompose}
        onCancel={() => { setComposeModal(false); composeForm.resetFields(); }}
        okText="发送" cancelText="取消">
        <Form form={composeForm} layout="vertical">
          <Form.Item name="recipientId" label="收件人" rules={[{ required: true, message: '请选择收件人' }]}>
            <Select showSearch placeholder="搜索用户"
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
              options={experts.map(e => ({ label: `${e.full_name || e.email} (${e.email})`, value: e.id }))} />
          </Form.Item>
          <Form.Item name="subject" label="主题">
            <Input placeholder="消息主题（可选）" />
          </Form.Item>
          <Form.Item name="body" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <TextArea rows={4} placeholder="消息内容..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessagesPage;
