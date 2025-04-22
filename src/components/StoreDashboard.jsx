import React, { useState, useEffect } from 'react';
import { Layout, Card, Statistic, Table, Typography, Row, Col } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Header, Content } = Layout;
const { Title } = Typography;

const API_URL = 'https://smartserver-json-server.onrender.com';

// Styled Components
const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: #f0f2f5;
`;

const StyledHeader = styled(Header)`
  background: #ff4d4f;
  padding: 0 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.15);
`;

const StyledContent = styled(Content)`
  padding: 24px;
`;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StyledStatistic = styled(Statistic)`
  .ant-statistic-title {
    color: #666;
  }
  .ant-statistic-content {
    color: #ff4d4f;
  }
`;

const StoreDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    averageOrderTime: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  const orgId = localStorage.getItem('orgId');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersRes, customersRes] = await Promise.all([
        fetch(`${API_URL}/orders?orgId=${orgId}`),
        fetch(`${API_URL}/customers?orgId=${orgId}`)
      ]);
      const [ordersData, customersData] = await Promise.all([
        ordersRes.json(),
        customersRes.json()
      ]);

      const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0);
      const averageOrderTime = ordersData.length > 0
        ? ordersData.reduce((sum, order) => sum + order.deliveryTime, 0) / ordersData.length
        : 0;

      setStats({
        totalOrders: ordersData.length,
        totalRevenue,
        totalCustomers: customersData.length,
        averageOrderTime
      });

      setRecentOrders(ordersData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (value) => `₹${value}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  return (
    <StyledLayout>
      <StyledHeader>
        <Title level={3} style={{ color: '#ffffff', margin: 0 }}>Store Dashboard</Title>
      </StyledHeader>
      <StyledContent>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <StyledCard>
              <StyledStatistic
                title="Total Orders"
                value={stats.totalOrders}
                prefix={<ShoppingCartOutlined />}
              />
            </StyledCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StyledCard>
              <StyledStatistic
                title="Total Revenue"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
              />
            </StyledCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StyledCard>
              <StyledStatistic
                title="Total Customers"
                value={stats.totalCustomers}
                prefix={<UserOutlined />}
              />
            </StyledCard>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StyledCard>
              <StyledStatistic
                title="Avg. Order Time"
                value={stats.averageOrderTime}
                suffix="min"
                prefix={<ClockCircleOutlined />}
              />
            </StyledCard>
          </Col>
        </Row>
        <StyledCard title="Recent Orders">
          <Table
            columns={columns}
            dataSource={recentOrders}
            loading={loading}
            rowKey="id"
            pagination={false}
          />
        </StyledCard>
      </StyledContent>
    </StyledLayout>
  );
};

export default StoreDashboard; 