import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, DatePicker, Select, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from '../../api/projectApi';

const { TextArea } = Input;
const { Option } = Select;

const statusColor = { pending: 'blue', completed: 'green', overdue: 'red' };
const statusLabel = { pending: '未完成', completed: '已完成', overdue: '已逾期' };

const MilestonesTab = ({ projectId, readonly = false }) => {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState({ open: false, record: null });
  const [form] = Form.useForm();

  const load = async () => {
    try {
      const res = await getMilestones(projectId);
      setData(res.data.data);
    } catch { message.error('加载失败'); }
  };

  useEffect(() => { load(); }, [projectId]);

  const handleSave = async () => {
    const values = form.getFieldsValue();
    const payload = { ...values, due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null };
    try {
      if (modal.record) {
        await updateMilestone(projectId, modal.record.id, payload);
      } else {
        await createMilestone(projectId, payload);
      }
      message.success('已保存');
      setModal({ open: false, record: null });
      form.resetFields();
      load();
    } catch { message.error('操作失败'); }
  };

  const handleComplete = async (record) => {
    try {
      await updateMilestone(projectId, record.id, { status: 'completed' });
      message.success('里程碑已完成');
      load();
    } catch { message.error('操作失败'); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMilestone(projectId, id);
      message.success('已删除');
      load();
    } catch { message.error('删除失败'); }
  };

  const columns = [
    { title: '标题', dataIndex: 'title' },
    { title: '截止日期', dataIndex: 'due_date', render: v => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
    { title: '状态', dataIndex: 'status', render: v => <Tag color={statusColor[v]}>{statusLabel[v]}</Tag> },
    { title: '完成时间', dataIndex: 'completed_at', render: v => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
    { title: '描述', dataIndex: 'description', ellipsis: true, render: v => v || '-' },
    ...(!readonly ? [{
      title: '操作',
      render: (_, r) => (
        <Space>
          {r.status === 'pending' && (
            <Button icon={<CheckOutlined />} size="small" type="primary" ghost onClick={() => handleComplete(r)}>完成</Button>
          )}
          <Button icon={<EditOutlined />} size="small" onClick={() => {
            form.setFieldsValue({ ...r, due_date: r.due_date ? dayjs(r.due_date) : null });
            setModal({ open: true, record: r });
          }}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)} okText="删除" cancelText="取消">
            <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  return (
    <>
      {!readonly && (
        <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }}
          onClick={() => { form.resetFields(); setModal({ open: true, record: null }); }}>
          新增里程碑
        </Button>
      )}
      <Table rowKey="id" columns={columns} dataSource={data} pagination={false} size="small" />

      <Modal title={modal.record ? '编辑里程碑' : '新增里程碑'} open={modal.open}
        onOk={handleSave} onCancel={() => { setModal({ open: false, record: null }); form.resetFields(); }}
        okText="保存" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述"><TextArea rows={2} /></Form.Item>
          <Form.Item name="due_date" label="截止日期"><DatePicker style={{ width: '100%' }} /></Form.Item>
          {modal.record && (
            <Form.Item name="status" label="状态">
              <Select>
                <Option value="pending">未完成</Option>
                <Option value="completed">已完成</Option>
                <Option value="overdue">已逾期</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default MilestonesTab;
