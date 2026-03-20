import { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Card, Typography, message, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { createSolution, updateSolution, getSolutionById } from '../../api/solutionApi';

const { Title } = Typography;
const { TextArea } = Input;

const CATEGORIES = ['人工智能', '大数据', '云计算', '网络安全', '物联网', '区块链', '软件工程', '机械工程', '电气工程', '化工', '医疗', '金融科技'];

const SolutionFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      getSolutionById(id)
        .then(res => form.setFieldsValue(res.data.data))
        .catch(() => message.error('加载失败'));
    }
  }, [id]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      if (isEdit) {
        await updateSolution(id, values);
        message.success('方案已保存');
      } else {
        const res = await createSolution(values);
        message.success('方案已创建');
        navigate(`/expert/solutions/${res.data.data.id}/edit`);
      }
    } catch { message.error('保存失败'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/expert/solutions')}>返回</Button>
        <Title level={4} style={{ margin: 0 }}>{isEdit ? '编辑方案' : '新建方案'}</Title>
      </Space>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="方案标题" rules={[{ required: true, message: '请输入方案标题' }]}>
            <Input placeholder="请输入方案标题" />
          </Form.Item>
          <Form.Item name="category" label="技术分类">
            <Select placeholder="选择技术分类" options={CATEGORIES.map(c => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后按回车" />
          </Form.Item>
          <Form.Item name="abstract" label="方案摘要">
            <TextArea rows={3} placeholder="简要描述方案的核心内容..." />
          </Form.Item>
          <Form.Item name="content" label="方案详情" rules={[{ required: true, message: '请输入方案详情' }]}>
            <TextArea rows={10} placeholder="详细描述方案的背景、目标、技术路线、预期成果等..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>保存草稿</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SolutionFormPage;
