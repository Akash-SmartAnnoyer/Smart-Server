import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { Button, Card, Modal, List, Typography, Divider, Space } from "antd";
import {
  DownloadOutlined,
  ExclamationCircleOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import jsPDF from "jspdf";
import "jspdf-autotable";
import FoodLoader from "./giftLoader";
import { calculateCharges } from "../utils/calculateCharges";
import { useOrders } from "../context/OrderContext";

const { Title, Text } = Typography;

function BillSummary() {
  const { getLastActiveOrder, loading } = useOrders();
  const { cart } = useCart();
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [charges, setCharges] = useState([]);
  const orgId = localStorage.getItem("orgId");

  const lastOrder = getLastActiveOrder();
  const orderToDisplay = cart.length > 0 ? null : lastOrder;

  const displaySubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const { total: displayTotal } = calculateCharges(
    displaySubtotal,
    charges.filter((charge) => charge.isEnabled)
  );

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        const response = await fetch(
          `https://smart-server-stage-database-default-rtdb.firebaseio.com/restaurants.json`
        );

        if (response.ok) {
          const data = await response.json();

          // Check if data exists and filter by `orgId`
          if (data) {
            // Firebase stores data in a key-value format, so `data` is an object not an array
            const restaurant = Object.values(data).find(
              (item) => item.orgId === orgId
            );
            if (restaurant) {
              setRestaurantInfo(restaurant);
            } else {
              throw new Error("Organization not found");
            }
          }
        } else {
          throw new Error("Failed to fetch restaurant details");
        }
      } catch (error) {
        console.error(error);
        showErrorModal("Failed to fetch organization details.");
      }
    };

    if (orgId) {
      fetchRestaurantInfo();
    }
  }, [orgId]);

  useEffect(() => {
    const fetchCharges = async () => {
      try {
        const response = await fetch(
          `https://smart-server-stage-database-default-rtdb.firebaseio.com/restaurants/${orgId}/charges.json`
        );
        const data = await response.json();
        if (data) {
          const chargesArray = Object.entries(data).map(([id, charge]) => ({
            id,
            ...charge,
          }));
          setCharges(chargesArray);
        }
      } catch (error) {
        console.error("Error fetching charges:", error);
      }
    };

    fetchCharges();
  }, [orgId]);

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          zIndex: 1000,
        }}
      >
        <FoodLoader />
        <div
          style={{
            marginTop: "1rem",
            color: "#FF0000",
            fontWeight: "bold",
            fontSize: "1.2rem",
          }}
        >
          Loading bill summary...
        </div>
      </div>
    );
  }

  // If cart is empty and no active order exists, show empty state
  if (cart.length === 0 && !orderToDisplay) {
    return (
      <Card
        className="bill-summary-container"
        style={{
          maxWidth: 800,
          margin: "125px auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", marginTop: "100px" }}
        >
          <div style={{ textAlign: "center" }}>
            <Space align="center">
              <ShoppingCartOutlined style={{ fontSize: 24 }} />
              <Title level={2} style={{ margin: 0 }}>
                No Active Orders
              </Title>
            </Space>
          </div>
          <Text>
            Your cart is empty and there are no active orders for this table.
          </Text>
        </Space>
      </Card>
    );
  }

  const getImageUrl = (imageData) => {
    if (!imageData) return "";
    if (typeof imageData === "string") return imageData;
    if (imageData.file?.url) return imageData.file.url;
    return "";
  };

  const showErrorModal = (message) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };
  const handleDownloadBill = () => {
    const items =
      cart.length > 0 ? cart : orderToDisplay ? orderToDisplay.items : [];

    // Calculate the total here
    const subtotal =
      cart.length > 0
        ? cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
        : orderToDisplay
        ? orderToDisplay.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          )
        : 0;

    const enabledCharges = charges.filter((charge) => charge.isEnabled);
    const { total, breakdown } = calculateCharges(subtotal, enabledCharges);
    const orderTotal =
      cart.length > 0
        ? total
        : orderToDisplay
        ? parseFloat(orderToDisplay.total)
        : 0;

    if (items.length === 0) {
      showErrorModal("No items available to generate a bill.");
      return;
    }

    if (!restaurantInfo) {
      showErrorModal("No restaurant details available.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let yPos = margin;

    // Header with restaurant logo
    if (restaurantInfo.logo) {
      const logoWidth = 40;
      const logoHeight = 20;
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(
        restaurantInfo.logo,
        "PNG",
        logoX,
        yPos,
        logoWidth,
        logoHeight
      );
      yPos += logoHeight + 5;
    }

    // Restaurant name and details
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(restaurantInfo.name || "Restaurant Name", pageWidth / 2, yPos, {
      align: "center",
    });

    yPos += 7;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const address = restaurantInfo.address || "N/A";
    const addressLines = doc.splitTextToSize(address, pageWidth - 2 * margin);
    doc.text(addressLines, pageWidth / 2, yPos, { align: "center" });

    yPos += addressLines.length * 4 + 3;
    doc.text(`Tel: ${restaurantInfo.phone || "N/A"}`, pageWidth / 2, yPos, {
      align: "center",
    });

    yPos += 4;
    doc.text(`GSTIN: ${restaurantInfo.gstin || "N/A"}`, pageWidth / 2, yPos, {
      align: "center",
    });

    // Divider line
    yPos += 5;
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // Bill details
    yPos += 8;
    doc.setFontSize(9);
    const invoiceNumber = `INV-${Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0")}`;
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();
    const tableNumber = localStorage.getItem("tableNumber") || "N/A"; // Fetch tableNumber from localStorage, default to 'N/A' if not found

    // Align Invoice No, Date, and Payment Status on the same row
    doc.text(`Invoice No: ${invoiceNumber}`, margin, yPos);
    doc.text(`Date: ${formattedDate}`, pageWidth / 2, yPos, {
      align: "center",
    });
    doc.text("Payment Status: Unpaid", pageWidth - margin, yPos, {
      align: "right",
    });

    yPos += 7;
    doc.text(`Table No: ${tableNumber}`, margin, yPos);
    doc.text(`Time: ${formattedTime}`, pageWidth - margin, yPos, {
      align: "right",
    });

    // Add order status if using orderData
    if (orderToDisplay) {
      yPos += 7;
      doc.text(`Order Status: ${orderToDisplay.status}`, margin, yPos);
    }

    // Items table
    yPos += 15;
    const headers = [["Item", "Qty", "Price", "Amount"]];
    const tableData = items.map((item) => [
      item.name,
      item.quantity.toString(),
      `₹${Number(item.price).toFixed(2)}`,
      `₹${(Number(item.price) * item.quantity).toFixed(2)}`,
    ]);

    doc.autoTable({
      startY: yPos,
      head: headers,
      body: tableData,
      theme: "plain",
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontSize: 12,
        fontStyle: "bold",
        halign: "center",
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
        textColor: [0, 0, 0],
        font: "helvetica",
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 40, halign: "right" },
        3: { cellWidth: 40, halign: "right" },
      },
    });

    // Get the final Y position after the table
    yPos = doc.lastAutoTable.finalY + 10;

    // Add charges breakdown with proper spacing
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal:", pageWidth - margin - 60, yPos);
    doc.text(`₹${subtotal.toFixed(2)}`, pageWidth - margin, yPos, {
      align: "right",
    });

    // Add each charge with increased spacing
    Object.entries(breakdown).forEach(([name, detail]) => {
      yPos += 8; // Increased spacing between charges
      doc.setFont("helvetica", "normal");
      const chargeText = `${name} ${
        detail.type === "percentage" ? `(${detail.value}%)` : ""
      }:`;
      doc.text(chargeText, pageWidth - margin - 60, yPos);
      doc.text(`₹${detail.amount.toFixed(2)}`, pageWidth - margin, yPos, {
        align: "right",
      });
    });

    // Add final total with extra spacing
    yPos += 12; // Extra spacing before total
    doc.setFont("helvetica", "bold");
    doc.text("Total:", pageWidth - margin - 60, yPos);
    doc.text(`₹${orderTotal.toFixed(2)}`, pageWidth - margin, yPos, {
      align: "right",
    });

    // Footer
    yPos = doc.internal.pageSize.height - 30;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Thank you for your business!", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 5;
    doc.text(
      "This is a computer-generated document. No signature required.",
      pageWidth / 2,
      yPos,
      { align: "center" }
    );

    // Generate filename with restaurant name, date and time
    const dateStr = currentDate.toISOString().split("T")[0];
    const timeStr = currentDate.toTimeString().split(" ")[0].replace(/:/g, "-");
    const fileName = `${restaurantInfo.name.replace(
      /\s+/g,
      "_"
    )}_${dateStr}_${timeStr}.pdf`;

    doc.save(fileName);
  };
  return (
    <Card
      className="bill-summary-container"
      style={{
        maxWidth: 800,
        margin: "125px auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div style={{ textAlign: "center" }}>
          <Space align="center">
            <ShoppingCartOutlined style={{ fontSize: 24 }} />
            <Title level={2} style={{ margin: 0 }}>
              Bill Summary
            </Title>
          </Space>
        </div>

        <List
          dataSource={cart.length > 0 ? cart : orderToDisplay.items}
          renderItem={(item) => {
            const price = Number(item.price) || 0; // Ensure price is a number, default to 0 if invalid
            return (
              <List.Item
                key={item.id}
                style={{
                  padding: "16px",
                  background: "#fafafa",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: "4px",
                      marginRight: "16px",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong>{item.name}</Text>
                    <br />
                    <Text type="secondary">Quantity: {item.quantity}</Text>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Text strong>₹{(price * item.quantity).toFixed(2)}</Text>
                    <br />
                    <Text type="secondary">@₹{price.toFixed(2)}</Text>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />

        <div
          style={{
            padding: "24px",
            background: "#f5f5f5",
            borderTop: "1px solid #e8e8e8",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {/* <Title level={4} style={{ margin: 0 }}>Total</Title> */}
            <Title level={4} style={{ margin: 0 }}>
              Total{" "}
              <span style={{ fontSize: "12px", verticalAlign: "sub" }}>
                (incl. charges)
              </span>
            </Title>

            <Title level={4} style={{ margin: 0 }}>
              ₹
              {(cart.length > 0
                ? displayTotal
                : parseFloat(orderToDisplay?.total || 0)
              ).toFixed(2)}
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
            backgroundColor: "red",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Download Bill
        </Button>
      </Space>

      <Modal
        title={
          <div
            style={{ display: "flex", alignItems: "center", color: "#ff4d4f" }}
          >
            <ExclamationCircleOutlined style={{ marginRight: "8px" }} />
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
            style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
          >
            OK
          </Button>,
        ]}
        centered
        bodyStyle={{
          backgroundColor: "#fff5f5",
          color: "#ff4d4f",
          textAlign: "center",
        }}
      >
        <p
          style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "16px" }}
        >
          {errorMessage}
        </p>
      </Modal>
    </Card>
  );
}

export default BillSummary;
