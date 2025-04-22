import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Input, message, Modal, Button, Avatar } from 'antd';
import { CloseOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useMenu } from '../contexts/MenuProvider';
import ClothingLoader from './ClothingLoader';

const { Title, Text } = Typography;
const { Search } = Input;

const styles = {
  container: {
    marginTop: '60px',
  },
  stickyHeader: {
    position: 'sticky',
    top: '64px',
    zIndex: 100,
    backgroundColor: '#fff',
    marginBottom: '16px',
    borderBottom: '1px solid #f0f0f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    width: '100%',
  },
  contentContainer: {
    padding: '0 0px',
  },
  header: {
    color: '#ff4d4f',
    marginBottom: '16px',
    fontSize: '1.5rem',
    paddingLeft: '8px',
  },
  searchInput: {
    marginBottom: '16px',
    paddingLeft: '8px',
    paddingRight: '8px',
  },
  collectionCard: {
    marginBottom: '12px',
    position: 'relative',
    paddingBottom: '50px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  imageContainer: {
    width: '100px',
    height: '100px',
    overflow: 'hidden',
    flexShrink: 0,
    borderRadius: '8px',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemContent: {
    display: 'flex',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '16px',
  },
  price: {
    color: '#ff4d4f',
    fontWeight: 'bold',
    fontSize: '16px',
    marginTop: '8px',
  },
  addSuggestionsButton: {
    position: 'absolute',
    right: '24px',
    bottom: '16px',
    backgroundColor: '#ff4d4f',
    color: '#fff',
  },
  modalSearch: {
    marginBottom: '16px',
  },
  suggestionCard: {
    cursor: 'pointer',
    marginBottom: '8px',
    transition: 'all 0.3s',
  },
  selectedSuggestion: {
    backgroundColor: '#fff1f0',
    border: '1px solid #ff4d4f',
  },
  suggestionImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    marginRight: '12px',
    borderRadius: '4px',
  },
  tagsContainer: {
    marginTop: '8px',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    width: '100%',
    minHeight: '32px',
    padding: '8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
  },
  suggestionTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#fff',
    padding: '4px 8px',
    borderRadius: '16px',
    border: '1px solid #e8e8e8',
  },
  suggestionName: {
    fontSize: '12px',
    color: '#666',
    marginLeft: '4px',
  },
  loadingContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
};

const CollectionSuggestionManager = () => {
  const { 
    menuItems: collectionItems, 
    recommendations: suggestions, 
    loading,
    dataInitialized,
    refreshData,
    updateSuggestions 
  } = useMenu();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!dataInitialized) {
      refreshData();
    }
  }, [dataInitialized, refreshData]);

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setSelectedSuggestions(suggestions[item.id] || []);
    setModalVisible(true);
    setSearchText('');
  };

  const getImageUrl = (imageData) => {
    if (!imageData) return '/placeholder.jpg';
    if (typeof imageData === 'string') return imageData;
    if (imageData.url) return imageData.url;
    if (imageData.file?.url) return imageData.file.url;
    return '/placeholder.jpg';
  };

  const handleSuggestionToggle = (suggestedItem) => {
    setSelectedSuggestions(prev => {
      const exists = prev.find(item => item.id === suggestedItem.id);
      if (exists) {
        return prev.filter(item => item.id !== suggestedItem.id);
      }
      if (prev.length >= 5) {
        message.warning('Maximum 5 suggestions allowed');
        return prev;
      }
      return [...prev, suggestedItem];
    });
  };

  const saveSuggestions = async () => {
    if (!selectedItem) return;

    if (selectedSuggestions.length < 3) {
      message.error('Please select at least 3 suggestions');
      return;
    }

    setSaving(true);
    try {
      const updatedSuggestions = {
        ...suggestions,
        [selectedItem.id]: selectedSuggestions.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          description: item.description,
          price: item.price,
          orgId: parseInt(localStorage.getItem('orgId'))
        }))
      };

      await updateSuggestions(updatedSuggestions);
      await refreshData();
      message.success('Suggestions saved successfully');
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving suggestions:', error);
      message.error('Failed to save suggestions');
    } finally {
      setSaving(false);
    }
  };

  const getFilteredItems = () => {
    if (!selectedItem) return [];
    return collectionItems.filter(item => 
      item.id !== selectedItem.id &&
      (item.name.toLowerCase().includes(searchText.toLowerCase()) ||
       item.description?.toLowerCase().includes(searchText.toLowerCase()))
    );
  };

  const handleSearch = (value) => {
    setSearchText(value.toLowerCase());
  };

  const filteredCollectionItems = collectionItems.filter(item =>
    item.name.toLowerCase().includes(searchText) || 
    (item.description && item.description.toLowerCase().includes(searchText))
  );

  if (loading.overall || !dataInitialized) {
    return (
      <div style={styles.loadingContainer}>
        <ClothingLoader />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.stickyHeader}>
        <Title level={2} style={styles.header}>Collection Suggestions</Title>
        <div style={styles.searchInput}>
          <Search
            placeholder="Search collections..."
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={styles.contentContainer}>
        <Row gutter={[16, 16]}>
          {filteredCollectionItems.map(item => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <Card style={styles.collectionCard}>
                <div style={styles.itemContent}>
                  <div style={styles.imageContainer}>
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      style={styles.image}
                    />
                  </div>
                  <div>
                    <Text strong>{item.name}</Text>
                    <div style={styles.price}>₹{item.price}</div>
                    <div style={styles.tagsContainer}>
                      {suggestions[item.id]?.map(suggestion => (
                        <div key={suggestion.id} style={styles.suggestionTag}>
                          <Avatar
                            size="small"
                            src={getImageUrl(suggestion.image)}
                          />
                          <span style={styles.suggestionName}>
                            {suggestion.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={styles.addSuggestionsButton}
                  onClick={() => handleOpenModal(item)}
                >
                  Manage Suggestions
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Modal
        title={`Suggestions for ${selectedItem?.name}`}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={saveSuggestions}
          >
            Save Suggestions
          </Button>,
        ]}
        width={800}
      >
        <div style={styles.modalSearch}>
          <Search
            placeholder="Search items to suggest..."
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div>
          {getFilteredItems().map(item => (
            <Card
              key={item.id}
              style={{
                ...styles.suggestionCard,
                ...(selectedSuggestions.find(s => s.id === item.id) && styles.selectedSuggestion),
              }}
              onClick={() => handleSuggestionToggle(item)}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  style={styles.suggestionImage}
                />
                <div>
                  <Text strong>{item.name}</Text>
                  <div style={styles.price}>₹{item.price}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default CollectionSuggestionManager; 