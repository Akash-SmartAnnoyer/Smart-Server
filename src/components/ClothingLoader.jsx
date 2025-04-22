import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  text: {
    color: '#ff4d4f',
    fontSize: '16px',
    marginTop: '8px',
  },
};

const ClothingLoader = () => {
  return (
    <div style={styles.container}>
      <Spin 
        indicator={<LoadingOutlined style={{ fontSize: 24, color: '#ff4d4f' }} spin />}
      />
      <div style={styles.text}>Loading your collection...</div>
    </div>
  );
};

export default ClothingLoader; 