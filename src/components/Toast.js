import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyle = () => {
    const baseStyle = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '6px',
      color: 'white',
      fontWeight: '500',
      minWidth: '250px',
      maxWidth: '400px',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      animation: 'slideInRight 0.3s ease-out',
      cursor: 'pointer'
    };

    const typeStyles = {
      success: { backgroundColor: '#28a745' },
      error: { backgroundColor: '#dc3545' },
      warning: { backgroundColor: '#ffc107', color: '#212529' },
      info: { backgroundColor: '#17a2b8' }
    };

    return { ...baseStyle, ...typeStyles[type] };
  };

  return (
    <div style={getToastStyle()} onClick={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{message}</span>
        <span style={{ marginLeft: '10px', opacity: 0.7 }}>×</span>
      </div>
    </div>
  );
};
export default Toast;