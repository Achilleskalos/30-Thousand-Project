import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/authApi';
import useAuthStore from '../../store/authStore';

const { Title } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const res = await login(values);
      const { token, user } = res.data.data;
      setAuth(token, user);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/expert/profile');
    } catch (err) {
      message.error(err.response?.data?.error?.message || '登录失败');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>专家管理平台</Title>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="email" rules={[{ required: true, message: '请输入邮箱', type: 'email' }]}>
            <Input prefix={<UserOutlined />} placeholder="邮箱地址" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">登录</Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            没有账号？<Link to="/register">注册专家账号</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
