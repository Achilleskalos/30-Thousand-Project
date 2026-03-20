import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, DatePicker, Tag, message, Popconfirm, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDeliverables, createDeliverable, submitDeliverable, reviewDeliverable, deleteDeliverable } from '../../api/projectApi';
import AttachmentPanel from '../common/AttachmentPanel';
import StatusTag from '../common/StatusTag';

const { TextArea } = Input;
const { Text } = Typography;

const DeliverablesTab = ({ projectId, isAdmin = true }) => {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState({ open: false });
  const [reviewModal, setReviewModal] = useState({ open: false, record: null, status: null });
  const [attachModal, setAttachModal] = useState({ open: false, record: null });
  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();

  const load = async () => {
    try {
      const res = await getDeliverables(projectId);
      setData(res.data.data);
    } catch { message.error('加载失败'); }
  };

  useEffect(() => { load(); }, [projectId]);

  const handleCreate = async () => {
    const values = form.getFieldsValue();
    const payload = { ...values, due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null };
    try {
      await createDeliverable(projectId, payload);
      message.success('已创建');
      setModal({ open: false });
      form.resetFields();
      load();
    } catch { message.error('操作失败'); }
  };

  const handleReview = async () => {
    const values = reviewForm.getFieldsValue();
    try {
      await reviewDeliverable(projectId, reviewModal.record.id, { status: reviewModal.status, review_note: values.review_note });
      message.success('审核完成');
      setReviewModal({ open: false, record: null, status: null });
      reviewForm.resetFields();
      load();
    } catch { message.error('操作失败'); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDeliverable(projectId, id);
      message.success('已删除');
      load();
    } catch { message.error('删除失败'); }
  };

  const columns = [
    { title: '交付物', dataIndex: 'title' },
    { title: '截止日期', dataIndex: 'due_date', render: v => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
    { title: '状态', dataIndex: 'status', render: v => <StatusTag status={v} /> },
    { title: '提交人', dataIndex: 'submitted_by_name', render: v => v || '-' },
    { title: '提交时间', dataIndex: 'submitted_at', render: v => v ? new Date(v).toLocaleDateString('zh-CN') : '-' },
    { title: '审核备注', dataIndex: 'review_note', render: v => v || '-', ellipsis: true },
    {
      title: '操作',
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => setAttachModal({ open: true, record: r })}>附件</Button>
          {!isAdmin && r.status === 'pending' && (
            <Button size="small" type="primary" ghost onClick={async () => {
              try { await submitDeliverable(projectId, r.id); message.success('已提交'); load(); }
              catch (err) { message.error(err.response?.data?.error?.message || '提交失败'); }
            }}>提交</Button>
          )}
          {isAdmin && r.status === 'submitted' && (
            <>
              <Button icon={<CheckOutlined />} size="small" type="primary" ghost
                onClick={() => { reviewForm.resetFields(); setReviewModal({ open: true, record: r, status: 'approved' }); }}>通过</Button>
              <Button icon={<CloseOutlined />} size="small" danger ghost
                onClick={() => { reviewForm.resetFields(); setReviewModal({ open: true, record: r, status: 'rejected' }); }}>拒绝</Button>
            </>
          )}
          {isAdmin && r.status === 'pending' && (
            <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)} okText="删除" cancelText="取消">
              <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      {isAdmin && (
        <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }}
          onClick={() => { form.resetFields(); setModal({ open: true }); }}>
          新增交付物
        </Button>
      )}
      <Table rowKey="id" columns={columns} dataSource={data} pagination={false} size="small" />

      <Modal title="新增交付物" open={modal.open} onOk={handleCreate}
        onCancel={() => { setModal({ open: false }); form.resetFields(); }}
        okText="创建" cancelText="取消">
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="交付物名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="描述"><TextArea rows={2} /></Form.Item>
          <Form.Item name="due_date" label="截止日期"><DatePicker style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      <Modal title={`审核交付物：${reviewModal.record?.title}`} open={reviewModal.open}
        onOk={handleReview}
        onCancel={() => { setReviewModal({ open: false, record: null, status: null }); reviewForm.resetFields(); }}
        okText="确认" cancelText="取消"
        okButtonProps={{ danger: reviewModal.status === 'rejected' }}>
        <Form form={reviewForm} layout="vertical">
          <Form.Item name="review_note" label="审核意见">
            <TextArea rows={3} placeholder="填写审核意见..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={`附件：${attachModal.record?.title}`} open={attachModal.open} footer={null}
        onCancel={() => setAttachModal({ open: false, record: null })} width={700}>
        {attachModal.record && (
          <AttachmentPanel entityType="deliverable" entityId={attachModal.record.id} readonly={!isAdmin && attachModal.record.status !== 'pending'} />
        )}
      </Modal>
    </>
  );
};

export default DeliverablesTab;
