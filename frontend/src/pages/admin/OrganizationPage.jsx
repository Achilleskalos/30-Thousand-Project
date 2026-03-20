import { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, message, Modal, Form, Input, Select, Tag, Collapse, Switch } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { getOrganizations, createOrganization, updateOrganization, createDepartment } from '../../api/organizationApi';

const { Title } = Typography;
const { Panel } = Collapse;

const ORG_TYPES = ['高校', '科研院所', '企业', '政府机构', '医疗机构', '其他'];

const OrganizationPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orgModal, setOrgModal] = useState({ open: false, record: null });
  const [deptModal, setDeptModal] = useState({ open: false, orgId: null });
  const [orgForm] = Form.useForm();
  const [deptForm] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getOrganizations();
      setData(res.data.data);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleOrgSave = async () => {
    const values = orgForm.getFieldsValue();
    try {
      if (orgModal.record) {
        await updateOrganization(orgModal.record.id, values);
        message.success('已更新');
      } else {
        await createOrganization(values);
        message.success('已创建');
      }
      setOrgModal({ open: false, record: null });
      orgForm.resetFields();
      load();
    } catch (err) { message.error(err.response?.data?.error?.message || '操作失败'); }
  };

  const handleDeptSave = async () => {
    const values = deptForm.getFieldsValue();
    try {
      await createDepartment(deptModal.orgId, values);
      message.success('部门已添加');
      setDeptModal({ open: false, orgId: null });
      deptForm.resetFields();
      load();
    } catch (err) { message.error(err.response?.data?.error?.message || '操作失败'); }
  };

  const columns = [
    { title: '机构名称', dataIndex: 'name' },
    { title: '简称', dataIndex: 'short_name', render: v => v || '-' },
    { title: '类型', dataIndex: 'type', render: v => v || '-' },
    { title: '部门数', dataIndex: 'dept_count' },
    { title: '状态', dataIndex: 'is_active', render: v => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag> },
    {
      title: '操作',
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => { orgForm.setFieldsValue(r); setOrgModal({ open: true, record: r }); }}>编辑</Button>
          <Button icon={<PlusOutlined />} size="small" onClick={() => setDeptModal({ open: true, orgId: r.id })}>添加部门</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>机构管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { orgForm.resetFields(); setOrgModal({ open: true, record: null }); }}>新增机构</Button>
      </Space>

      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={false} />

      <Modal title={orgModal.record ? '编辑机构' : '新增机构'} open={orgModal.open}
        onOk={handleOrgSave} onCancel={() => { setOrgModal({ open: false, record: null }); orgForm.resetFields(); }}
        okText="保存" cancelText="取消">
        <Form form={orgForm} layout="vertical">
          <Form.Item name="name" label="机构名称" rules={[{ required: true, message: '请输入机构名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="short_name" label="简称"><Input /></Form.Item>
          <Form.Item name="type" label="类型">
            <Select options={ORG_TYPES.map(t => ({ label: t, value: t }))} placeholder="选择类型" />
          </Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
          {orgModal.record && (
            <Form.Item name="is_active" label="状态" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="停用" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal title="添加部门" open={deptModal.open}
        onOk={handleDeptSave} onCancel={() => { setDeptModal({ open: false, orgId: null }); deptForm.resetFields(); }}
        okText="保存" cancelText="取消">
        <Form form={deptForm} layout="vertical">
          <Form.Item name="name" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrganizationPage;
