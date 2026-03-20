import { useState, useEffect } from 'react';
import { Table, Button, Typography, message, Modal, Form, Input } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { getConfig, updateConfig } from '../../api/configApi';

const { Title } = Typography;

const SystemConfigPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, record: null });
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getConfig();
      setData(res.data.data);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const values = form.getFieldsValue();
    try {
      await updateConfig(modal.record.config_key, values);
      message.success('已保存');
      setModal({ open: false, record: null });
      form.resetFields();
      load();
    } catch { message.error('保存失败'); }
  };

  const columns = [
    { title: '分组', dataIndex: 'group_name' },
    { title: '配置项', dataIndex: 'label' },
    { title: '键名', dataIndex: 'config_key', render: v => <code>{v}</code> },
    { title: '当前值', dataIndex: 'config_val' },
    { title: '备注', dataIndex: 'remark', render: v => v || '-' },
    {
      title: '操作',
      render: (_, r) => (
        <Button icon={<EditOutlined />} size="small"
          onClick={() => { form.setFieldsValue({ config_val: r.config_val }); setModal({ open: true, record: r }); }}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>系统配置</Title>
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={false} />
      <Modal title={`编辑：${modal.record?.label}`} open={modal.open}
        onOk={handleSave} onCancel={() => { setModal({ open: false, record: null }); form.resetFields(); }}
        okText="保存" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item name="config_val" label="配置值" rules={[{ required: true, message: '请输入配置值' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemConfigPage;
