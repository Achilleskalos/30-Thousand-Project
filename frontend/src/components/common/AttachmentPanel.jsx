import { useState, useEffect } from 'react';
import { Upload, Button, Table, Typography, message, Popconfirm, Space } from 'antd';
import { UploadOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { getAttachments, uploadAttachment, deleteAttachment } from '../../api/attachmentApi';

const { Text } = Typography;

const formatSize = (bytes) => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const AttachmentPanel = ({ entityType, entityId, readonly = false }) => {
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const res = await getAttachments(entityType, entityId);
      setAttachments(res.data.data);
    } catch { message.error('加载附件失败'); }
  };

  useEffect(() => { if (entityId) load(); }, [entityId]);

  const handleUpload = async ({ file }) => {
    setUploading(true);
    try {
      await uploadAttachment(entityType, entityId, file);
      message.success('上传成功');
      load();
    } catch (err) { message.error(err.response?.data?.error?.message || '上传失败'); }
    finally { setUploading(false); }
    return false;
  };

  const handleDelete = async (id) => {
    try {
      await deleteAttachment(id);
      message.success('已删除');
      load();
    } catch { message.error('删除失败'); }
  };

  const columns = [
    { title: '文件名', dataIndex: 'file_name', ellipsis: true },
    { title: '大小', dataIndex: 'file_size', render: v => formatSize(v) },
    { title: '上传人', dataIndex: 'uploaded_by_email', render: v => v || '-' },
    { title: '上传时间', dataIndex: 'created_at', render: v => new Date(v).toLocaleDateString('zh-CN') },
    {
      title: '操作',
      render: (_, r) => (
        <Space>
          <Button icon={<DownloadOutlined />} size="small"
            href={`/api/v1/attachments/file/${r.id}`} target="_blank">下载</Button>
          {!readonly && (
            <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)} okText="删除" cancelText="取消">
              <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {!readonly && (
        <Upload beforeUpload={(file) => { handleUpload({ file }); return false; }} showUploadList={false}>
          <Button icon={<UploadOutlined />} loading={uploading} style={{ marginBottom: 12 }}>上传附件</Button>
        </Upload>
      )}
      {attachments.length === 0
        ? <Text type="secondary">暂无附件</Text>
        : <Table rowKey="id" columns={columns} dataSource={attachments} pagination={false} size="small" />
      }
    </div>
  );
};

export default AttachmentPanel;
