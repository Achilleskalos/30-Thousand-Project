import { useState } from 'react';
import { Form, Input, Select, Button, Card, Typography, Space, DatePicker, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../../api/projectApi';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

const DOMAINS = ['人工智能', '大数据', '云计算', '网络安全', '物联网', '区块链', '软件工程', '机械工程', '电气工程', '化工', '医疗', '金融科技'];
const SKILLS = ['Python', 'Java', 'C++', 'React', 'Node.js', '机器学习', '深度学习', '数据分析', '项目管理', 'DevOps'];

const ProjectFormPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
      };
      const res = await createProject(payload);
      message.success('项目已创建');
      navigate(`/admin/projects/${res.data.data.id}`);
    } catch { message.error('创建失败'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/projects')}>返回</Button>
        <Title level={4} style={{ margin: 0 }}>新建项目</Title>
      </Space>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item name="description" label="项目描述">
            <TextArea rows={4} placeholder="描述项目背景、目标和需求..." />
          </Form.Item>
          <Form.Item name="required_domains" label="所需领域">
            <Select mode="multiple" placeholder="选择所需专业领域"
              options={DOMAINS.map(d => ({ label: d, value: d }))} />
          </Form.Item>
          <Form.Item name="required_skills" label="所需技能">
            <Select mode="tags" placeholder="选择或输入所需技能"
              options={SKILLS.map(s => ({ label: s, value: s }))} />
          </Form.Item>
          <Space>
            <Form.Item name="start_date" label="开始日期">
              <DatePicker />
            </Form.Item>
            <Form.Item name="end_date" label="结束日期">
              <DatePicker />
            </Form.Item>
          </Space>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>创建项目</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProjectFormPage;
