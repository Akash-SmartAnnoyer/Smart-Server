import React, { useState, useEffect } from 'react';
import { Layout, Menu, Form, Input, Button, Select, Table, Modal, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Header, Content } = Layout;
const { Option } = Select;
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
  overflow: hidden;
`;

const StyledContent = styled(Content)`
  padding: 24px;
  background: #ffffff;
`;

const StyledMenu = styled(Menu)`
  background: transparent;
  border-bottom: none;
  .ant-menu-item {
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &:hover, &-selected {
      color: #ffffff;
      border-bottom: 2px solid #ffffff !important;
    }
  }
`;

const StyledButton = styled(Button)`
  background: ${props => props.ghost ? 'transparent' : '#ff4d4f'};
  color: #ffffff;
  border: ${props => props.ghost ? '1px solid #ffffff' : 'none'};
  &:hover {
    background: #ffffff;
    color: #ff4d4f;
    border: 1px solid #ff4d4f;
  }
`;

const StyledTableContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: #ff4d4f;
    color: #ffffff;
  }
  .ant-table-tbody > tr:hover > td {
    background: #fff0f0;
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-header {
    background: #ff4d4f;
    border-bottom: none;
  }
  .ant-modal-title {
    color: #ffffff;
  }
  .ant-modal-close-x {
    color: #ffffff;
  }
  .ant-modal-footer {
    border-top: none;
  }
`;

const CollectionManagement = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [clothingItems, setClothingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const orgId = localStorage.getItem('orgId');

  useEffect(() => {
    fetchData();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    form.setFieldsValue({ subcategoryId: null });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, subcategoriesRes, clothingItemsRes] = await Promise.all([
        fetch(`${API_URL}/categories?orgId=${orgId}`),
        fetch(`${API_URL}/subcategories?orgId=${orgId}`),
        fetch(`${API_URL}/clothing_items?orgId=${orgId}`)
      ]);
      const [categoriesData, subcategoriesData, clothingItemsData] = await Promise.all([
        categoriesRes.json(),
        subcategoriesRes.json(),
        clothingItemsRes.json()
      ]);
      setCategories(categoriesData);
      setSubcategories(subcategoriesData);
      setClothingItems(clothingItemsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch data');
    }
    setLoading(false);
  };

  const handleCreate = async (values) => {
    const type = activeTab === '1' ? 'categories' : activeTab === '2' ? 'subcategories' : 'clothing_items';
    try {
      const response = await fetch(`${API_URL}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, orgId: parseInt(orgId) })
      });
      if (response.ok) {
        fetchData();
        setIsModalVisible(false);
        form.resetFields();
        message.success('Item created successfully');
      }
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      message.error('Failed to create item');
    }
  };

  const handleUpdate = async (values) => {
    const type = activeTab === '1' ? 'categories' : activeTab === '2' ? 'subcategories' : 'clothing_items';
    try {
      const response = await fetch(`${API_URL}/${type}/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, orgId: parseInt(orgId) })
      });
      if (response.ok) {
        fetchData();
        setIsModalVisible(false);
        setEditingItem(null);
        form.resetFields();
        message.success('Item updated successfully');
      }
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      message.error('Failed to update item');
    }
  };

  const handleDelete = async (id) => {
    const type = activeTab === '1' ? 'categories' : activeTab === '2' ? 'subcategories' : 'clothing_items';
    try {
      const response = await fetch(`${API_URL}/${type}/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchData();
        message.success('Item deleted successfully');
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      message.error('Failed to delete item');
    }
  };

  const columns = {
    categories: [
      { title: 'Name', dataIndex: 'name', key: 'name' },
      {
        title: 'Actions',
        key: 'actions',
        width: 150,
        render: (_, record) => (
          <>
            <Button icon={<EditOutlined />} onClick={() => {
              setEditingItem(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }} />
            <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} style={{ marginLeft: 8 }} />
          </>
        ),
      },
    ],
    subcategories: [
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Category', dataIndex: 'categoryId', key: 'categoryId', render: (categoryId) => categories.find(c => c.id === categoryId)?.name },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <>
            <Button icon={<EditOutlined />} onClick={() => {
              setEditingItem(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }} />
            <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} style={{ marginLeft: 8 }} />
          </>
        ),
      },
    ],
    clothing_items: [
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Description', dataIndex: 'description', key: 'description' },
      { title: 'Price', dataIndex: 'price', key: 'price' },
      { title: 'Category', dataIndex: 'categoryId', key: 'categoryId', render: (categoryId) => categories.find(c => c.id === categoryId)?.name },
      { title: 'Subcategory', dataIndex: 'subcategoryId', key: 'subcategoryId', render: (subcategoryId) => subcategories.find(s => s.id === subcategoryId)?.name },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <>
            <Button icon={<EditOutlined />} onClick={() => {
              setEditingItem(record);
              form.setFieldsValue(record);
              setIsModalVisible(true);
            }} />
            <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} style={{ marginLeft: 8 }} />
          </>
        ),
      },
    ],
  };

  const renderForm = () => {
    const type = activeTab === '1' ? 'categories' : activeTab === '2' ? 'subcategories' : 'clothing_items';
    return (
      <Form form={form} onFinish={editingItem ? handleUpdate : handleCreate}>
        {type === 'categories' && (
          <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
            <Input placeholder="Enter category name" />
          </Form.Item>
        )}
        {type === 'subcategories' && (
          <>
            <Form.Item name="name" label="Subcategory Name" rules={[{ required: true }]}>
              <Input placeholder="Enter subcategory name" />
            </Form.Item>
            <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
              <Select placeholder="Select category" onChange={handleCategoryChange}>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>{category.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}
        {type === 'clothing_items' && (
          <>
            <Form.Item name="name" label="Item Name" rules={[{ required: true }]}>
              <Input placeholder="Enter item name" />
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <Input.TextArea placeholder="Enter item description" />
            </Form.Item>
            <Form.Item name="price" label="Price" rules={[{ required: true }]}>
              <Input type="number" placeholder="Enter price" />
            </Form.Item>
            <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
              <Select placeholder="Select category" onChange={handleCategoryChange}>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>{category.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="subcategoryId" label="Subcategory" rules={[{ required: true }]}>
              <Select placeholder="Select subcategory">
                {subcategories
                  .filter(subcategory => !selectedCategory || subcategory.categoryId === selectedCategory)
                  .map(subcategory => (
                    <Option key={subcategory.id} value={subcategory.id}>{subcategory.name}</Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item name="image" label="Image URL" rules={[{ required: true }]}>
              <Input placeholder="Enter image URL" />
            </Form.Item>
          </>
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </Form.Item>
      </Form>
    );
  };

  return (
    <StyledLayout>
      <StyledHeader>
        <Title level={3} style={{ color: '#ffffff', margin: 0 }}>Collection Management</Title>
        <StyledButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Add New
        </StyledButton>
      </StyledHeader>
      <StyledContent>
        <StyledMenu
          mode="horizontal"
          selectedKeys={[activeTab]}
          onClick={({ key }) => setActiveTab(key)}
        >
          <Menu.Item key="1">Categories</Menu.Item>
          <Menu.Item key="2">Subcategories</Menu.Item>
          <Menu.Item key="3">Clothing Items</Menu.Item>
        </StyledMenu>
        <StyledTableContainer>
          <StyledTable
            columns={columns[activeTab === '1' ? 'categories' : activeTab === '2' ? 'subcategories' : 'clothing_items']}
            dataSource={activeTab === '1' ? categories : activeTab === '2' ? subcategories : clothingItems}
            loading={loading}
            rowKey="id"
          />
        </StyledTableContainer>
        <StyledModal
          title={editingItem ? 'Edit Item' : 'Add New Item'}
          visible={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingItem(null);
            form.resetFields();
          }}
          footer={null}
        >
          {renderForm()}
        </StyledModal>
      </StyledContent>
    </StyledLayout>
  );
};

export default CollectionManagement; 