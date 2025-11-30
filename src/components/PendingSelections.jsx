import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Typography, message, Spin, Empty, Badge } from 'antd';
import {
  ClockCircleOutlined,
  TableOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import FoodLoader from './FoodLoader';

const { Title, Text } = Typography;

const PendingSelections = () => {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { orgId } = useAuth();

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }

    fetchSelections();

    // Poll for new selections every 10 seconds
    const pollInterval = setInterval(() => {
      fetchSelections();
    }, 10000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [orgId]);

  const fetchSelections = async () => {
    try {
      if (!orgId) return;
      
      const data = await api.getPendingSelections(orgId, { status: 'pending' });
      setSelections(data || []);
    } catch (error) {
      console.error('Failed to fetch pending selections:', error);
      message.error('Failed to fetch pending selections');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <FoodLoader />
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Pending Selections
        </Title>
        <Badge count={selections.length} showZero>
          <Tag color="orange" icon={<ClockCircleOutlined />}>
            Waiting for Confirmation
          </Tag>
        </Badge>
      </div>

      {selections.length === 0 ? (
        <Empty
          description="No pending selections"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
          dataSource={selections}
          renderItem={(selection) => (
            <List.Item>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TableOutlined />
                    <span>Table {selection.tableNumber}</span>
                  </div>
                }
                extra={
                  <Tag color="orange">Pending</Tag>
                }
                style={{ width: '100%' }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <Text type="secondary">
                    <UserOutlined /> {selection.customerName || selection.customerId}
                  </Text>
                </div>

                <List
                  size="small"
                  dataSource={selection.items}
                  renderItem={(item) => (
                    <List.Item>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <div>
                          <Text strong>{item.name}</Text>
                          <Text type="secondary" style={{ display: 'block', fontSize: '0.85rem' }}>
                            Qty: {item.quantity}
                          </Text>
                          {item.customizations && item.customizations.length > 0 && (
                            <Text type="secondary" style={{ display: 'block', fontSize: '0.75rem' }}>
                              {item.customizations.map(c => c.option).join(', ')}
                            </Text>
                          )}
                        </div>
                        <Text strong>₹{item.subtotal.toFixed(2)}</Text>
                      </div>
                    </List.Item>
                  )}
                />

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <Text strong>Subtotal:</Text>
                    <Text strong>₹{selection.subtotal.toFixed(2)}</Text>
                  </div>
                  {selection.notes && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                        <strong>Notes:</strong> {selection.notes}
                      </Text>
                    </div>
                  )}
                  <div style={{ marginTop: '0.5rem' }}>
                    <Text type="secondary" style={{ fontSize: '0.75rem' }}>
                      {new Date(selection.createdAt).toLocaleString()}
                    </Text>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default PendingSelections;

