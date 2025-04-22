import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, Upload, message, Typography, Card } from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Header, Content } = Layout;
const { Title } = Typography;

const API_URL = 'https://smartserver-json-server.onrender.com';

// Styled Components
const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: #ffffff;
`;

const StyledHeader = styled(Header)`
  background: #ff4d4f;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.15);
`;

const StyledContent = styled(Content)`
  padding: 24px;
  background: #ffffff;
`;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StyledButton = styled(Button)`
  background: #ff4d4f;
  color: #ffffff;
  border: none;
  &:hover {
    background: #ffffff;
    color: #ff4d4f;
    border: 1px solid #ff4d4f;
  }
`;

const StoreManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [storeDetails, setStoreDetails] = useState(null);

  const orgId = localStorage.getItem('orgId');

  useEffect(() => {
    fetchStoreDetails();
  }, []);

  const fetchStoreDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/stores?orgId=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        const store = data[0];
        if (store) {
          setStoreDetails(store);
          form.setFieldsValue(store);
        }
      }
    } catch (error) {
      console.error('Error fetching store details:', error);
      message.error('Failed to fetch store details');
    }
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/stores/${storeDetails?.id || ''}`, {
        method: storeDetails ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, orgId: parseInt(orgId) })
      });
      if (response.ok) {
        message.success('Store details saved successfully');
        fetchStoreDetails();
      }
    } catch (error) {
      console.error('Error saving store details:', error);
      message.error('Failed to save store details');
    }
    setLoading(false);
  };

  return (
    <StyledLayout>
      <StyledHeader>
        <Title level={3} style={{ color: '#ffffff', margin: 0 }}>Store Management</Title>
      </StyledHeader>
      <StyledContent>
        <StyledCard title="Store Information">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Form.Item
              name="name"
              label="Store Name"
              rules={[{ required: true, message: 'Please enter store name' }]}
            >
              <Input placeholder="Enter store name" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Store Description"
              rules={[{ required: true, message: 'Please enter store description' }]}
            >
              <Input.TextArea placeholder="Enter store description" />
            </Form.Item>
            <Form.Item
              name="address"
              label="Store Address"
              rules={[{ required: true, message: 'Please enter store address' }]}
            >
              <Input.TextArea placeholder="Enter store address" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Contact Number"
              rules={[{ required: true, message: 'Please enter contact number' }]}
            >
              <Input placeholder="Enter contact number" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>
            <Form.Item
              name="logo"
              label="Store Logo"
              rules={[{ required: true, message: 'Please upload store logo' }]}
            >
              <Upload
                name="logo"
                listType="picture"
                maxCount={1}
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>Upload Logo</Button>
              </Upload>
            </Form.Item>
            <Form.Item>
              <StyledButton
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Save Changes
              </StyledButton>
            </Form.Item>
          </Form>
        </StyledCard>
      </StyledContent>
    </StyledLayout>
  );
};

export default StoreManagement; 