import { useState, useEffect } from 'react';
import { Badge, Popover, List, Button, Typography, Space, Empty } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { getNotifications, getNotificationUnreadCount, markNotificationRead, markAllNotificationsRead } from '../../api/notificationApi';
import dayjs from 'dayjs';

const { Text } = Typography;

const typeLabel = {
  new_message: '新消息',
  expert_approved: '专家审核通过',
  expert_rejected: '专家审核被拒',
  solution_approved: '方案审核通过',
  solution_rejected: '方案审核被拒',
  project_joined: '加入项目',
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadCount = async () => {
    try {
      const res = await getNotificationUnreadCount();
      setUnreadCount(res.data.data.count);
    } catch {}
  };

  const loadNotifications = async () => {
    try {
      const res = await getNotifications({ limit: 10 });
      setNotifications(res.data.data);
    } catch {}
  };

  useEffect(() => {
    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = (v) => {
    setOpen(v);
    if (v) loadNotifications();
  };

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    loadNotifications();
    loadCount();
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    loadNotifications();
    setUnreadCount(0);
  };

  const content = (
    <div style={{ width: 320 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text strong>通知</Text>
        {unreadCount > 0 && (
          <Button size="small" icon={<CheckOutlined />} onClick={handleMarkAll}>全部已读</Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <Empty description="暂无通知" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '20px 0' }} />
      ) : (
        <List
          size="small"
          dataSource={notifications}
          renderItem={item => (
            <List.Item
              style={{ background: item.is_read ? 'transparent' : '#e6f4ff', padding: '8px 12px', borderRadius: 4, marginBottom: 4, cursor: 'pointer' }}
              onClick={() => !item.is_read && handleMarkRead(item.id)}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 13 }}>{typeLabel[item.type] || item.type}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>{dayjs(item.created_at).format('MM-DD HH:mm')}</Text>
                </div>
                {item.data?.subject && <Text type="secondary" style={{ fontSize: 12 }}>{item.data.subject}</Text>}
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Popover content={content} trigger="click" open={open} onOpenChange={handleOpen} placement="bottomRight">
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} style={{ color: '#fff' }} />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
