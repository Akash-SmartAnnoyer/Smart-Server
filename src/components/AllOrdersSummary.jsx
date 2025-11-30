import React, { useState, useEffect } from 'react';
import { 
  Button, Card, Modal, List, Typography, Divider, Space, Collapse 
} from 'antd';
import { 
  DownloadOutlined, 
  ExclamationCircleOutlined, 
  ShoppingCartOutlined 
} from '@ant-design/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import FoodLoader from './FoodLoader';
import { calculateCharges } from '../utils/calculateCharges';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;
const { Panel } = Collapse;

function AllOrdersSummary() {
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [charges, setCharges] = useState([]);
  const [displaySettings, setDisplaySettings] = useState({
    showPricesInOrderReview: true,
    showChargesIndividually: true,
    showTaxesSeparately: true
  });
  const { orgId, role } = useAuth();
  const tableNumber = localStorage.getItem('tableNumber');
  const customerId = localStorage.getItem('customerId');
  const [isCalculating, setIsCalculating] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine if user is customer or admin
  const isCustomer = !role || role === 'customer';

  const showErrorModal = (message) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };
  
  // Fetch orders based on user type
  useEffect(() => {
    const fetchOrders = async () => {
      if (!orgId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        if (isCustomer && customerId) {
          // For customers, fetch their orders (including waiter mode orders)
          const customerOrdersData = await api.getOrders(orgId, { customerName: customerId });
          if (customerOrdersData && customerOrdersData.length > 0) {
            const processedOrders = customerOrdersData
              .map(order => ({
                ...order,
                id: order.orderId || order._id || order.id,
                timestamp: order.createdAt || order.timestamp || new Date().toISOString()
              }))
              .filter(order => !['cancelled', 'completed'].includes(order.status))
              .sort((a, b) => {
                const dateA = new Date(a.timestamp || a.createdAt);
                const dateB = new Date(b.timestamp || b.createdAt);
                return dateB - dateA;
              });
            setOrders(processedOrders);
          } else {
            setOrders([]);
          }
        } else if (!isCustomer) {
          // For admins, fetch all orders (excluding waiter mode)
          const adminOrdersData = await api.getOrders(orgId, {});
          if (adminOrdersData && adminOrdersData.length > 0) {
            const processedOrders = adminOrdersData
              .map(order => ({
                ...order,
                id: order.orderId || order._id || order.id,
                timestamp: order.createdAt || order.timestamp || new Date().toISOString()
              }))
              .filter(order => !['cancelled', 'completed'].includes(order.status))
              .sort((a, b) => {
                const dateA = new Date(a.timestamp || a.createdAt);
                const dateB = new Date(b.timestamp || b.createdAt);
                return dateB - dateA;
              });
            setOrders(processedOrders);
          } else {
            setOrders([]);
          }
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [orgId, customerId, isCustomer]);

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        if (!orgId) return;
        
        // Check if user is authenticated (has token) or is a guest customer
        const token = localStorage.getItem('token');
        const isPublic = !token || token === 'null' || token === '';
        
        const restaurant = await api.getRestaurant(orgId, isPublic);
        if (restaurant) {
          setRestaurantInfo(restaurant);
          // Set display settings if available
          if (restaurant.organizationSettings) {
            setDisplaySettings({
              showPricesInOrderReview: restaurant.organizationSettings.showPricesInOrderReview !== false,
              showChargesIndividually: restaurant.organizationSettings.showChargesIndividually !== false,
              showTaxesSeparately: restaurant.organizationSettings.showTaxesSeparately !== false
            });
          }
        } else {
          throw new Error('Organization not found');
        }
      } catch (error) {
        console.error(error);
        showErrorModal('Failed to fetch organization details.');
      }
    };

    if (orgId) {
      fetchRestaurantInfo();
    }
  }, [orgId]);

  useEffect(() => {
    const fetchCharges = async () => {
      try {
        if (!orgId) return;
        
        // Check if user is authenticated (has token) or is a guest customer
        const token = localStorage.getItem('token');
        const isPublic = !token || token === 'null' || token === '';
        
        const chargesArray = await api.getCharges(orgId, isPublic);
        if (chargesArray) {
          setCharges(chargesArray);
        }
      } catch (error) {
        console.error('Error fetching charges:', error);
      }
    };

    if (orgId) {
      fetchCharges();
    }
  }, [orgId]);

  // Filter active orders for the current customer
  const activeOrders = orders?.filter(order => 
    !['cancelled', 'completed'].includes(order.status) && 
    (isCustomer ? order.customerId === customerId : true)
  ) || [];

  // Calculate total for all active orders
  const calculateOrderTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    
    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);

    if (!charges || !Array.isArray(charges)) {
      return subtotal;
    }

    const { total } = calculateCharges(subtotal, charges.filter(charge => charge.isEnabled));
    return total;
  };

  const grandTotal = activeOrders.reduce((sum, order) => {
    const orderTotal = calculateOrderTotal(order?.items);
    return sum + orderTotal;
  }, 0);

  useEffect(() => {
    // Simulate calculation delay
    setTimeout(() => {
      setIsCalculating(false);
    }, 1000); // Adjust the delay as needed
  }, [activeOrders, charges]);

  if (!orgId) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FoodLoader />
      </div>
    );
  }

  const getImageUrl = (imageData) => {
    if (!imageData) return '';
    if (typeof imageData === 'string') return imageData;
    if (imageData.file?.url) return imageData.file.url;
    return '';
  };

  const handleDownloadBill = () => {
    if (activeOrders.length === 0) {
      showErrorModal('No active orders available.');
      return;
    }

    if (!restaurantInfo) {
      showErrorModal('No restaurant details available.');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let yPos = margin;

    // Header with restaurant logo
    if (restaurantInfo.logo) {
      try {
        const logoWidth = 40;
        const logoHeight = 20;
        const logoX = (pageWidth - logoWidth) / 2;
        doc.addImage(restaurantInfo.logo, 'PNG', logoX, yPos, logoWidth, logoHeight);
        yPos += logoHeight + 5;
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
        showErrorModal('Failed to add restaurant logo to the bill.');
        return;
      }
    }

    // Restaurant name and details
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(restaurantInfo.name || 'Restaurant Name', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 7;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const address = restaurantInfo.address || 'N/A';
    const addressLines = doc.splitTextToSize(address, pageWidth - (2 * margin));
    doc.text(addressLines, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += (addressLines.length * 4) + 3;
    doc.text(`Tel: ${restaurantInfo.phone || 'N/A'}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 4;
    doc.text(`GSTIN: ${restaurantInfo.gstin || 'N/A'}`, pageWidth / 2, yPos, { align: 'center' });

    // Bill details header
    yPos += 8;
    doc.setFontSize(9);
    const invoiceNumber = `INV-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    doc.text(`Invoice No: ${invoiceNumber}`, margin, yPos);
    doc.text(`Date: ${formattedDate}`, pageWidth / 2, yPos, { align: 'center' });
    doc.text(`Table: ${tableNumber}`, pageWidth - margin, yPos, { align: 'right' });
    
    yPos += 7;
    doc.text(`Time: ${formattedTime}`, margin, yPos);

    // For each order, add a section
    activeOrders.forEach((order, index) => {
      yPos += 15;
      doc.setFontSize(12);  
      doc.setFont('helvetica', 'bold');
      doc.text(`Order #${order.id}`, margin, yPos);

      // Items table for this order
      yPos += 10;
      // Conditionally show prices based on settings
      const headers = displaySettings.showPricesInOrderReview 
        ? [['Item', 'Qty', 'Price', 'Amount']]
        : [['Item', 'Qty']];
      const tableData = order.items.map(item => {
        if (displaySettings.showPricesInOrderReview) {
          return [
            item.name,
            item.quantity.toString(),
            `₹${Number(item.price).toFixed(2)}`,
            `₹${(Number(item.price) * item.quantity).toFixed(2)}`
          ];
        } else {
          return [
            item.name,
            item.quantity.toString()
          ];
        }
      });

      doc.autoTable({
        startY: yPos,
        head: headers,
        body: tableData,
        theme: 'plain',
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: {
          fontSize: 9,
          cellPadding: 5,
          textColor: [0, 0, 0],
          font: 'helvetica'
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 40, halign: 'right' }
        }
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Order subtotal and charges
      if (displaySettings.showPricesInOrderReview) {
        const orderSubtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const { total: orderTotal, breakdown } = calculateCharges(orderSubtotal, charges.filter(charge => charge.isEnabled));

        // Only show subtotal and charges if showTaxesSeparately is true
        if (displaySettings.showTaxesSeparately) {
          doc.setFont('helvetica', 'bold');
          doc.text(`Order Subtotal:`, pageWidth - margin - 60, yPos);
          doc.text(`₹${orderSubtotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });

          // Show charges individually or in brackets
          if (displaySettings.showChargesIndividually) {
            Object.entries(breakdown).forEach(([name, detail]) => {
              yPos += 6;
              doc.setFont('helvetica', 'normal');
              const chargeText = `${name} ${detail.type === 'percentage' ? `(${detail.value}%)` : ''}:`;
              doc.text(chargeText, pageWidth - margin - 60, yPos);
              doc.text(`₹${detail.amount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
            });
          } else {
            // Show charges included in brackets
            const totalCharges = Object.values(breakdown).reduce((sum, detail) => sum + detail.amount, 0);
            if (totalCharges > 0) {
              yPos += 6;
              doc.setFont('helvetica', 'normal');
              doc.text(`Charges (incl.):`, pageWidth - margin - 60, yPos);
              doc.text(`₹${totalCharges.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
            }
          }
        }

        yPos += 8;
        doc.setFont('helvetica', 'bold');
        doc.text(`Order Total:`, pageWidth - margin - 60, yPos);
        // Show total with "(incl. charges)" in brackets if taxes are not shown separately
        const totalText = displaySettings.showTaxesSeparately 
          ? `₹${orderTotal.toFixed(2)}`
          : `₹${orderTotal.toFixed(2)} (incl. charges)`;
        doc.text(totalText, pageWidth - margin, yPos, { align: 'right' });
      }

      // Add divider between orders
      if (index < activeOrders.length - 1) {
        yPos += 10;
        doc.setDrawColor(200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
      }

      // Check if we need a new page
      if (yPos > doc.internal.pageSize.height - 40) {
        doc.addPage();
        yPos = margin;
      }
    });

    // Grand total section
    yPos += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', pageWidth - margin - 60, yPos);
    // Show total with "(incl. charges)" in brackets if taxes are not shown separately
    const grandTotalText = displaySettings.showTaxesSeparately 
      ? `₹${grandTotal.toFixed(2)}`
      : `₹${grandTotal.toFixed(2)} (incl. charges)`;
    doc.text(grandTotalText, pageWidth - margin, yPos, { align: 'right' });

    // Footer
    yPos = doc.internal.pageSize.height - 30;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('This is a computer-generated document. No signature required.', pageWidth / 2, yPos, { align: 'center' });

    const fileName = `${restaurantInfo.name.replace(/\s+/g, '_')}_AllOrders_${new Date().toISOString()}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
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
          Loading orders summary...
        </div>
      </div>
    );
  }

  return (
    <Card 
      className="bill-summary-container"
      style={{ 
        maxWidth: 800, 
        margin: '125px auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Space align="center">
            <ShoppingCartOutlined style={{ fontSize: 24 }} />
            <Title level={2} style={{ margin: 0 }}>All Orders Summary</Title>
          </Space>
        </div>

        <Collapse defaultActiveKey={['0']}>
          {activeOrders.map((order, index) => (
            <Panel 
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span>Order #{order.id}</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {isCalculating ? 'Calculating...' : `₹${calculateOrderTotal(order.items).toFixed(2)}`}
                  </span>
                </div>
              }
              key={index}
            >
              <List
                dataSource={order.items}
                renderItem={item => (
                  <List.Item
                    key={item.id}
                    style={{ padding: '16px', background: '#fafafa', borderRadius: '8px', marginBottom: '8px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <img 
                        src={getImageUrl(item.image)} 
                        alt={item.name}
                        style={{ 
                          width: 60, 
                          height: 60, 
                          objectFit: 'cover', 
                          borderRadius: '4px',
                          marginRight: '16px'
                        }} 
                      />
                      <div style={{ flex: 1 }}>
                        <Text strong>{item.name}</Text>
                        <br />
                        <Text type="secondary">Quantity: {item.quantity}</Text>
                      </div>
                      {displaySettings.showPricesInOrderReview && (
                        <div style={{ textAlign: 'right' }}>
                          <Text strong>₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}</Text>
                          <br />
                          <Text type="secondary">@₹{Number(item.price).toFixed(2)}</Text>
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </Panel>
          ))}
        </Collapse>

        <div style={{ padding: '24px', background: '#f5f5f5', borderTop: '1px solid #e8e8e8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Title level={4} style={{ margin: 0 }}>
              Grand Total 
              <span style={{ fontSize: '12px', verticalAlign: 'sub' }}>(all orders)</span>
            </Title>
            <Title level={4} style={{ margin: 0 }}>
              ₹{grandTotal.toFixed(2)}
              {!displaySettings.showTaxesSeparately && (
                <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '8px' }}>(incl. charges)</span>
              )}
            </Title>
          </div>
        </div>

        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          size="large"
          block
          onClick={handleDownloadBill}
          className="cart-button"
          style={{
            backgroundColor: 'red',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          disabled={isCalculating}
        >
          Download Complete Bill
        </Button>
      </Space>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', color: '#ff4d4f' }}>
            <ExclamationCircleOutlined style={{ marginRight: '8px' }} />
            Error
          </div>
        }
        visible={errorModalVisible}
        onOk={() => setErrorModalVisible(false)}
        onCancel={() => setErrorModalVisible(false)}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setErrorModalVisible(false)}
            style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
          >
            OK
          </Button>,
        ]}
        centered
        bodyStyle={{ backgroundColor: '#fff5f5', color: '#ff4d4f', textAlign: 'center' }}
      >
        <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>{errorMessage}</p>
      </Modal>
    </Card>
  );
}

export default AllOrdersSummary;