import React from 'react';
import { Button, Drawer, Input, Tag } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useCart } from '../contexts/CartContext';

const CookingRequestDrawer = ({ item, visible, onClose, onSubmit, onTagClick, selectedTags, cookingRequest, onCookingRequestChange }) => {
    const { addToCart, updateQuantity } = useCart();
    const { cart } = useCart();
  const styles = {
    selectedItemHeader: {
      backgroundColor: '#fff',
      padding: '20px',
      borderBottom: '1px solid #eee',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
    },
    selectedItemImage: {
      width: '80px',
      height: '80px',
      borderRadius: '12px',
      objectFit: 'cover',
    },
    selectedItemDetails: {
      flex: 1,
    },
    selectedItemName: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '4px',
    },
    selectedItemPrice: {
      fontSize: '16px',
      color: '#e5004b',
      fontWeight: 'bold',
    },
    closeIcon: {
      cursor: 'pointer',
      fontSize: '20px',
      color: '#666',
    },
    drawerTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#333',
    },
    cookingRequestTextarea: {
      marginBottom: '24px',
      borderRadius: '12px',
      padding: '16px',
      fontSize: '16px',
      resize: 'none',
      border: '2px solid #eee',
      transition: 'border-color 0.3s',
      '&:focus': {
        borderColor: '#e5004b',
        boxShadow: 'none',
      },
    },
    cookingRequestTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '24px',
    },
    cookingRequestTagItem: {
      backgroundColor: '#fff',
      border: '2px solid #eee',
      borderRadius: '20px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s',
      color: '#666',
      '&:hover': {
        backgroundColor: '#e5004b',
        color: '#fff',
        borderColor: '#e5004b',
      },
    },
    selectedTagItem: {
      backgroundColor: '#e5004b',
      color: '#fff',
      borderColor: '#e5004b',
    },
    cookingRequestActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '16px',
      borderTop: '1px solid #eee',
      padding: '20px',
      backgroundColor: '#fff',
    },
    submitButton: {
      backgroundColor: '#e5004b',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 32px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      '&:hover': {
        backgroundColor: '#c80041',
      },
    },
    cancelButton: {
      backgroundColor: '#f5f5f5',
      color: '#666',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 32px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      '&:hover': {
        backgroundColor: '#e5e5e5',
      },
    },
  };

  const getImageUrl = (imageData) => {
    if (!imageData) return '';
    if (typeof imageData === 'string') return imageData;
    if (imageData.file?.url) return imageData.file.url;
    return '';
  };

  const handleSubmit = () => {
    // Check if the item is already in the cart
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      // Update the existing item in the cart
      updateQuantity(item.id, existingItem.quantity + 1, {
        specialInstructions: cookingRequest,
        selectedTags,
      });
    } else {
      // Add the new item to the cart
      addToCart({ ...item, quantity: 1, specialInstructions: cookingRequest, selectedTags });
    }
    onSubmit();
  };

  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      closable={false}
      placement="bottom"
      height="auto"
      bodyStyle={{ background: '#f8f8f8', padding: 0, borderRadius: '20px 20px 0 0', boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }}
    >
      <div style={styles.selectedItemHeader}>
        <div style={styles.drawerTitle}>Customize Your Order</div>
        <CloseOutlined onClick={onClose} style={styles.closeIcon} />
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src={getImageUrl(item.image)} alt={item.name} style={styles.selectedItemImage} />
          <div style={styles.selectedItemDetails}>
            <div style={styles.selectedItemName}>{item.name}</div>
            <div style={styles.selectedItemPrice}>₹{item.price}</div>
          </div>
        </div>

        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>Add Special Instructions</div>
        <Input.TextArea
          maxLength={100}
          placeholder="Add your cooking preferences here..."
          value={cookingRequest}
          onChange={onCookingRequestChange}
          rows={3}
          style={styles.cookingRequestTextarea}
        />

        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>Customization Preferences</div>
        <div style={styles.cookingRequestTags}>
          {[
            { id: 1, label: 'Extra Spicy' },
            { id: 2, label: 'Less Spicy' },
            { id: 3, label: 'Double Spicy' },
            { id: 4, label: 'Non Spicy' },
            { id: 5, label: 'No Onion' },
            { id: 6, label: 'No Garlic' },
            { id: 7, label: 'Gluten-free' },
            { id: 8, label: 'Dairy-free' },
          ].map((option) => (
            <div
              key={option.id}
              style={{
                ...styles.cookingRequestTagItem,
                ...(selectedTags.includes(option.id) ? styles.selectedTagItem : {}),
              }}
              onClick={() => onTagClick(option.id)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.cookingRequestActions}>
        <button style={styles.cancelButton} onClick={onClose}>
          Cancel
        </button>
        <button style={styles.submitButton} onClick={handleSubmit}>
        Confirm
        </button>
      </div>
    </Drawer>
  );
};

export default CookingRequestDrawer;