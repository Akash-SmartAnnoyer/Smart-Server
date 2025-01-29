import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import {
  Layout,
  Menu,
  Form,
  Input,
  Button,
  Select,
  Modal,
  message,
  Typography,
  Switch,
  Badge,
  Card,
  Tooltip,
  Space,
  Row,
  Col,
  Empty,
  Radio,
  Drawer,
  Upload,
  Dropdown,
  Divider,
  Popover,
  Popconfirm,
  Tag,
  Slider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  TagsOutlined,
  TagOutlined,
  MenuOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  RestOutlined,
  ShopOutlined,
  CheckOutlined
} from '@ant-design/icons';
import VirtualList from 'rc-virtual-list';
import { motion, AnimatePresence } from 'framer-motion';
import { IoFilterSharp, IoSearch } from 'react-icons/io5';
import { RiPriceTag3Line } from 'react-icons/ri';
import { MdOutlineSort } from 'react-icons/md';
import { ScrollMenu } from 'react-horizontal-scrolling-menu';
import FoodLoader from './FoodLoader';
import StylishButton from './common/StylishButton';
import { useMenu } from '../contexts/MenuProvider';
import { db } from '../pages/fireBaseConfig';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';

const { Content, Sider } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

// Theme colors
const theme = {
  primary: '#E53935', // Deep red
  secondary: '#FFCDD2', // Light red
  accent: '#B71C1C', // Dark red
  background: '#FFF8F8', // Off-white with red tint
  text: '#2C2C2C', // Dark gray
  cardBg: '#FFFFFF' // White
};

const ModernMenuManagement = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu_items');
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [availabilityDrawer, setAvailabilityDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [siderCollapsed, setSiderCollapsed] = useState(window.innerWidth <= 768);
  const [drawerVisible, setDrawerVisible] = useState(false);
    const [imageInputType, setImageInputType] = useState('url');
    const [showFilters, setShowFilters] = useState(false); // State to manage filter visibility
  
  // Add new state variables for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Add these state variables to track loading states
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);

  // Add constant for footer height
  const FOOTER_HEIGHT = 64; // Adjust this value to match your footer height

  // Filter and sort functions
  const filterAndSortItems = (items) => {
    let filteredItems = [...items];

    // Search filter
    if (searchTerm) {
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filteredItems = filteredItems.filter(item =>
        selectedCategories.includes(item.categoryId)
      );
    }

    // Subcategory filter
    if (selectedSubcategories.length > 0) {
      filteredItems = filteredItems.filter(item =>
        selectedSubcategories.includes(item.subcategoryId)
      );
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      filteredItems = filteredItems.filter(item =>
        availabilityFilter === 'available' ? item.isAvailable : !item.isAvailable
      );
    }

    // Price range filter
    filteredItems = filteredItems.filter(item =>
      item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    // Sorting
    filteredItems.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'category':
          comparison = categories.find(c => c.id === a.categoryId)?.name.localeCompare(
            categories.find(c => c.id === b.categoryId)?.name
          ) || 0;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filteredItems;
  };

  // Memoize filtered and sorted items
  const filteredAndSortedItems = useMemo(() => {
    return filterAndSortItems(menuItems);
  }, [
    menuItems,
    searchTerm,
    selectedCategories,
    selectedSubcategories,
    availabilityFilter,
    priceRange,
    sortBy,
    sortOrder,
  ]);

  const MobileHeader = memo(() => (
    <div 
      style={{
        position: 'fixed',
        top: -15,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: theme.primary,
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px',
        marginTop: "72px",
        transform: 'translateZ(0)'
      }}
    >
      <Space align="center">
        <Button
          type="text"
          className="menu-button"
          icon={<MenuOutlined style={{ fontSize: '24px', color: 'white' }} />}
          onClick={() => setDrawerVisible(true)}
          style={{ 
            border: 'none', 
            padding: '8px',
            background: 'transparent'
          }}
        />
        <Text strong style={{ color: 'white', fontSize: '20px', margin: 0 }}>
          {activeTab === 'menu_items' ? 'Menu Items' : 
           activeTab === 'categories' ? 'Categories' : 'Subcategories'}
        </Text>
      </Space>
      {activeTab === 'menu_items' && (
        <Space size="middle">
          <Button
            type="text"
            className="header-button"
            icon={<SearchOutlined style={{ fontSize: '24px', color: 'white' }} />}
            onClick={() => setShowFilters(!showFilters)}
            style={{ 
              border: 'none', 
              padding: '8px',
              background: 'transparent'
            }}
          />
          {/* <Button
            type="text"
            className="header-button"
            icon={<FilterOutlined style={{ fontSize: '24px', color: 'white' }} />}
            onClick={() => setShowFilters(!showFilters)}
            style={{ 
              border: 'none', 
              padding: '8px',
              background: 'transparent'
            }}
          /> */}
        </Space>
      )}
    </div>
  ));
   // Search and Filter component
  const SearchAndFilters = memo(() => {
    const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
    const [searchInput, setSearchInput] = useState('');

    const handleSearch = () => {
      setSearchTerm(searchInput);
    };

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="search-container" style={{
            position: 'sticky',
            top: 72,
            zIndex: 100,
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            margin: '8px 0'
          }}>
            <Input.Search
              prefix={<IoSearch style={{ fontSize: '20px', color: theme.primary }} />}
              suffix={
                <Badge count={
                  (selectedCategories.length > 0 ? 1 : 0) +
                  (availabilityFilter !== 'all' ? 1 : 0) +
                  (priceRange[0] !== 0 || priceRange[1] !== 10000 ? 1 : 0)
                }>
                  <Button
                    type="text"
                    icon={<IoFilterSharp style={{ fontSize: '20px' }} />}
                    onClick={() => setFilterDrawerVisible(true)}
                  />
                </Badge>
              }
              placeholder="Search menu items..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onSearch={handleSearch}
              enterButton
              style={{
                borderRadius: '8px',
                backgroundColor: '#f5f5f5',
                border: 'none',
                top: '40px',
                padding: '8px 12px',
              }}
            />
          </div>

          <ModernFilterDrawer 
            visible={filterDrawerVisible}
            onClose={() => setFilterDrawerVisible(false)}
          />
        </motion.div>
      </AnimatePresence>
    );
  });
   // Get orgId from localStorage
  const orgId = localStorage.getItem('orgId');

  const { 
    categories: cachedCategories, 
    subcategories: cachedSubcategories, 
    menuItems: cachedMenuItems,
    loading: menuLoading,
    dataInitialized,
    refreshData
  } = useMenu();

  // Initialize state with cached data
  useEffect(() => {
    if (dataInitialized) {
      setCategories(cachedCategories.map(item => ({
        ...item,
        firebaseId: item.id // Ensure firebaseId is set correctly
      })));
      setSubcategories(cachedSubcategories.map(item => ({
        ...item,
        firebaseId: item.id // Ensure firebaseId is set correctly
      })));
      setMenuItems(cachedMenuItems.map(item => ({
        ...item,
        firebaseId: item.id // Ensure firebaseId is set correctly
      })));
      setLoading(false);
    }
  }, [dataInitialized, cachedCategories, cachedSubcategories, cachedMenuItems]);

  // Update loading check
  if (menuLoading.overall || !dataInitialized) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1000,
      }}>
        <FoodLoader />
        <div style={{
          marginTop: '1rem',
          color: '#FF0000',
          fontWeight: 'bold',
          fontSize: '1.2rem',
        }}>
          Loading menu items...
        </div>
      </div>
    );
  }

// Also update the handleCreate function to properly handle both image types
// Update the renderFormItems function to include image upload for categories and subcategories
const renderFormItems = () => {
  const handleImageInputTypeChange = (e) => {
    setImageInputType(e.target.value);
    // Clear the other type of image input when switching
    if (e.target.value === 'url') {
      form.setFieldsValue({ imageUpload: undefined });
    } else {
      form.setFieldsValue({ imageUrl: undefined });
    }
  };

  // Common image upload form items
  const imageUploadFields = (
    <>
      <Form.Item label="Image Input Type">
        <Radio.Group onChange={handleImageInputTypeChange} value={imageInputType}>
          <Radio value="url">Provide URL</Radio>
          <Radio value="upload">Upload from System</Radio>
        </Radio.Group>
      </Form.Item>
      
      {imageInputType === 'url' ? (
        <Form.Item
          name="imageUrl"
          label="Image URL"
          rules={[{ required: !editingItem?.image, message: 'Please provide the image URL!' }]}
        >
          <Input />
        </Form.Item>
      ) : (
        <Form.Item
          name="imageUpload"
          label="Upload Image"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          rules={[{ required: !editingItem?.image, message: 'Please upload the image!' }]}
        >
          <Upload
            name="image"
            listType="picture-card"
            beforeUpload={() => false}
            maxCount={1}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Form.Item>
      )}
    </>
  );

  switch (activeTab) {
    case 'categories':
      return (
        <>
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please input the category name!' }]}
          >
            <Input />
          </Form.Item>
          {imageUploadFields}
        </>
      );
    case 'subcategories':
      return (
        <>
          <Form.Item
            name="name"
            label="Subcategory Name"
            rules={[{ required: true, message: 'Please input the subcategory name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: 'Please select a category!' }]}
          >
            <Select onChange={handleCategoryChange}>
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {imageUploadFields}
        </>
      );
    case 'menu_items':
      return (
        <>
          <Form.Item
            name="name"
            label="Item Name"
            rules={[{ required: true, message: 'Please input the item name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please input the price!' }]}
          >
            <Input type="number" prefix="₹" />
          </Form.Item>
          <Form.Item
            name="foodType"
            label="Food Type"
            rules={[{ required: true, message: 'Please select the food type!' }]}
          >
            <Select>
              <Select.Option value="veg">Veg</Select.Option>
              <Select.Option value="nonveg">Non-Veg</Select.Option>
              <Select.Option value="neutral">Neutral</Select.Option>
            </Select>
          </Form.Item>
          {imageUploadFields}
          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: 'Please select a category!' }]}
          >
            <Select onChange={handleCategoryChange}>
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="subcategoryId"
            label="Subcategory"
            rules={[{ required: true, message: 'Please select a subcategory!' }]}
          >
            <Select disabled={!selectedCategory}>
              {subcategories
                .filter((subcat) => subcat.categoryId === selectedCategory)
                .map((subcategory) => (
                  <Option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="isAvailable"
            label="Available"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </>
      );
    default:
      return null;
  }
};

// Update the ModernCategoryCard component to display images
const ModernCategoryCard = ({ item, type }) => (
  <Card
    hoverable
    className="category-card"
    style={{
      marginBottom: '16px',
      borderRadius: '16px',
      backgroundColor: type === 'category' ? theme.secondary : theme.background,
      border: `1px solid ${theme.primary}20`
    }}
  >
    <div style={{ display: 'flex', gap: '16px' }}>
      <img
        src={getImageUrl(item.image)}
        alt={item.name}
        style={{
          width: '80px',
          height: '80px',
          objectFit: 'cover',
          borderRadius: '8px',
        }}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/80';
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <div>
              <Text strong style={{ fontSize: '18px', color: theme.text }}>
                {item.name}
              </Text>
              {type === 'subcategory' && (
                <Text type="secondary" style={{ fontSize: '14px', display: 'block' }}>
                  {categories.find((c) => c.id === item.categoryId)?.name}
                </Text>
              )}
            </div>
          </Space>
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                const itemToEdit = {
                  ...item,
                  id: item.id,
                  categoryId: item.categoryId
                };
                setEditingItem(itemToEdit);
                
                // Handle image data
                if (item.image) {
                  if (typeof item.image === 'string') {
                    setImageInputType('url');
                    form.setFieldsValue({
                      ...itemToEdit,
                      imageUrl: item.image
                    });
                  } else if (item.image.file && item.image.file.url) {
                    setImageInputType('upload');
                    form.setFieldsValue({
                      ...itemToEdit,
                      imageUpload: [{
                        uid: '-1',
                        name: item.image.file.name || 'image.jpg',
                        status: 'done',
                        url: item.image.file.url,
                        thumbUrl: item.image.file.url
                      }]
                    });
                  }
                } else {
                  form.setFieldsValue(itemToEdit);
                }
                
                if (type === 'subcategory') {
                  setSelectedCategory(item.categoryId);
                }
                setIsModalVisible(true);
              }}
            />
             <Popconfirm
      title="Are you sure you want to delete this item?"
      onConfirm={() => handleDelete(item.firebaseId)}
      okText="Yes"
      cancelText="No"
      placement="topRight"
    >
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
      />
    </Popconfirm>
          </Space>
        </div>
      </div>
    </div>
  </Card>
);

// Update handleCreate and handleUpdate functions to handle images for all types
const handleCreate = async values => {
  if (processingAction) return;
  setProcessingAction(true);

  const type = activeTab === 'categories'
    ? 'categories'
    : activeTab === 'subcategories'
    ? 'subcategories'
    : 'menu_items';
    
  try {
    // Validate required fields first
    if (!values.name || (type === 'menu_items' && !values.price)) {
      throw new Error('Required fields are missing');
    }

    // Handle image data for all types
    let imageData = null;
    try {
      if (imageInputType === 'url' && values.imageUrl) {
        // Validate URL
        new URL(values.imageUrl); // This will throw if URL is invalid
        imageData = values.imageUrl;
      } else if (imageInputType === 'upload' && values.imageUpload?.[0]) {
        if (!values.imageUpload[0].url && !values.imageUpload[0].thumbUrl) {
          throw new Error('Invalid image upload data');
        }
        imageData = {
          file: {
            url: values.imageUpload[0].url || values.imageUpload[0].thumbUrl,
            name: values.imageUpload[0].name || 'uploaded_image.jpg'
          }
        };
      }
    } catch (imageError) {
      console.warn('Image processing error:', imageError);
      // Don't fail the whole creation if image processing fails
      imageData = null;
    }

    // Sanitize and prepare data
    const dataToCreate = {
      ...values,
      name: values.name.trim(),
      description: values.description?.trim() || '',
      price: type === 'menu_items' ? Number(values.price) || 0 : undefined,
      image: imageData,
      orgId: parseInt(orgId) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAvailable: values.isAvailable ?? true
    };

    // Remove undefined and unnecessary fields
    Object.keys(dataToCreate).forEach(key => {
      if (dataToCreate[key] === undefined) {
        delete dataToCreate[key];
      }
    });
    delete dataToCreate.imageUrl;
    delete dataToCreate.imageUpload;

    // Add document to Firestore with retry logic
    let retries = 3;
    let docRef = null;
    
    while (retries > 0) {
      try {
        docRef = await addDoc(collection(db, type), dataToCreate);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }

    if (!docRef) {
      throw new Error('Failed to create document after retries');
    }
    
    // Update the document with its firebaseId
    const newItem = {
      ...dataToCreate,
      id: docRef.id,
      firebaseId: docRef.id
    };
    
    try {
      await updateDoc(docRef, {
        id: docRef.id,
        firebaseId: docRef.id
      });
    } catch (updateError) {
      console.warn('Failed to update document with IDs:', updateError);
      // Don't fail the operation if this update fails
    }

    // Update local state
    updateLocalState(type, 'add', newItem);
    
    // Refresh data from server
    await refreshData();
    
    setIsModalVisible(false);
    form.resetFields();
    message.success('Item created successfully');
  } catch (error) {
    console.error(`Error creating ${type}:`, error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create item';
    if (error.message.includes('Required fields')) {
      errorMessage = 'Please fill in all required fields';
    } else if (error.code === 'permission-denied') {
      errorMessage = 'You do not have permission to create items';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Network error. Please check your connection';
    }
    
    message.error(errorMessage);
  } finally {
    setProcessingAction(false);
  }
};

const handleUpdate = async values => {
  if (processingAction) return;
  setProcessingAction(true);

  const type = activeTab === 'categories'
    ? 'categories'
    : activeTab === 'subcategories'
    ? 'subcategories'
    : 'menu_items';

  try {
    if (!editingItem?.firebaseId) throw new Error('No item selected for update');

    // Handle image data
    let imageData = editingItem.image;
    if (imageInputType === 'url' && values.imageUrl) {
      imageData = values.imageUrl;
    } else if (imageInputType === 'upload' && values.imageUpload?.[0]) {
      imageData = {
        file: {
          url: values.imageUpload[0].url || values.imageUpload[0].thumbUrl,
          name: values.imageUpload[0].name
        }
      };
    }

    const dataToUpdate = {
      ...values,
      image: imageData,
      orgId: parseInt(orgId),
      updatedAt: new Date().toISOString(),
      id: editingItem.firebaseId,
      firebaseId: editingItem.firebaseId
    };

    delete dataToUpdate.imageUrl;
    delete dataToUpdate.imageUpload;

    // Update document in Firestore
    const docRef = doc(db, type, editingItem.firebaseId);
    await updateDoc(docRef, dataToUpdate);

    // Update local state
    updateLocalState(type, 'update', dataToUpdate);

    // Close modal and reset form
    setIsModalVisible(false);
    setEditingItem(null);
    form.resetFields();

    // Refresh data after successful update
    await refreshData();
    message.success('Item updated successfully');
  } catch (error) {
    console.error('Error updating item:', error);
    message.error('Failed to update item');
  } finally {
    setProcessingAction(false);
  }
};


// Helper function to get the correct image URL
const getImageUrl = (imageData) => {
  if (!imageData) return 'https://via.placeholder.com/80';
  
  if (typeof imageData === 'string') {
    return imageData; // Direct URL
  }
  
  if (imageData.file && imageData.file.url) {
    return imageData.file.url; // Uploaded file URL
  }
  
  return 'https://via.placeholder.com/80'; // Fallback
};

const handleDelete = async (firebaseId) => {
  if (processingAction) return;
  setProcessingAction(true);

  const type = activeTab === 'categories'
    ? 'categories'
    : activeTab === 'subcategories'
    ? 'subcategories'
    : 'menu_items';

  try {
    // Delete document from Firestore
    const docRef = doc(db, type, firebaseId);
    await deleteDoc(docRef);

    // Update local state
    updateLocalState(type, 'delete', { firebaseId });

    // Refresh data after successful deletion
    await refreshData();
    message.success('Item deleted successfully');
  } catch (error) {
    console.error('Error deleting item:', error);
    message.error('Failed to delete item');
  } finally {
    setProcessingAction(false);
  }
};



const updateLocalState = (type, action, item) => {

  const updateState = prevState => {

    switch (action) {

      case 'add':

        return [...prevState, item];

      case 'update':

        return prevState.map(i =>

          i.firebaseId === item.firebaseId ? { ...i, ...item } : i

        );

      case 'delete':

        return prevState.filter(i => i.firebaseId !== item.firebaseId);

      default:

        return prevState;

    }

  };



  switch (type) {

    case 'categories':

      setCategories(updateState);

      break;

    case 'subcategories':

      setSubcategories(updateState);

      break;

    case 'menu_items':

      setMenuItems(updateState);

      break;

  }

};



const handleAvailabilityChange = async (itemId, isAvailable) => {
  if (updatingItemId === itemId) return;
  setUpdatingItemId(itemId);

  try {
    const menuItem = menuItems.find(item => item.firebaseId === itemId);
    if (!menuItem) throw new Error('Menu item not found');

    // Optimistic update
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.firebaseId === itemId ? { ...item, isAvailable } : item
      )
    );

    // Update availability in Firestore
    const docRef = doc(db, 'menu_items', itemId);
    await updateDoc(docRef, { 
      isAvailable,
      updatedAt: new Date()
    });

    // Refresh menu data after successful update
    await refreshData();
    message.success(`Item ${isAvailable ? 'available' : 'unavailable'}`);
  } catch (error) {
    console.error('Error updating availability:', error);
    message.error('Failed to update availability');
    
    // Revert the change on error
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.firebaseId === itemId ? { ...item, isAvailable: !isAvailable } : item
      )
    );
  } finally {
    setUpdatingItemId(null);
  }
};



// const handleSaveAvailability = async firebaseId => {

//   try {

//     const values = await form.validateFields();

//     await fetch(`${API_URL}/menu_items/${firebaseId}.json`, {

//       method: 'PATCH',

//       headers: { 'Content-Type': 'application/json' },

//       body: JSON.stringify(values),

//     });



//     setMenuItems(prev =>

//       prev.map(item =>

//         item.firebaseId === firebaseId ? { ...item, ...values } : item

//       )

//     );



//     setAvailabilityDrawer(false);

//     message.success('Availability details updated successfully');

//   } catch (error) {

//     console.error('Error saving availability:', error);

//     message.error('Failed to update availability details');

//   }

// };



const handleCategoryChange = categoryId => {

  setSelectedCategory(categoryId);

  form.setFieldsValue({ subcategoryId: null });

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

          <Button

            icon={<EditOutlined />}

            onClick={() => {

              setEditingItem(record);

              form.setFieldsValue(record);

              setIsModalVisible(true);

            }}

          />
 <Popconfirm
      title="Are you sure you want to delete this item?"
      onConfirm={() => handleDelete(record.firebaseId)}
      okText="Yes"
      cancelText="No"
      placement="topRight"
    >
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        style={{ marginLeft: 8 }}
      />
    </Popconfirm>

        </>

      ),

    },

  ],

  subcategories: [

    { title: 'Name', dataIndex: 'name', key: 'name' },

    {

      title: 'Category',

      dataIndex: 'categoryId',

      key: 'categoryId',

      render: categoryId => categories.find(c => c.id === categoryId)?.name,

    },

    {

      title: 'Actions',

      key: 'actions',

      render: (_, record) => (

        <>

          <Button

            icon={<EditOutlined />}

            onClick={() => {

              setEditingItem(record);

              form.setFieldsValue(record);

              setIsModalVisible(true);

            }}

          />

<Popconfirm
      title="Are you sure you want to delete this item?"
      onConfirm={() => handleDelete(record.firebaseId)}
      okText="Yes"
      cancelText="No"
      placement="topRight"
    >
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        style={{ marginLeft: 8 }}
      />
    </Popconfirm>
        </>

      ),

    },

  ],

  menuItems: [

    { title: 'Name', dataIndex: 'name', key: 'name' },

    { title: 'Description', dataIndex: 'description', key: 'description' },

    { title: 'Price', dataIndex: 'price', key: 'price' },

    {

      title: 'Category',

      dataIndex: 'categoryId',

      key: 'categoryId',

      render: categoryId => categories.find(c => c.id === categoryId)?.name,

    },

    {

      title: 'Subcategory',

      dataIndex: 'subcategoryId',

      key: 'subcategoryId',

      render: subcategoryId =>

        subcategories.find(s => s.id === subcategoryId)?.name,

    },

    {

      title: 'Actions',

      key: 'actions',

      width: 150,

      render: (_, record) => (

        <>

          <Button

            icon={<EditOutlined />}

            onClick={() => {

              setEditingItem(record);

              form.setFieldsValue(record);

              setIsModalVisible(true);

            }}

          />

<Popconfirm
      title="Are you sure you want to delete this item?"
      onConfirm={() => handleDelete(record.firebaseId)}
      okText="Yes"
      cancelText="No"
      placement="topRight"
    >
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        style={{ marginLeft: 8 }}
      />
    </Popconfirm>

        </>

      ),

    },

  ],

};



const ModernMenuItem = memo(({ item }) => (
  <Card
    hoverable
    className="menu-item-card"
    style={{
      margin: '8px',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      backgroundColor: theme.cardBg,
      border: 'none',
      opacity: updatingItemId === item.firebaseId ? 0.7 : 1,
    }}
  >
    <div style={{ display: 'flex', gap: '12px' }}>
      <img
        src={getImageUrl(item.image)}
        alt={item.name}
        style={{
          width: '80px',
          height: '80px',
          objectFit: 'cover',
          borderRadius: '12px',
          flexShrink: 0,
        }}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/80';
        }}
      />
      <div style={{ 
        flex: 1, 
        overflow: 'hidden',
        minWidth: 0 // Ensure text wrapping works properly
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          gap: '8px' // Add gap between name and price
        }}>
          <div style={{ flex: 1, minWidth: 0 }}> {/* Container for text content */}
            <Text 
              strong 
              style={{ 
                fontSize: '16px', 
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {item.name}
            </Text>
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '14px', 
                display: 'block', 
                marginTop: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {item.description}
            </Text>
          </div>
          <Text 
            strong 
            style={{ 
              color: theme.primary, 
              fontSize: '16px',
              whiteSpace: 'nowrap', // Prevent price from breaking
              flexShrink: 0 // Prevent price from shrinking
            }}
          >
            ₹{item.price}
          </Text>
        </div>
        <div style={{ 
          marginTop: '8px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <Switch
            checked={item.isAvailable}
            onChange={(checked) => handleAvailabilityChange(item.firebaseId, checked)}
            disabled={updatingItemId === item.firebaseId}
            size="small"
            style={{ backgroundColor: item.isAvailable ? theme.primary : undefined }}
          />
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                const itemToEdit = {
                  ...item,
                  id: item.id,
                  categoryId: item.categoryId,
                  subcategoryId: item.subcategoryId
                };
                setEditingItem(itemToEdit);
                
                // Handle image data
                if (item.image) {
                  if (typeof item.image === 'string') {
                    setImageInputType('url');
                    form.setFieldsValue({
                      ...itemToEdit,
                      imageUrl: item.image
                    });
                  } else if (item.image.file && item.image.file.url) {
                    setImageInputType('upload');
                    form.setFieldsValue({
                      ...itemToEdit,
                      imageUpload: [{
                        uid: '-1',
                        name: item.image.file.name || 'image.jpg',
                        status: 'done',
                        url: item.image.file.url,
                        thumbUrl: item.image.file.url
                      }]
                    });
                  }
                } else {
                  form.setFieldsValue(itemToEdit);
                }
                
                setSelectedCategory(item.categoryId);
                setIsModalVisible(true);
              }}
              style={{ padding: '4px 8px' }}
            />
            <Popconfirm
              title="Delete this item?"
              onConfirm={() => handleDelete(item.firebaseId)}
              okText="Yes"
              cancelText="No"
              placement="topRight"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                style={{ padding: '4px 8px' }}
              />
            </Popconfirm>
          </Space>
        </div>
      </div>
    </div>
  </Card>
));






  const renderSiderContent = () => (
    <>
      <div style={{ 
        padding: '24px 16px', 
        borderBottom: `1px solid ${theme.primary}20`,
        background: theme.primary,
      }}>
        <Title level={4} style={{ color: 'white', margin: 0, textAlign: 'center' }}>
          Menu Management
        </Title>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[activeTab]}
        style={{ borderRight: 0 }}
        items={[
          {
            key: 'categories',
            icon: <ShopOutlined />,
            label: 'Categories',
          },
          {
            key: 'subcategories',
            icon: <RestOutlined />,
            label: 'Subcategories',
          },
          {
            key: 'menu_items',
            icon: <AppstoreOutlined />,
            label: 'Menu Items',
          },
        ]}
        onClick={({ key }) => {
          setActiveTab(key);
          setDrawerVisible(false);
        }}
      />
    </>
  );

  // Floating Action Button for adding new items
  const FloatingActionButton = () => (
    <Button
      type="primary"
      shape="circle"
      size="large"
      icon={<PlusOutlined style={{ fontSize: '24px' }} />}
      onClick={() => {
        setEditingItem(null);
        form.resetFields();
        setIsModalVisible(true);
      }}
      style={{
        position: 'fixed',
        bottom: `${FOOTER_HEIGHT + 44}px`, // Adjust bottom position to be above footer
        right: '24px',
        backgroundColor: theme.primary,
        boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
        width: '56px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        border: 'none'
      }}
    />
  );

  // Update the VirtualizedMenuItems component
  const VirtualizedMenuItems = () => {
    const containerRef = useRef(null);
    const [containerHeight, setContainerHeight] = useState(window.innerHeight);
    const scrollRef = useRef(null);
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
      const updateHeight = () => {
        if (containerRef.current) {
          const searchBarHeight = showFilters ? 140 : 0;
          const bottomPadding = 60;
          const height = window.innerHeight - 184 - searchBarHeight - bottomPadding;
          setContainerHeight(height);
        }
      };

      updateHeight();
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }, [showFilters]);

    // Add scroll event handler
    useEffect(() => {
      const scrollContainer = scrollRef.current;
      if (!scrollContainer) return;

      let scrollTimeout;
      const handleScroll = () => {
        setIsScrolling(true);
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      };

      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeout);
      };
    }, []);

    return (
      <div 
        ref={containerRef} 
        style={{ 
          height: '100%',
          overflow: 'hidden',
          paddingBottom: '50px'
        }}
      >
        <VirtualList
          ref={scrollRef}
          data={filteredAndSortedItems}
          height={containerHeight}
          itemHeight={120} // Fixed height for better performance
          itemKey="firebaseId"
          overscan={5} // Increase overscan for smoother scrolling
          style={{
            padding: '0 8px',
            overflowX: 'hidden',
            paddingTop: '54px',
            WebkitOverflowScrolling: 'touch', // Enable momentum scrolling on iOS
            scrollBehavior: 'smooth',
            msOverflowStyle: '-ms-autohiding-scrollbar'
          }}
        >
          {(item) => (
            <Col 
              xs={24} 
              key={item.firebaseId}
              style={{
                opacity: isScrolling ? 0.8 : 1,
                transition: 'opacity 0.2s ease',
                transform: 'translateZ(0)', // Hardware acceleration
                willChange: 'transform', // Optimize animations
                padding: '4px 0'
              }}
            >
              <ModernMenuItem item={item} />
            </Col>
          )}
        </VirtualList>
      </div>
    );
  };

  // Add these optimized scroll styles
  const scrollOptimizationStyles = `
    .ant-virtual-list {
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
      overscroll-behavior-y: contain;
      scroll-snap-type: y proximity;
      position: relative;
    }

    .ant-virtual-list-holder {
      transform: translateZ(0);
      will-change: transform;
      contain: content;
    }

    .menu-item-card {
      scroll-snap-align: start;
      contain: layout style paint;
    }

    @supports (-webkit-touch-callout: none) {
      .ant-virtual-list {
        /* iOS-specific scroll improvements */
        -webkit-overflow-scrolling: touch;
        overflow-y: scroll;
      }
    }

    /* Reduce motion for users who prefer it */
    @media (prefers-reduced-motion: reduce) {
      .ant-virtual-list {
        scroll-behavior: auto;
      }
      
      .menu-item-card {
        transition: none !important;
      }
    }

    /* Optimize touch targets for mobile */
    @media (max-width: 768px) {
      .menu-item-card {
        min-height: 110px;
        margin: 6px 0;
      }

      .ant-virtual-list-holder-inner {
        padding: 4px 0;
      }
    }
  `;

  document.head.insertAdjacentHTML('beforeend', `<style>${scrollOptimizationStyles}</style>`);

  // Add this new styled drawer component
  const ModernFilterDrawer = memo(({ visible, onClose }) => {
    const [localPriceRange, setLocalPriceRange] = useState(priceRange);
    const [localFilters, setLocalFilters] = useState({
      categories: selectedCategories,
      availability: availabilityFilter,
      sort: sortBy,
      order: sortOrder
    });

    // Reset handler
    const handleReset = () => {
      setLocalFilters({
        categories: [],
        availability: 'all',
        sort: 'name',
        order: 'asc'
      });
      setLocalPriceRange([0, 10000]);
    };

    // Apply handler
    const handleApply = () => {
      setSelectedCategories(localFilters.categories);
      setAvailabilityFilter(localFilters.availability);
      setSortBy(localFilters.sort);
      setSortOrder(localFilters.order);
      setPriceRange(localPriceRange);
      onClose();
    };

    return (
      <Drawer
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '12px 0'
          }}>
            <Text strong style={{ fontSize: '18px' }}>Filters & Sort</Text>
            <Button type="text" onClick={handleReset}>Reset</Button>
          </div>
        }
        placement="right"
        width="100%"
        onClose={onClose}
        open={visible}
        styles={{
          header: {
            padding: '0 24px',
            borderBottom: '1px solid #f0f0f0'
          },
          body: {
            padding: '0'
          }
        }}
        footer={
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            gap: '12px'
          }}>
            <StylishButton type="default" block onClick={onClose}>
              Cancel
            </StylishButton>
            <StylishButton type="primary" block onClick={handleApply}>
              Apply Filters
            </StylishButton>
          </div>
        }
      >
        <div className="modern-drawer-content">
          {/* Categories Section */}
          <div className="filter-section">
            <Text strong className="section-title">Categories</Text>
            <div className="tag-cloud">
              {categories.map(category => (
                <Tag.CheckableTag
                  key={category.firebaseId}
                  checked={localFilters.categories.includes(category.firebaseId)}
                  onChange={checked => {
                    const newCategories = checked
                      ? [...localFilters.categories, category.firebaseId]
                      : localFilters.categories.filter(id => id !== category.firebaseId);
                    setLocalFilters(prev => ({ ...prev, categories: newCategories }));
                  }}
                  style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '16px',
                    padding: '4px 12px',
                    margin: '4px'
                  }}
                >
                  {category.name}
                </Tag.CheckableTag>
              ))}
            </div>
          </div>

          {/* Price Range Section */}
          <div className="filter-section">
            <Text strong className="section-title">Price Range</Text>
            <div style={{ padding: '0 12px' }}>
              <Slider
                range
                min={0}
                max={10000}
                value={localPriceRange}
                onChange={setLocalPriceRange}
                tooltip={{
                  formatter: value => `₹${value}`
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '8px'
              }}>
                <Text type="secondary">₹{localPriceRange[0]}</Text>
                <Text type="secondary">₹{localPriceRange[1]}</Text>
              </div>
            </div>
          </div>

          {/* Availability Section */}
          <div className="filter-section">
            <Text strong className="section-title">Availability</Text>
            <Radio.Group
              value={localFilters.availability}
              onChange={e => setLocalFilters(prev => ({ ...prev, availability: e.target.value }))}
              style={{ width: '100%', padding: '0 12px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {[
                  { value: 'all', label: 'All Items' },
                  { value: 'available', label: 'Available Only' },
                  { value: 'unavailable', label: 'Unavailable Only' }
                ].map(option => (
                  <Radio.Button
                    key={option.value}
                    value={option.value}
                    className="modern-radio-button"
                  >
                    {option.label}
                  </Radio.Button>
                ))}
              </Space>
            </Radio.Group>
          </div>

          {/* Sort Section */}
          <div className="filter-section">
            <Text strong className="section-title">Sort By</Text>
            <div className="sort-options">
              <Select
                value={localFilters.sort}
                onChange={value => setLocalFilters(prev => ({ ...prev, sort: value }))}
                style={{ width: '100%', marginBottom: '12px' }}
              >
                <Option value="name">Name</Option>
                <Option value="price">Price</Option>
                <Option value="category">Category</Option>
              </Select>
              <Radio.Group
                value={localFilters.order}
                onChange={e => setLocalFilters(prev => ({ ...prev, order: e.target.value }))}
                optionType="button"
                buttonStyle="solid"
                style={{ width: '100%' }}
              >
                <Radio.Button value="asc" style={{ width: '50%', textAlign: 'center' }}>
                  Ascending
                </Radio.Button>
                <Radio.Button value="desc" style={{ width: '50%', textAlign: 'center' }}>
                  Descending
                </Radio.Button>
              </Radio.Group>
            </div>
          </div>
        </div>
      </Drawer>
    );
  });

  // Add these styles to your existing styles
  const modernDrawerStyles = `
    .modern-drawer-content {
      height: 100%;
      overflow-y: auto;
    }

    .filter-section {
      padding: 20px 24px;
      border-bottom: 1px solid #f0f0f0;
    }

    .section-title {
      display: block;
      margin-bottom: 16px;
      font-size: 16px;
    }

    .tag-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .modern-radio-button {
      width: 100%;
      height: 40px;
      margin: 4px 0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0 16px;
    }

    .sort-options {
      padding: 0 12px;
    }

    .ant-radio-button-wrapper {
      transition: all 0.3s ease;
    }

    .ant-radio-button-wrapper:hover {
      transform: translateY(-1px);
    }

    .ant-drawer-content-wrapper {
      transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1) !important;
    }

    .ant-slider-handle::after {
      box-shadow: 0 0 0 2px ${theme.primary};
    }

    .ant-tag-checkable {
      transition: all 0.3s ease;
    }

    .ant-tag-checkable:hover {
      transform: translateY(-1px);
    }

    .ant-tag-checkable-checked {
      background-color: ${theme.primary} !important;
      border-color: ${theme.primary} !important;
    }
  `;

  document.head.insertAdjacentHTML('beforeend', `<style>${modernDrawerStyles}</style>`);

  // Replace the existing updatedScrollStyles with this:
  const updatedScrollStyles = `
    html, body {
      overflow: auto;
      width: 100%;
      height: 100%;
      -webkit-overflow-scrolling: touch;
    }

    #root {
      height: 100%;
      overflow: auto;
    }

    .menu-management-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
    }

    .menu-management-content {
      height: 100%;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    .ant-virtual-list {
      scrollbar-width: thin;
      scrollbar-color: ${theme.primary}20 transparent;
    }

    .ant-virtual-list::-webkit-scrollbar {
      width: 6px;
    }

    .ant-virtual-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .ant-virtual-list::-webkit-scrollbar-thumb {
      background-color: ${theme.primary}20;
      border-radius: 3px;
    }
  `;

  document.head.insertAdjacentHTML('beforeend', `<style>${updatedScrollStyles}</style>`);

  // Add these additional styles
  const scrollStyles = `
    .menu-management-content {
      padding-bottom: 60px;
    }

    .ant-virtual-list-holder {
      padding-bottom: 60px;
    }
  `;

  document.head.insertAdjacentHTML('beforeend', `<style>${scrollStyles}</style>`);

  return (
    <div className="menu-management-container">
      <Layout style={{ 
        minHeight: '100vh', 
        background: theme.background,
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
      }}>
        <MobileHeader />
        
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '60vh' 
          }}>
            <FoodLoader />
          </div>
        ) : (
          <div className="menu-management-content">
            <Drawer
              placement="left"
              closable={false}
              onClose={() => setDrawerVisible(false)}
              open={drawerVisible}
              bodyStyle={{ padding: 0 }}
              width="80%"
              style={{
                borderTopRightRadius: '20px',
                borderBottomRightRadius: '20px'
              }}
            >
              {renderSiderContent()}
            </Drawer>

            <Layout style={{ 
              marginTop: '112px',
              background: theme.background,
              height: `calc(100vh - 72px)`,
              width: '100%',
              maxWidth: '480px',
            }}>
              <Content style={{
                padding: '0',
                height: '100%',
                overflow: 'auto',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                paddingBottom: '60px', // Increase bottom padding
              }}>
                {activeTab === 'menu_items' && showFilters && (
                  <div style={{ flexShrink: 0 }}>
                    <SearchAndFilters />
                  </div>
                )}
                
                <div style={{ 
                  flex: 1, 
                  overflow: 'auto',
                  position: 'relative',
                  WebkitOverflowScrolling: 'touch'
                }}>
                  {activeTab === 'menu_items' ? (
                    <VirtualizedMenuItems />
                  ) : (
                    <div style={{
                      height: '100%',
                      overflowY: 'auto',
                      padding: '8px',
                      paddingBottom: '60px', // Add padding for non-menu items views
                      WebkitOverflowScrolling: 'touch'
                    }}>
                      <Row gutter={[8, 8]}>
                        {activeTab === 'categories' ? (
                          categories.map((category) => (
                            <Col xs={24} key={category.firebaseId}>
                              <ModernCategoryCard item={category} type="category" />
                            </Col>
                          ))
                        ) : (
                          subcategories.map((subcategory) => (
                            <Col xs={24} key={subcategory.firebaseId}>
                              <ModernCategoryCard item={subcategory} type="subcategory" />
                            </Col>
                          ))
                        )}
                      </Row>
                    </div>
                  )}
                </div>
              </Content>
            </Layout>

            <FloatingActionButton />

            {/* Update Modal styles */}
            <Modal
              title={null}
              visible={isModalVisible}
              onCancel={() => {
                setIsModalVisible(false);
                setEditingItem(null);
                form.resetFields();
              }}
              footer={null}
              style={{ 
                top: 20,
                maxWidth: '90%',
                margin: '0 auto',
                maxHeight: `calc(100vh - ${FOOTER_HEIGHT + 40}px)`, // Adjust max height
                overflow: 'auto'
              }}
              bodyStyle={{
                borderRadius: '16px',
                padding: '20px'
              }}
            >
              <Form form={form} layout='vertical' onFinish={editingItem ? handleUpdate : handleCreate}>
                {renderFormItems()}
                <Form.Item>
                  <Button
                    type='primary'
                    htmlType='submit'
                    style={{
                      backgroundColor: '#ff4d4f',
                      borderColor: '#ff4d4f',
                      width: '100%',
                      height: '40px',
                      borderRadius: '6px',
                    }}
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </div>
        )}
      </Layout>
    </div>
  );
};

// Add performance optimization styles
const styles = `
  .ant-select-dropdown {
    position: fixed !important;
  }

  .menu-item-card {
    will-change: transform;
    transform: translateZ(0);
  }

  .ant-input-affix-wrapper:focus,
  .ant-input-affix-wrapper-focused {
    z-index: 1;
  }
`;

document.head.insertAdjacentHTML('beforeend', `<style>${styles}</style>`);

// Add these styles to your existing styles
const additionalStyles = `
  .menu-button:active {
    transform: scale(0.95);
  }

  .header-button {
    transition: opacity 0.2s ease;
  }

  .header-button:active {
    opacity: 0.7;
  }

  .ant-switch {
    transition: background-color 0.2s ease;
  }

  .menu-item-card {
    transition: transform 0.2s ease;
  }

  .menu-item-card:active {
    transform: scale(0.99);
  }
`;

document.head.insertAdjacentHTML('beforeend', `<style>${additionalStyles}</style>`);

// Add these styles to your existing styles
const enhancedStyles = `
  .search-container .ant-input-affix-wrapper {
    transition: all 0.3s ease;
  }

  .search-container .ant-input-affix-wrapper:hover,
  .search-container .ant-input-affix-wrapper:focus {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .ant-drawer-content-wrapper {
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
  }

  .ant-slider-track {
    background-color: ${theme.primary};
  }

  .ant-slider-handle {
    border-color: ${theme.primary};
  }

  .ant-radio-button-wrapper-checked {
    background-color: ${theme.primary}!important;
    border-color: ${theme.primary}!important;
    color: white!important;
  }
`;

document.head.insertAdjacentHTML('beforeend', `<style>${enhancedStyles}</style>`);

// Add these styles
const drawerStyles = `
  .filter-drawer .ant-drawer-content-wrapper {
    border-radius: 20px 20px 0 0;
  }
  
  .filter-drawer .ant-drawer-body {
    border-radius: 20px 20px 0 0;
  }
`;

document.head.insertAdjacentHTML('beforeend', `<style>${drawerStyles}</style>`);

export default memo(ModernMenuManagement);