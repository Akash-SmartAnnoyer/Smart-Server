import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, message, Switch, Typography, Popconfirm } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, PercentageOutlined, TagOutlined } from '@ant-design/icons';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import { db } from '../pages/fireBaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

const { Option } = Select;
const { Text } = Typography;

const ChargesManagement = () => {
  const [form] = Form.useForm();
  const [charges, setCharges] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [restaurantDocId, setRestaurantDocId] = useState(null);
  const orgId = localStorage.getItem('orgId');

  useEffect(() => {
    fetchRestaurantAndCharges();
  }, []);

  const fetchRestaurantAndCharges = async () => {
    try {
      // First, get the restaurant document ID
      const restaurantsRef = collection(db, 'restaurants');
      const q = query(restaurantsRef, where('orgId', '==', orgId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const restaurantDoc = querySnapshot.docs[0];
        setRestaurantDocId(restaurantDoc.id);

        // Then fetch charges
        const chargesRef = collection(db, 'restaurants', restaurantDoc.id, 'charges');
        const chargesSnapshot = await getDocs(chargesRef);
        
        const chargesArray = chargesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCharges(chargesArray);
      }
    } catch (error) {
      console.error('Error fetching charges:', error);
      message.error('Failed to fetch charges');
    }
  };

  const onFinish = async (values) => {
    try {
      const chargeData = {
        name: values.name,
        type: values.type,
        value: parseFloat(values.value),
        description: values.description || '',
        isEnabled: true
      };

      if (editingId) {
        // Update existing charge
        const chargeRef = doc(db, 'restaurants', restaurantDocId, 'charges', editingId);
        await updateDoc(chargeRef, chargeData);
        message.success('Charge updated successfully');
      } else {
        // Add new charge
        const chargesRef = collection(db, 'restaurants', restaurantDocId, 'charges');
        await addDoc(chargesRef, chargeData);
        message.success('Charge added successfully');
      }

      form.resetFields();
      setEditingId(null);
      fetchRestaurantAndCharges();
    } catch (error) {
      console.error('Error saving charge:', error);
      message.error('Failed to save charge');
    }
  };

  const handleDelete = async (id) => {
    try {
      const chargeRef = doc(db, 'restaurants', restaurantDocId, 'charges', id);
      await deleteDoc(chargeRef);
      message.success('Charge deleted successfully');
      fetchRestaurantAndCharges();
    } catch (error) {
      console.error('Error deleting charge:', error);
      message.error('Failed to delete charge');
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      name: record.name,
      type: record.type,
      value: record.value.toString(), // Convert to string for form input
      description: record.description
    });
    setEditingId(record.id);
  };

  const handleToggleCharge = async (record, enabled) => {
    try {
      const chargeRef = doc(db, 'restaurants', restaurantDocId, 'charges', record.id);
      await updateDoc(chargeRef, { isEnabled: enabled });
      message.success(`${record.name} ${enabled ? 'enabled' : 'disabled'}`);
      fetchRestaurantAndCharges();
    } catch (error) {
      console.error('Error toggling charge:', error);
      message.error('Failed to update charge status');
    }
  };

  return (
    <div style={{ 
      padding: '0px', 
      marginTop: '60px',
      maxWidth: '100%',
      margin: '60px auto 0',
      background: '#fff',
      paddingBottom: '80px'
    }}>
      <Card 
        title={
          <div style={{ 
            fontSize: '20px', 
            fontWeight: 'bold',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <TagOutlined style={{ color: '#fff' }} />
            Charges
          </div>
        }
        extra={null}
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          margin: '0 auto',
          border: 'none',
          background: '#ff4d4f'
        }}
        headStyle={{
          background: '#ff4d4f',
          borderBottom: 'none'
        }}
        bodyStyle={{
          padding: '8px',
          background: '#fff'
        }}
      >
        {/* Add New Charge Form */}
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          style={{
            background: '#fff',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please enter charge name' }]}
          >
            <Input 
              placeholder="Charge Name (e.g., GST)"
              style={{ 
                borderRadius: '8px',
                height: '40px'
              }}
              prefix={<TagOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Form.Item
              name="type"
              style={{ flex: 1 }}
              rules={[{ required: true }]}
            >
              <Select 
                placeholder="Type"
                style={{ width: '100%' }}
              >
                <Option value="percentage">Percentage</Option>
                <Option value="fixed">Fixed</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="value"
              style={{ flex: 1 }}
              rules={[{ required: true }]}
            >
              <Input 
                type="number" 
                step="0.01" 
                placeholder="Value"
                style={{ borderRadius: '8px' }}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            style={{ marginBottom: '12px' }}
          >
            <Input.TextArea 
              placeholder="Description (optional)"
              style={{ borderRadius: '8px' }}
              rows={2}
            />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit"
            icon={<PlusOutlined />}
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '8px',
              background: '#ff4d4f',
              fontWeight: '500',
              border: 'none'
            }}
          >
            {editingId ? 'Update Charge' : 'Add Charge'}
          </Button>
        </Form>

        {/* Charges List */}
        <div style={{ 
          marginTop: '16px',
          marginBottom: '70px'
        }}>
          {charges.map(charge => (
            <Card
              key={charge.id}
              style={{ 
                marginBottom: '12px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: '1px solid #f0f0f0'
              }}
              bodyStyle={{ 
                padding: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    {charge.type === 'percentage' ? 
                      <PercentageOutlined style={{ color: '#ff4d4f' }} /> : 
                      <RiMoneyDollarCircleLine style={{ color: '#ff4d4f', fontSize: '16px' }} />
                    }
                    <Text strong>{charge.name}</Text>
                  </div>
                  {charge.description && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {charge.description}
                    </Text>
                  )}
                </div>

                <div style={{ 
                  background: charge.type === 'percentage' ? '#fff1f0' : '#fff1f0',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  marginRight: '12px'
                }}>
                  <Text style={{ 
                    color: '#ff4d4f',
                    fontWeight: 'bold'
                  }}>
                    {charge.type === 'percentage' ? `${charge.value}%` : `₹${charge.value}`}
                  </Text>
                </div>

                <Switch
                  checked={charge.isEnabled}
                  onChange={(checked) => handleToggleCharge(charge, checked)}
                  size="small"
                  style={{ 
                    backgroundColor: charge.isEnabled ? '#ff4d4f' : '#f5f5f5'
                  }}
                />
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '12px',
                borderTop: '1px solid #f0f0f0',
                paddingTop: '12px'
              }}>
                <Button 
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(charge)}
                  size="small"
                  style={{
                    color: '#ff4d4f'
                  }}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete this charge?"
                  onConfirm={() => handleDelete(charge.id)}
                >
                  <Button 
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  >
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <style jsx>{`
        .ant-btn-primary:hover {
          background: #ff7875 !important;
        }
        .ant-switch-checked {
          background-color: #ff4d4f !important
        }
      `}</style>
    </div>
  );
};

export default ChargesManagement; 