import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, message, Spin } from 'antd';
import ReactECharts from 'echarts-for-react';
import { getCharts } from '../../api/statsApi';

const { Title } = Typography;

const statusLabels = {
  pending: '待审核', approved: '已通过', rejected: '已拒绝', suspended: '已暂停',
  draft: '草稿', submitted: '已提交', under_review: '评审中',
  revision_required: '需修改', archived: '已归档',
  open: '开放中', in_progress: '进行中', completed: '已完成', cancelled: '已取消',
};

const statusColors = {
  pending: '#faad14', approved: '#52c41a', rejected: '#ff4d4f', suspended: '#8c8c8c',
  draft: '#d9d9d9', submitted: '#1890ff', under_review: '#fa8c16',
  revision_required: '#fadb14', archived: '#8c8c8c',
  open: '#1890ff', in_progress: '#fa8c16', completed: '#52c41a', cancelled: '#ff4d4f',
};

const StatisticsPage = () => {
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCharts()
      .then(res => setCharts(res.data.data))
      .catch(() => message.error('加载图表失败'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!charts) return null;

  const expertStatusOption = {
    title: { text: '专家状态分布', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie', radius: '60%',
      data: charts.expertsByStatus.map(r => ({
        name: statusLabels[r.status] || r.status,
        value: parseInt(r.count),
        itemStyle: { color: statusColors[r.status] },
      })),
    }],
  };

  const expertDomainOption = {
    title: { text: '专家领域分布（Top 10）', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: charts.expertsByDomain.map(r => r.domain).reverse(), axisLabel: { width: 80, overflow: 'truncate' } },
    series: [{ type: 'bar', data: charts.expertsByDomain.map(r => parseInt(r.count)).reverse(), itemStyle: { color: '#1890ff' } }],
  };

  const solutionStatusOption = {
    title: { text: '方案状态分布', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie', radius: '60%',
      data: charts.solutionsByStatus.map(r => ({
        name: statusLabels[r.status] || r.status,
        value: parseInt(r.count),
        itemStyle: { color: statusColors[r.status] },
      })),
    }],
  };

  const solutionCategoryOption = {
    title: { text: '方案分类分布', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: charts.solutionsByCategory.map(r => r.category), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: charts.solutionsByCategory.map(r => parseInt(r.count)), itemStyle: { color: '#52c41a' } }],
  };

  const projectStatusOption = {
    title: { text: '项目状态分布', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie', radius: '60%',
      data: charts.projectsByStatus.map(r => ({
        name: statusLabels[r.status] || r.status,
        value: parseInt(r.count),
        itemStyle: { color: statusColors[r.status] },
      })),
    }],
  };

  const monthlyOption = {
    title: { text: '近6个月专家注册趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: charts.monthlyRegistrations.map(r => r.month) },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{ type: 'line', smooth: true, data: charts.monthlyRegistrations.map(r => parseInt(r.count)), itemStyle: { color: '#722ed1' }, areaStyle: { opacity: 0.1 } }],
  };

  return (
    <div>
      <Title level={4}>统计分析</Title>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card><ReactECharts option={expertStatusOption} style={{ height: 300 }} /></Card>
        </Col>
        <Col span={12}>
          <Card><ReactECharts option={solutionStatusOption} style={{ height: 300 }} /></Card>
        </Col>
        <Col span={12}>
          <Card><ReactECharts option={projectStatusOption} style={{ height: 300 }} /></Card>
        </Col>
        <Col span={12}>
          <Card><ReactECharts option={monthlyOption} style={{ height: 300 }} /></Card>
        </Col>
        <Col span={12}>
          <Card><ReactECharts option={expertDomainOption} style={{ height: 350 }} /></Card>
        </Col>
        <Col span={12}>
          <Card><ReactECharts option={solutionCategoryOption} style={{ height: 350 }} /></Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsPage;
