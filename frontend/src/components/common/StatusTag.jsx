import { Tag } from 'antd';

const statusMap = {
  pending:   { color: 'orange', text: '待审核' },
  approved:  { color: 'green',  text: '已通过' },
  rejected:  { color: 'red',    text: '已拒绝' },
  suspended: { color: 'gray',   text: '已暂停' },
  draft:        { color: 'default', text: '草稿' },
  submitted:    { color: 'blue',    text: '已提交' },
  under_review: { color: 'orange',  text: '评审中' },
  revision_required: { color: 'gold', text: '需修改' },
  archived:  { color: 'gray',   text: '已归档' },
  open:        { color: 'blue',   text: '开放中' },
  in_progress: { color: 'orange', text: '进行中' },
  completed:   { color: 'green',  text: '已完成' },
  cancelled:   { color: 'red',    text: '已取消' },
};

const StatusTag = ({ status }) => {
  const s = statusMap[status] || { color: 'default', text: status };
  return <Tag color={s.color}>{s.text}</Tag>;
};

export default StatusTag;
