import { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, message, Modal, Form, Input, InputNumber, Select, Tag, Switch, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getDictionaries, createDictionary, updateDictionary, deleteDictionary } from '../../api/dictionaryApi';

const { Title } = Typography;

const CATEGORIES = [
  { key: 'expert_level', label: '专家级别' },
  { key: 'expert_domain', label: '专业领域' },
  { key: 'project_type', label: '项目类型' },
];

const DictionaryTable = ({ category }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, record: null });
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getDictionaries({ category });
      setData(res.data.data);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [category]);

  const handleSave = async () => {
    const values = { ...form.getFieldsValue(), category };
    try {
      if (modal.record) {
        await updateDictionary(modal.record.id, values);
      } else {
        await createDictionary(values);
      }
      message.success('已保存');
      setModal({ open: false, record: null });
      form.resetFields();
      load();
    } catch (err) { message.error(err.response?.data?.error?.message || '操作失败'); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDictionary(id);
      message.success('已删除');
      load();
    } catch { message.error('删除失败'); }
  };

  const columns = [
    { title: '代码', dataIndex: 'code' },
    { title: '名称', dataIndex: 'label' },
    { title: '排序', dataIndex: 'sort_order' },
    { title: '状态', dataIndex: 'is_active', render: v => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag> },
    {
      title: '操作',
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => { form.setFieldsValue(r); setModal({ open: true, record: r }); }}>编辑</Button>
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(r.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }}
        onClick={() => { form.resetFields(); setModal({ open: true, record: null }); }}>
        新增
      </Button>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={false} size="small" />
      <Modal title={modal.record ? '编辑字典项' : '新增字典项'} open={modal.open}
        onOk={handleSave} onCancel={() => { setModal({ open: false, record: null }); form.resetFields(); }}
        okText="保存" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="代码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="label" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="sort_order" label="排序"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item>
          {modal.record && (
            <Form.Item name="is_active" label="状态" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="停用" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

const DictionaryPage = () => (
  <div>
    <Title level={4}>字典管理</Title>
    <Tabs items={CATEGORIES.map(c => ({ key: c.key, label: c.label, children: <DictionaryTable category={c.key} /> }))} />
  </div>
);

export default DictionaryPage;
