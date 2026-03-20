import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import {
  DashboardOutlined, UserOutlined, FileTextOutlined,
  ProjectOutlined, BarChartOutlined, MessageOutlined, LogoutOutlined,
  BankOutlined, BookOutlined, SettingOutlined, AuditOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import NotificationBell from './NotificationBell';

const { Sider, Header, Content } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === 'admin';

  const adminMenuItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '控制台' },
    { key: '/admin/experts', icon: <UserOutlined />, label: '专家管理' },
    { key: '/admin/solutions', icon: <FileTextOutlined />, label: '方案管理' },
    { key: '/admin/projects', icon: <ProjectOutlined />, label: '项目管理' },
    { key: '/admin/statistics', icon: <BarChartOutlined />, label: '统计分析' },
    { key: '/admin/messages', icon: <MessageOutlined />, label: '消息中心' },
    { type: 'divider' },
    { key: '/admin/organizations', icon: <BankOutlined />, label: '机构管理' },
    { key: '/admin/dictionaries', icon: <BookOutlined />, label: '字典管理' },
    { key: '/admin/config', icon: <SettingOutlined />, label: '系统配置' },
    { key: '/admin/audit-logs', icon: <AuditOutlined />, label: '操作日志' },
  ];

  const expertMenuItems = [
    { key: '/expert/profile', icon: <UserOutlined />, label: '我的资料' },
    { key: '/expert/solutions', icon: <FileTextOutlined />, label: '我的方案' },
    { key: '/expert/projects', icon: <ProjectOutlined />, label: '我的项目' },
    { key: '/expert/messages', icon: <MessageOutlined />, label: '消息中心' },
  ];

  const menuItems = isAdmin ? adminMenuItems : expertMenuItems;

  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') { logout(); navigate('/login'); }
    },
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" collapsible>
        <div style={{ color: '#fff', textAlign: 'center', padding: '16px', fontWeight: 'bold', fontSize: 16 }}>
          专家管理平台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#1677ff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 24px', gap: 16 }}>
          <NotificationBell />
          <Dropdown menu={userMenu}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.full_name || user?.email}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, background: '#fff', padding: 24, borderRadius: 8 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
