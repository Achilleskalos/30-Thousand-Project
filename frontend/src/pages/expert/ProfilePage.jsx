import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Typography, message, Tag, Space, Divider, Tabs } from 'antd';
import { getMyProfile, updateMyProfile } from '../../api/expertApi';
import AttachmentPanel from '../../components/common/AttachmentPanel';
import StatusTag from '../../components/common/StatusTag';

const { Title, Text } = Typography;

const DOMAINS = ['人工智能', '大数据', '云计算', '网络安全', '物联网', '区块链', '软件工程', '机械工程', '电气工程', '化工', '医疗', '金融科技'];
const SKILLS = ['Python', 'Java', 'C++', 'React', 'Node.js', '机器学习', '深度学习', '数据分析', '项目管理', 'DevOps'];

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then(res => {
        setProfile(res.data.data);
        form.setFieldsValue(res.data.data);
      })
      .catch(() => message.error('加载失败'))
      .finally(() => setLoading(false));
  }, []);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      await updateMyProfile(values);
      message.success('资料已更新');
      const res = await getMyProfile();
      setProfile(res.data.data);
    } catch { message.error('保存失败'); }
    finally { setSaving(false); }
  };

  if (loading) return null;

  const profileForm = (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Title level={5}>基本信息</Title>
      <Form.Item name="full_name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
        <Input placeholder="真实姓名" />
      </Form.Item>
      <Form.Item name="title" label="职称/头衔">
        <Input placeholder="如：高级工程师、教授" />
      </Form.Item>
      <Form.Item name="organization" label="所在机构/单位">
        <Input placeholder="公司或学校名称" />
      </Form.Item>
      <Form.Item name="phone" label="联系电话">
        <Input placeholder="手机号码" />
      </Form.Item>
      <Form.Item name="years_exp" label="工作年限">
        <InputNumber min={0} max={60} placeholder="年" style={{ width: '100%' }} />
      </Form.Item>
      <Divider />
      <Title level={5}>专业信息</Title>
      <Form.Item name="domain_tags" label="专业领域">
        <Select mode="multiple" placeholder="选择专业领域" options={DOMAINS.map(d => ({ label: d, value: d }))} />
      </Form.Item>
      <Form.Item name="skills" label="技能标签">
        <Select mode="tags" placeholder="选择或输入技能标签" options={SKILLS.map(s => ({ label: s, value: s }))} />
      </Form.Item>
      <Form.Item name="bio" label="个人简介">
        <Input.TextArea rows={4} placeholder="简要介绍您的专业背景和研究方向..." />
      </Form.Item>
      <Form.Item name="linkedin_url" label="LinkedIn / 个人主页">
        <Input placeholder="https://" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>保存资料</Button>
      </Form.Item>
    </Form>
  );

  const tabs = [
    { key: 'profile', label: '基本资料', children: profileForm },
    {
      key: 'attachments',
      label: '证书附件',
      children: profile ? <AttachmentPanel entityType="expert_profile" entityId={profile.id} /> : null,
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>我的资料</Title>
        {profile && <StatusTag status={profile.status} />}
      </Space>
      {profile?.status === 'pending' && (
        <Text type="warning" style={{ display: 'block', marginBottom: 16 }}>
          您的资料正在等待管理员审核，请完善信息以加快审核流程。
        </Text>
      )}
      {profile?.status === 'rejected' && (
        <Text type="danger" style={{ display: 'block', marginBottom: 16 }}>
          审核未通过：{profile.review_note}，请修改后重新提交。
        </Text>
      )}
      <Card>
        <Tabs items={tabs} />
      </Card>
    </div>
  );
};

export default ProfilePage;
