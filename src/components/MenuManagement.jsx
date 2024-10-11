import React, { useState, useEffect } from 'react';
import { Layout, Menu, Form, Input, Button, Select, Table, Modal, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Header, Content } = Layout;
const { Option } = Select;
const { Title } = Typography;

const API_URL = 'https://db-for-smart-serve-menu-default-rtdb.firebaseio.com';

// Styled Components
const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: #ffffff;
`;

const StyledHeader = styled(Header)`
  background: #ff0000;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(255, 0, 0, 0.15);
  overflow: hidden; // Add this to prevent overflow issues
`;


// const StyledHeader = styled(Header)`
//   background: #ff0000;
//   padding: 0 20px;
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   box-shadow: 0 2px 8px rgba(255, 0, 0, 0.15);
// `;

const StyledContent = styled(Content)`
  padding: 24px;
  background: #ffffff;
`;

const StyledMenu = styled(Menu)`
  background: transparent;
  border-bottom: none;
  .ant-menu-item {
    color: #ffffff;
    white-space: nowrap;  // Prevent text from wrapping
    overflow: hidden;     // Hide overflow text
    text-overflow: ellipsis;  // Show ellipsis for overflow text
    &:hover, &-selected {
      color: #ffffff;
      border-bottom: 2px solid #ffffff !important;
    }
  }
`;



// const StyledMenu = styled(Menu)`
//   background: transparent;
//   border-bottom: none;
//   .ant-menu-item {
//     color: #ffffff;
//     &:hover, &-selected {
//       color: #ffffff;
//       border-bottom: 2px solid #ffffff !important;
//     }
//   }
// `;

const StyledButton = styled(Button)`
  background: ${props => props.ghost ? 'transparent' : '#ff0000'};
  color: #ffffff;
  border: ${props => props.ghost ? '1px solid #ffffff' : 'none'};
  &:hover {
    background: #ffffff;
    color: #ff0000;
    border: 1px solid #ff0000;
  }
`;

const StyledTableContainer = styled.div`
  max-height: 400px;  // Adjust the height as needed
  overflow-y: auto;
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: #ff0000;
    color: #ffffff;
  }
  .ant-table-tbody > tr:hover > td {
    background: #fff0f0;
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-header {
    background: #ff0000;
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

const MenuManagement = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Get orgId from localStorage
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
      const [categoriesRes, subcategoriesRes, menuItemsRes] = await Promise.all([
        fetch(`${API_URL}/categories.json?orgId=${orgId}`),
        fetch(`${API_URL}/subcategories.json?orgId=${orgId}`),
        fetch(`${API_URL}/menu_items.json?orgId=${orgId}`)
      ]);
      const [categoriesData, subcategoriesData, menuItemsData] = await Promise.all([
        categoriesRes.json(),
        subcategoriesRes.json(),
        menuItemsRes.json()
      ]);
  
      // Convert objects to arrays
      const categoriesArray = categoriesData ? Object.entries(categoriesData).map(([id, data]) => ({id, ...data})) : [];
      const subcategoriesArray = subcategoriesData ? Object.entries(subcategoriesData).map(([id, data]) => ({id, ...data})) : [];
      const menuItemsArray = menuItemsData ? Object.entries(menuItemsData).map(([id, data]) => ({id, ...data})) : [];
  
      setCategories(categoriesArray);
      setSubcategories(subcategoriesArray);
      setMenuItems(menuItemsArray);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch data');
    }
    setLoading(false);
  };

  // const fetchData = async () => {
  //   setLoading(true);
  //   try {
  //     const [categoriesRes, subcategoriesRes, menuItemsRes] = await Promise.all([
  //       // fetch(`${API_URL}/categories.json?orderBy="orgId"&equalTo="${orgId}"`),
  //       // fetch(`${API_URL}/subcategories.json?orderBy="orgId"&equalTo="${orgId}"`),
  //       // fetch(`${API_URL}/menu_items.json?orderBy="orgId"&equalTo="${orgId}"`)
  //       fetch(`${API_URL}/categories.json?orgId=${orgId}`),
  //       fetch(`${API_URL}/subcategories.json?orgId=${orgId}`),
  //       fetch(`${API_URL}/menu_items.json?orgId=${orgId}`)

  //     ]);
  //     const [categoriesData, subcategoriesData, menuItemsData] = await Promise.all([
  //       categoriesRes.json(),
  //       subcategoriesRes.json(),
  //       menuItemsRes.json()
  //     ]);
  
  //     // Firebase returns data as objects, convert them to arrays if necessary
  //     // const categoriesArray = categoriesData ? Object.values(categoriesData) : [];
  //     // const subcategoriesArray = subcategoriesData ? Object.values(subcategoriesData) : [];
  //     // const menuItemsArray = menuItemsData ? Object.values(menuItemsData) : [];
  
  //     // setCategories(categoriesArray);
  //     // setSubcategories(subcategoriesArray);
  //     // setMenuItems(menuItemsArray);
  //     setCategories(categoriesData);
  //     setSubcategories(subcategoriesData);
  //     setMenuItems(menuItemsData);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     message.error('Failed to fetch data');
  //   }
  //   setLoading(false);
  // };

  const handleCreate = async (values) => {
    const type = activeTab === '1' ? 'categories' : activeTab === '2' ? 'subcategories' : 'menu_items';
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
    const type = activeTab === '1' ? 'categories' : activeTab === '2' ? 'subcategories' : 'menu_items';
    try {
      if (!editingItem || !editingItem.id) {
        throw new Error('No item selected for update');
      }
  
      const response = await fetch(`${API_URL}/${type}/${editingItem.id}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, orgId: parseInt(orgId) })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update item');
      }
  
      const updatedData = await response.json();
      console.log('Update response:', updatedData);
  
      fetchData();
      setIsModalVisible(false);
      setEditingItem(null);
      form.resetFields();
      message.success('Item updated successfully');
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      message.error(`Failed to update item: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    const type = activeTab === '1' ? 'categories' : activeTab === '2' ? 'subcategories' : 'menu_items';
    try {
      const response = await fetch(`${API_URL}/${type}/${id}.json`, {
        method: 'DELETE'
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }
  
      console.log('Delete response:', await response.json());
  
      fetchData();
      message.success('Item deleted successfully');
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      message.error(`Failed to delete item: ${error.message}`);
    }
  };

  // const handleUpdate = async (values) => {
  //   const type = activeTab === '1' ? 'categories' : activeTab === '2' ? 'subcategories' : 'menu_items';
  //   try {
  //     const response = await fetch(`${API_URL}/${type}/${editingItem.id}.json`, {
  //       method: 'PATCH',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ ...values, orgId: parseInt(orgId) })
  //     });
  //     if (response.ok) {
  //       fetchData();
  //       setIsModalVisible(false);
  //       setEditingItem(null);
  //       form.resetFields();
  //       message.success('Item updated successfully');
  //     } else {
  //       throw new Error('Failed to update item');
  //     }
  //   } catch (error) {
  //     console.error(`Error updating ${type}:`, error);
  //     message.error('Failed to update item');
  //   }
  // };

// const handleDelete = async (id) => {
//   const type = activeTab === '1' ? 'categories' : activeTab === '2' ? 'subcategories' : 'menu_items';
  
//   Modal.confirm({
//     title: 'Are you sure you want to delete this item?',
//     content: 'This action cannot be undone.',
//     okText: 'Yes',
//     okType: 'danger',
//     cancelText: 'No',
//     onOk: async () => {
//       try {
//         const response = await fetch(`${API_URL}/${type}/${id}.json`, {
//           method: 'DELETE'
//         });
//         if (response.ok) {
//           fetchData();
//           message.success('Item deleted successfully');
//         } else {
//           const errorData = await response.json();
//           throw new Error(errorData.error || 'Failed to delete item');
//         }
//       } catch (error) {
//         console.error(`Error deleting ${type}:`, error);
//         message.error(`Failed to delete item: ${error.message}`);
//       }
//     },
//   });
// };

  // const handleUpdate = async (values) => {
  //   const type = activeTab === '1' ? 'categories' : activeTab === '2' ? 'subcategories' : 'menu_items';
  //   try {
  //     const response = await fetch(`${API_URL}/${type}/${editingItem.id}`, {
  //       method: 'PUT',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ ...values, orgId: parseInt(orgId) })
  //     });
  //     if (response.ok) {
  //       fetchData();
  //       setIsModalVisible(false);
  //       setEditingItem(null);
  //       form.resetFields();
  //       message.success('Item updated successfully');
  //     }
  //   } catch (error) {
  //     console.error(`Error updating ${type}:`, error);
  //     message.error('Failed to update item');
  //   }
  // };

  // const handleDelete = async (id) => {
  //   const type = activeTab === '1' ? 'categories' : activeTab === '2' ? 'subcategories' : 'menu_items';
  //   try {
  //     const response = await fetch(`${API_URL}/${type}/${id}`, {
  //       method: 'DELETE'
  //     });
  //     if (response.ok) {
  //       fetchData();
  //       message.success('Item deleted successfully');
  //     }
  //   } catch (error) {
  //     console.error(`Error deleting ${type}:`, error);
  //     message.error('Failed to delete item');
  //   }
  // };

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
    menuItems: [
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Description', dataIndex: 'description', key: 'description' },
      { title: 'Price', dataIndex: 'price', key: 'price' },
      { title: 'Category', dataIndex: 'categoryId', key: 'categoryId', render: (categoryId) => categories.find(c => c.id === categoryId)?.name },
      { title: 'Subcategory', dataIndex: 'subcategoryId', key: 'subcategoryId', render: (subcategoryId) => subcategories.find(s => s.id === subcategoryId)?.name },
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
  };

  const renderForm = () => {
    return (
      <Form form={form} onFinish={editingItem ? handleUpdate : handleCreate} layout="vertical">
        {activeTab === '1' && (
          <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        )}
        {activeTab === '2' && (
          <>
            <Form.Item name="name" label="Subcategory Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
              <Select>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>{category.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}
        {activeTab === '3' && (
          <>
            <Form.Item name="name" label="Menu Item Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="price" label="Price" rules={[{ required: true }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="image" label="Image URL" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
              <Select onChange={handleCategoryChange}>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>{category.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="subcategoryId" label="Subcategory" rules={[{ required: true }]}>
              <Select>
                {subcategories.filter(sub => sub.categoryId === selectedCategory).map(subcategory => (
                  <Option key={subcategory.id} value={subcategory.id}>{subcategory.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}
      </Form>
    );
  };

  const tabContent = {
    '1': (
      <StyledTableContainer>
        <StyledTable columns={columns.categories} dataSource={categories} loading={loading} rowKey="id" />
      </StyledTableContainer>
    ),
    '2': (
      <StyledTableContainer>
        <StyledTable columns={columns.subcategories} dataSource={subcategories} loading={loading} rowKey="id" />
      </StyledTableContainer>
    ),
    '3': (
      <StyledTableContainer>
        <StyledTable columns={columns.menuItems} dataSource={menuItems} loading={loading} rowKey="id" />
      </StyledTableContainer>
    ),
  };

  return (
    <StyledLayout style={{marginTop: "100px"}}>
      <StyledHeader>
        <Title level={3} style={{ color: '#ffffff', margin: 0 }}>Menu</Title>
        <StyledMenu mode="horizontal" defaultSelectedKeys={[activeTab]}>
          <Menu.Item key="1" onClick={() => setActiveTab('1')}>Categories</Menu.Item>
          <Menu.Item key="2" onClick={() => setActiveTab('2')}>Subcategories</Menu.Item>
          <Menu.Item key="3" onClick={() => setActiveTab('3')}>Menu Items</Menu.Item>
        </StyledMenu>
      </StyledHeader>
      <StyledContent>
        {tabContent[activeTab]}
        <StyledButton 
          icon={<PlusOutlined />} 
          onClick={() => {
            setEditingItem(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
          style={{ marginTop: 16 }}
        >
          Add New
        </StyledButton>
        <StyledModal
          title={editingItem ? "Edit Item" : "Add New Item"}
          visible={isModalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingItem(null);
            form.resetFields();
          }}
          footer={[
            <StyledButton key="back" ghost onClick={() => setIsModalVisible(false)}>
              Cancel
            </StyledButton>,
            <StyledButton key="submit" onClick={() => form.submit()}>
              {editingItem ? 'Update' : 'Create'}
            </StyledButton>,
          ]}
        >
          {renderForm()}
        </StyledModal>
      </StyledContent>
    </StyledLayout>
  );
};

export default MenuManagement;