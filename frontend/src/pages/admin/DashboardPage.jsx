import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, message } from 'antd';
import { UserOutlined, FileTextOutlined, ProjectOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getOverview } from '../../api/statsApi';

const { Title } = Typography;

const DashboardPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getOverview()
      .then(res => setStats(res.data.data))
      .catch(() => message.error('加载统计数据失败'));
  }, []);

  return (
    <div>
      <Title level={4}>控制台</Title>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="专家总数" value={stats?.total_experts ?? '-'} prefix={<UserOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待审核专家" value={stats?.pending_experts ?? '-'} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="技术方案" value={stats?.total_solutions ?? '-'} prefix={<FileTextOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="进行中项目" value={stats?.active_projects ?? '-'} prefix={<ProjectOutlined />} valueStyle={{ color: '#eb2f96' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
