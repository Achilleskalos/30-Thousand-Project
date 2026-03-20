import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/authApi';
import useAuthStore from '../../store/authStore';

const { Title } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const res = await register({ ...values, role: 'expert' });
      const { token, user } = res.data.data;
      setAuth(token, user);
      message.success('注册成功！您的资料正在等待管理员审核。');
      navigate('/expert/profile');
    } catch (err) {
      message.error(err.response?.data?.error?.message || '注册失败');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 440 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>专家注册</Title>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="fullName" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入真实姓名" size="large" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
            <Input placeholder="邮箱地址" size="large" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
            <Input.Password placeholder="密码（至少6位）" size="large" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject('两次密码不一致');
                },
              }),
            ]}
          >
            <Input.Password placeholder="再次输入密码" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">注册</Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            已有账号？<Link to="/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
