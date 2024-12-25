import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Typography, Progress, Tag, Space,
  Select, DatePicker, Empty, Tabs, Badge, Avatar, List,
  Button, notification, Grid
} from 'antd';
import {
  DashboardOutlined, ShopOutlined, AppstoreOutlined, OrderedListOutlined, 
  UserOutlined, FireOutlined, ClockCircleOutlined,
  DollarOutlined, BarsOutlined, TagsOutlined,
  BarChartOutlined, PieChartOutlined, CalendarOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FoodLoader from './FoodLoader';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const getStatusColor = (status) => {
  const colors = {
    pending: '#faad14',    // Gold
    preparing: '#1890ff',  // Blue
    ready: '#52c41a',      // Green
    completed: '#52c41a',  // Green
    cancelled: '#ff4d4f'   // Red
  };
  return colors[status] || '#000000';
};

const getStatusCardStyle = (status) => ({
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  borderLeft: `3px solid ${getStatusColor(status)}`,
  height: '100%'
});

const formatDecimal = (number) => {
  return Number(parseFloat(number).toFixed(2)).toString();
};

const formatCurrency = (value) => {
  return `₹${formatDecimal(value).toLocaleString('en-IN')}`;
};

const calculateGrowthRate = (current, previous) => {
  if (!previous) return 0;
  return ((current - previous) / previous * 100).toFixed(1);
};

const SalesAnalysis = ({ orders }) => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('daily');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [orders]);

  const filterOrdersByDate = (orders) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'daily':
        startDate.setDate(now.getDate() - 7); // Last 7 days
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 28); // Last 4 weeks
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 3); // Last 3 months
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    return orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= startDate && orderDate <= now;
    });
  };

  const getSalesData = () => {
    const salesMap = {};
    const filteredOrders = filterOrdersByDate(orders);

    filteredOrders.forEach(order => {
      if (order.status === 'completed') {
        const orderDate = new Date(order.timestamp);
        const key = orderDate.toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
        
        if (!salesMap[key]) {
          salesMap[key] = {
            date: key,
            revenue: 0,
            orders: 0,
            avgOrderValue: 0
          };
        }
        salesMap[key].revenue += parseFloat(order.total) || 0;
        salesMap[key].orders += 1;
      }
    });

    // Calculate average order value
    Object.values(salesMap).forEach(day => {
      day.avgOrderValue = day.revenue / day.orders;
    });

    return Object.values(salesMap);
  };

  const calculateTotalMetrics = () => {
    const data = getSalesData();
    return {
      totalRevenue: data.reduce((acc, day) => acc + day.revenue, 0),
      totalOrders: data.reduce((acc, day) => acc + day.orders, 0),
      avgRevenue: data.reduce((acc, day) => acc + day.revenue, 0) / data.length,
      avgOrders: data.reduce((acc, day) => acc + day.orders, 0) / data.length
    };
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <FoodLoader />
      </div>
    );
  }

  const metrics = calculateTotalMetrics();

  return (
    <div style={styles.analysisContainer}>
      <Card style={styles.filterCard}>
        <Select
          value={timeRange}
          style={{ width: 120 }}
          onChange={setTimeRange}
        >
          <Select.Option value="daily">Last 7 Days</Select.Option>
          <Select.Option value="weekly">Last 4 Weeks</Select.Option>
          <Select.Option value="monthly">Last 3 Months</Select.Option>
        </Select>
      </Card>

      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={styles.statCard}>
            <Statistic
              title="Total Revenue"
              value={metrics.totalRevenue}
              prefix="₹"
              formatter={value => value.toLocaleString('en-IN')}
              valueStyle={styles.statValue}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={styles.statCard}>
            <Statistic
              title="Total Orders"
              value={metrics.totalOrders}
              valueStyle={styles.statValue}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={styles.statCard}>
            <Statistic
              title="Avg. Daily Revenue"
              value={metrics.avgRevenue}
              prefix="₹"
              formatter={value => value.toLocaleString('en-IN')}
              valueStyle={styles.statValue}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={styles.statCard}>
            <Statistic
              title="Avg. Daily Orders"
              value={metrics.avgOrders}
              precision={1}
              valueStyle={styles.statValue}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Card title="Revenue Trend" style={styles.chartCard}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getSalesData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              angle={0} 
              textAnchor="middle" 
              height={60}
              interval={0}
            />
            <YAxis 
              yAxisId="left"
              orientation="left"
              stroke="#8884d8"
              label={{ value: 'Revenue (₹)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#82ca9d"
              label={{ value: 'Orders', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'revenue') return ['₹' + value.toLocaleString('en-IN'), 'Revenue'];
                return [value, 'Orders'];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue" />
            <Bar yAxisId="right" dataKey="orders" fill="#82ca9d" name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Daily Breakdown */}
      <Card title="Daily Sales Breakdown" style={styles.sectionCard}>
        <div style={styles.salesBreakdownContainer}>
          <Row gutter={[16, 16]}>
            {getSalesData().map(item => (
              <Col xs={24} sm={12} md={8} lg={6} key={item.date}>
                <Card style={styles.breakdownCard}>
                  <div style={styles.breakdownHeader}>
                    <Space>
                      <CalendarOutlined style={{ color: '#ff4d4f' }} />
                      <Text strong>{item.date}</Text>
                    </Space>
                  </div>
                  <div style={styles.breakdownStats}>
                    <Statistic
                      title="Revenue"
                      value={item.revenue}
                      prefix="₹"
                      formatter={value => value.toLocaleString('en-IN')}
                      valueStyle={{ fontSize: '16px', color: '#ff4d4f' }}
                    />
                    <Statistic
                      title="Orders"
                      value={item.orders}
                      valueStyle={{ fontSize: '16px' }}
                    />
                    <Statistic
                      title="Avg. Order"
                      value={item.avgOrderValue}
                      prefix="₹"
                      precision={2}
                      formatter={value => value.toLocaleString('en-IN')}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </div>
                  <Progress 
                    percent={(item.revenue / Math.max(...getSalesData().map(d => d.revenue)) * 100).toFixed(1)} 
                    size="small" 
                    strokeColor="#ff4d4f"
                    style={{ marginTop: '8px' }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Card>
    </div>
  );
};

const MenuInsights = ({ menuItems, orders, categories }) => {
  const calculateItemPerformance = () => {
    const itemStats = {};
    orders.forEach(order => {
      if (order.status === 'completed' && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!itemStats[item.id]) {
            const menuItem = menuItems.find(mi => mi.id === item.id);
            itemStats[item.id] = {
              name: menuItem?.name || item.name,
              quantity: 0,
              revenue: 0,
              category: categories.find(c => c.id === menuItem?.categoryId)?.name || 'Unknown'
            };
          }
          itemStats[item.id].quantity += item.quantity || 1;
          itemStats[item.id].revenue += (item.price * item.quantity) || 0;
        });
      }
    });
    return Object.values(itemStats);
  };

  return (
    <div style={{ padding: '16px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Menu Performance Overview">
            <List
              dataSource={calculateItemPerformance().sort((a, b) => b.revenue - a.revenue)}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{
                        backgroundColor: index < 3 ? '#ff4d4f' : '#d9d9d9',
                        color: 'white'
                      }}>
                        {index + 1}
                      </Avatar>
                    }
                    title={item.name}
                    description={
                      <Space direction="vertical">
                        {/* <Tag color="blue">{item.category}</Tag> */}
                        <Text>Quantity Sold: {item.quantity}</Text>
                        <Text>Revenue: ₹{item.revenue.toLocaleString('en-IN')}</Text>
                      </Space>
                    }
                  />
                  <Progress 
                    percent={(item.quantity / Math.max(...calculateItemPerformance().map(i => i.quantity)) * 100).toFixed(1)} 
                    size="small" 
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

      </Row>
    </div>
  );
};

const OrderAnalytics = ({ orders }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const calculateOrderMetrics = () => {
    const hourlyDistribution = new Array(24).fill(0);
    const statusCounts = {
      pending: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
      cancelled: 0
    };
    const avgPreparationTime = [];
    const dailyOrders = {};

    orders.forEach(order => {
      // Hourly distribution
      const hour = new Date(order.timestamp).getHours();
      hourlyDistribution[hour]++;

      // Status counts
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;

      // Preparation time (if completed)
      if (order.status === 'completed' && order.completedAt) {
        const prepTime = (new Date(order.completedAt) - new Date(order.timestamp)) / (1000 * 60); // in minutes
        avgPreparationTime.push(prepTime);
      }

      // Daily orders
      const date = new Date(order.timestamp).toLocaleDateString();
      if (!dailyOrders[date]) {
        dailyOrders[date] = {
          date,
          count: 0,
          revenue: 0
        };
      }
      dailyOrders[date].count++;
      dailyOrders[date].revenue += parseFloat(order.total) || 0;
    });

    return {
      hourlyDistribution,
      statusCounts,
      avgPrepTime: avgPreparationTime.length ? 
        (avgPreparationTime.reduce((a, b) => a + b, 0) / avgPreparationTime.length).toFixed(1) : 0,
      dailyOrders: Object.values(dailyOrders)
    };
  };

  if (loading) return <div style={styles.loaderContainer}><FoodLoader /></div>;

  const metrics = calculateOrderMetrics();

  return (
    <div style={styles.analyticsContainer}>
      {/* Order Status Overview */}
      <Card title="Order Status Distribution" style={styles.card}>
        <Row gutter={[16, 16]}>
          {Object.entries(metrics.statusCounts).map(([status, count]) => (
            <Col xs={12} sm={8} md={4} key={status}>
              <Card style={getStatusCardStyle(status)}>
                <Space align="center">
                  <div style={styles.statusIndicator(status)} />
                  <Statistic
                    title={status.charAt(0).toUpperCase() + status.slice(1)}
                    value={count}
                    valueStyle={{ color: getStatusColor(status) }}
                    suffix={
                      <small style={{ fontSize: '12px' }}>
                        ({((count / orders.length) * 100).toFixed(1)}%)
                      </small>
                    }
                  />
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Peak Hours Analysis */}
      <Card title="Peak Hours Analysis" style={styles.card}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metrics.hourlyDistribution.map((count, hour) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            orders: count
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hour" 
              interval={2}
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{fontSize: 12}}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="orders" fill="#ff4d4f" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Performance Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Order Processing" style={styles.card}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                title="Average Preparation Time"
                value={metrics.avgPrepTime}
                suffix="minutes"
                valueStyle={{ color: '#ff4d4f' }}
              />
              <Progress
                percent={((metrics.statusCounts.completed || 0) / orders.length * 100).toFixed(1)}
                status="active"
                strokeColor="#ff4d4f"
              />
              <Text type="secondary">Order Completion Rate</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Daily Performance" style={styles.card}>
            <List
              dataSource={metrics.dailyOrders.slice(-5)}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.date}
                    description={
                      <Space>
                        <Tag color="#ff4d4f">{item.count} orders</Tag>
                        <Tag color="#52c41a">₹{item.revenue.toLocaleString('en-IN')}</Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const TableAnalytics = ({ orders }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const calculateTableMetrics = () => {
    const tableUsage = {};
    const turnoverRates = {};
    
    orders.forEach(order => {
      const tableNo = order.tableNumber;
      if (!tableNo) return;

      if (!tableUsage[tableNo]) {
        tableUsage[tableNo] = {
          totalOrders: 0,
          revenue: 0,
          avgOrderValue: 0,
          peakHours: new Array(24).fill(0)
        };
      }

      tableUsage[tableNo].totalOrders++;
      tableUsage[tableNo].revenue += parseFloat(order.total) || 0;
      const hour = new Date(order.timestamp).getHours();
      tableUsage[tableNo].peakHours[hour]++;
    });

    // Calculate averages
    Object.values(tableUsage).forEach(table => {
      table.avgOrderValue = table.revenue / table.totalOrders;
    });

    return { tableUsage };
  };

  if (loading) return <div style={styles.loaderContainer}><FoodLoader /></div>;

  const { tableUsage } = calculateTableMetrics();

  return (
    <div style={styles.analyticsContainer}>
      <Row gutter={[16, 16]}>
        {Object.entries(tableUsage).map(([tableNo, metrics]) => (
          <Col xs={24} sm={12} lg={8} key={tableNo}>
            <Card 
              title={`Table ${tableNo}`}
              style={styles.tableCard}
              extra={
                <Tag color="#ff4d4f" style={styles.statusBadge}>
                  {metrics.totalOrders} orders
                </Tag>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic
                  title="Total Revenue"
                  value={metrics.revenue}
                  prefix="₹"
                  formatter={value => value.toLocaleString('en-IN')}
                />
                <Statistic
                  title="Average Order Value"
                  value={metrics.avgOrderValue}
                  prefix="₹"
                  precision={2}
                  formatter={value => value.toLocaleString('en-IN')}
                />
                <div>
                  <Text type="secondary">Peak Hours</Text>
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={metrics.peakHours.map((count, hour) => ({
                      hour: `${hour}:00`,
                      orders: count
                    }))}>
                      <XAxis dataKey="hour" interval={3} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#ff4d4f" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

const styles = {
  container: {
    padding: '8px 4px',
    maxWidth: '1200px',
    margin: '0 auto',
    marginTop: '56px',
    marginBottom: '24px'
  },
  tabContent: {
    padding: '8px 4px'
  },
  filterCard: {
    marginBottom: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    background: 'white',
    padding: '8px'
  },
  statCard: {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    height: '100%',
    background: 'white'
  },
  sectionCard: {
    marginTop: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    background: 'white'
  },
  statValue: {
    color: '#ff4d4f',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  categoryAvatar: {
    backgroundColor: '#ff4d4f',
    color: 'white'
  },
  rankAvatar: {
    backgroundColor: '#1890ff',
    color: 'white'
  },
  menuItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  menuItemImage: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    objectFit: 'cover'
  },
  menuItemInfo: {
    flex: 1,
    marginLeft: '12px'
  },
  menuItemName: {
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  menuItemPrice: {
    color: '#ff4d4f',
    fontSize: '14px'
  },
  chartContainer: {
    marginTop: '24px',
    height: '300px'
  },
  tabPane: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px'
  },
  header: {
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  headerTitle: {
    margin: 0,
    color: '#262626'
  },
  dateRangePicker: {
    marginBottom: '16px'
  },
  insightCard: {
    borderRadius: '12px',
    marginBottom: '16px'
  },
  insightIcon: {
    fontSize: '24px',
    color: '#ff4d4f'
  },
  progressBar: {
    marginTop: '8px'
  },
  listItem: {
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  tag: {
    borderRadius: '12px',
    padding: '4px 12px'
  },
  mobileResponsive: {
    '@media (max-width: 768px)': {
      padding: '8px',
      marginTop: '56px'
    }
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px',
    marginTop: '16px'
  },
  categoryCard: {
    borderRadius: '12px',
    height: '100%'
  },
  orderStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '14px'
  },
  tooltip: {
    maxWidth: '300px'
  },
  badge: {
    backgroundColor: '#ff4d4f',
    color: 'white',
    padding: '0 8px',
    borderRadius: '10px',
    fontSize: '12px'
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px'
  },
  analysisContainer: {
    padding: '8px 4px',
    marginBottom: '24px'
  },
  chartCard: {
    marginTop: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    background: 'white'
  },
  salesBreakdownContainer: {
    overflowX: 'auto',
    padding: '8px 0'
  },
  breakdownCard: {
    height: '100%',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  breakdownHeader: {
    marginBottom: '16px',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '8px'
  },
  breakdownStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  analyticsContainer: {
    padding: '8px 4px'
  },
  card: {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '16px'
  },
  tableCard: {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  statusBadge: {
    borderRadius: '12px',
    padding: '4px 12px',
    fontSize: '12px'
  },
  statusIndicator: (status) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: getStatusColor(status),
    display: 'inline-block',
    marginRight: '8px'
  }),
  trendIndicator: {
    positive: {
      color: '#52c41a'
    },
    negative: {
      color: '#ff4d4f'
    }
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  },
  chartWrapper: {
    marginTop: '24px',
    height: '300px'
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px'
  },
  mobileTabBar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 4px',
    background: '#fff',
    borderBottom: '1px solid #f0f0f0',
    position: 'fixed',
    top: '64px',
    left: 0,
    right: 0,
    zIndex: 100
  },
  tabButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '4px',
    flex: '1',
    minWidth: '60px',
    border: 'none',
    background: 'transparent',
    color: '#595959',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  activeTabButton: {
    color: '#ff4d4f'
  },
  tabIcon: {
    fontSize: '20px',
    marginBottom: '2px'
  },
  tabLabel: {
    fontSize: '11px',
    lineHeight: '1.2',
    textAlign: 'center'
  },
  contentWrapper: {
    marginTop: '72px',
    marginBottom: '24px'
  }
};

export const RestaurantDashboard = () => {
  // State Management
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  const [dateRange, setDateRange] = useState([null, null]);
  const [timeFrame, setTimeFrame] = useState('today');
  const orgId = localStorage.getItem('orgId');

  // Fetch Data
  useEffect(() => {
    fetchDashboardData();
  }, [orgId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch orders
      const ordersResponse = await fetch('https://smartdb-175f4-default-rtdb.firebaseio.com/history.json');
      const ordersData = await ordersResponse.json();
      
      // Fetch categories
      const categoriesResponse = await fetch('https://smartdb-175f4-default-rtdb.firebaseio.com/categories.json');
      const categoriesData = await categoriesResponse.json();
      
      // Fetch menu items
      const menuItemsResponse = await fetch('https://smartdb-175f4-default-rtdb.firebaseio.com/menu_items.json');
      const menuItemsData = await menuItemsResponse.json();

      // Process orders
      const processedOrders = ordersData ? 
        Object.entries(ordersData)
          .map(([key, value]) => ({
            ...value,
            id: key
          }))
          .filter(order => order.orgId === orgId)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];

      // Process categories
      const processedCategories = categoriesData ?
        Object.entries(categoriesData)
          .map(([key, value]) => ({
            ...value,
            id: key
          }))
          .filter(cat => cat.orgId === orgId) : [];

      // Process menu items
      const processedMenuItems = menuItemsData ?
        Object.entries(menuItemsData)
          .map(([key, value]) => ({
            ...value,
            id: key
          }))
          .filter(item => item.orgId === orgId) : [];

      setOrders(processedOrders);
      setCategories(processedCategories);
      setMenuItems(processedMenuItems);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load dashboard data'
      });
    } finally {
      setLoading(false);
    }
  };

  // Analytics Calculations
  const calculateMetrics = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Filter orders based on timeFrame
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      switch(timeFrame) {
        case 'today':
          return orderDate >= today;
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          return orderDate >= monthAgo;
        default:
          return true;
      }
    });

    const activeOrders = filteredOrders.filter(order => 
      !['completed', 'cancelled'].includes(order.status)
    );

    const completedOrders = filteredOrders.filter(order => 
      order.status === 'completed'
    );

    const cancelledOrders = filteredOrders.filter(order => 
      order.status === 'cancelled'
    );

    const totalRevenue = completedOrders.reduce((sum, order) => 
      sum + (parseFloat(order.total) || 0), 0
    );

    // Calculate category performance
    const categoryPerformance = {};
    completedOrders.forEach(order => {
      order.items?.forEach(item => {
        const menuItem = menuItems.find(mi => mi.id === item.id);
        if (menuItem) {
          const category = categories.find(c => c.id === menuItem.categoryId);
          if (category) {
            if (!categoryPerformance[category.id]) {
              categoryPerformance[category.id] = {
                name: category.name,
                orders: 0,
                revenue: 0,
                items: 0
              };
            }
            categoryPerformance[category.id].orders++;
            categoryPerformance[category.id].revenue += parseFloat(item.price) * item.quantity;
            categoryPerformance[category.id].items += item.quantity;
          }
        }
      });
    });

    return {
      totalOrders: filteredOrders.length,
      activeOrders: activeOrders.length,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalRevenue,
      avgOrderValue: completedOrders.length ? totalRevenue / completedOrders.length : 0,
      categoryPerformance: Object.values(categoryPerformance),
      completionRate: (completedOrders.length / filteredOrders.length) * 100 || 0,
      cancellationRate: (cancelledOrders.length / filteredOrders.length) * 100 || 0
    };
  };

  const renderOverviewTab = () => {
    const metrics = calculateMetrics();

    return (
      <div style={styles.tabContent}>
        {/* Time Frame Selector */}
        <Card style={styles.filterCard}>
          <Select
            value={timeFrame}
            onChange={setTimeFrame}
            style={{ width: 120 }}
          >
            <Select.Option value="today">Today</Select.Option>
            <Select.Option value="week">This Week</Select.Option>
            <Select.Option value="month">This Month</Select.Option>
            <Select.Option value="all">All Time</Select.Option>
          </Select>
        </Card>

        {/* Key Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} md={6}>
            <Card style={styles.statCard}>
              <Statistic
                title={<Text strong>Total Revenue</Text>}
                value={metrics.totalRevenue}
                prefix="₹"
                formatter={value => formatDecimal(value).toLocaleString('en-IN')}
                valueStyle={styles.statValue}
              />
              <Progress 
                percent={Number(metrics.completionRate).toFixed(1)} 
                size="small" 
                status="active"
                strokeColor="#52c41a"
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card style={styles.statCard}>
              <Statistic
                title={<Text strong>Active Orders</Text>}
                value={metrics.activeOrders}
                prefix={<ClockCircleOutlined />}
                valueStyle={styles.statValue}
              />
              <Text type="secondary">Pending Completion</Text>
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card style={styles.statCard}>
              <Statistic
                title={<Text strong>Avg Order Value</Text>}
                value={metrics.avgOrderValue}
                prefix="₹"
                formatter={value => formatDecimal(value).toLocaleString('en-IN')}
                valueStyle={styles.statValue}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card style={styles.statCard}>
              <Statistic
                title={<Text strong>Completion Rate</Text>}
                value={metrics.completionRate}
                suffix="%"
                formatter={value => formatDecimal(value)}
                valueStyle={styles.statValue}
              />
              <Text type="danger">{formatDecimal(metrics.cancellationRate)}% cancelled</Text>
            </Card>
          </Col>
        </Row>



        {/* Recent Orders */}
        <Card title="Recent Orders" style={styles.sectionCard}>
          <List
            dataSource={orders.slice(0, 5)}
            renderItem={(order) => (
              <List.Item
                extra={
                  <Tag color={getStatusColor(order.status)}>
                    {order.status.toUpperCase()}
                  </Tag>
                }
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text>#{order.id}</Text>
                      <Text>{formatCurrency(order.total)}</Text>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text>Table: {order.tableNumber}</Text>
                      <Text>{new Date(order.timestamp).toLocaleString()}</Text>
                      <Text>{order.items?.length || 0} items</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        {/* Menu Performance */}
        <Card title="Top Selling Items" style={styles.sectionCard}>
          {renderTopSellingItems()}
        </Card>
      </div>
    );
  };

  const renderTopSellingItems = () => {
    const itemSales = {};
    orders.forEach(order => {
      if (order.status === 'completed') {
        order.items?.forEach(item => {
          if (!itemSales[item.id]) {
            itemSales[item.id] = {
              name: item.name,
              quantity: 0,
              revenue: 0
            };
          }
          itemSales[item.id].quantity += item.quantity;
          itemSales[item.id].revenue += item.price * item.quantity;
        });
      }
    });

    const topItems = Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(item => ({
        ...item,
        revenue: Number(item.revenue.toFixed(2))  // Format revenue to 2 decimal places
      }));

    return (
      <List
        dataSource={topItems}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar style={styles.rankAvatar}>
                  {index + 1}
                </Avatar>
              }
              title={item.name}
              description={
                <Space direction="vertical" size="small">
                  <Text>Quantity Sold: {item.quantity}</Text>
                  <Text>Revenue: ₹{item.revenue.toFixed(2).toLocaleString('en-IN')}</Text>
                </Space>
              }
            />
            <Progress 
              percent={Number((item.quantity / topItems[0].quantity * 100).toFixed(2))} 
              strokeColor="#ff4d4f"
            />
          </List.Item>
        )}
      />
    );
  };

  const tabItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Overview'
    },
    {
      key: '2',
      icon: <BarChartOutlined />,
      label: 'Sales'
    },
    {
      key: '3',
      icon: <AppstoreOutlined />,
      label: 'Menu'
    },
    {
      key: '4',
      icon: <OrderedListOutlined />,
      label: 'Orders'
    },
    {
      key: '5',
      icon: <BarsOutlined />,
      label: 'Tables'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case '1': return renderOverviewTab();
      case '2': return <SalesAnalysis orders={orders} />;
      case '3': return <MenuInsights menuItems={menuItems} orders={orders} categories={categories} />;
      case '4': return <OrderAnalytics orders={orders} />;
      case '5': return <TableAnalytics orders={orders} />;
      default: return null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mobileTabBar}>
        {tabItems.map(item => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            style={{
              ...styles.tabButton,
              ...(activeTab === item.key ? styles.activeTabButton : {})
            }}
          >
            <span style={styles.tabIcon}>{item.icon}</span>
            <span style={styles.tabLabel}>{item.label}</span>
          </button>
        ))}
      </div>
      <div style={styles.contentWrapper}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export {
  OrderAnalytics,
  TableAnalytics,
  getStatusColor,
  getStatusCardStyle,
  formatCurrency
};

export default RestaurantDashboard;

