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
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    };

    const typeStyles = {
      success: { backgroundColor: '#28a745' },
      error: { backgroundColor: '#dc3545' },
      warning: { backgroundColor: '#ffc107', color: '#212529' },
      info: { backgroundColor: '#17a2b8' }
    };

    return { ...baseStyle, ...typeStyles[type] };
  };

  const closeButtonStyle = {
    marginLeft: '15px',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    color: 'inherit'
  };

  return (
    <div style={getToastStyle()}>
      <span>{message}</span>
      <button style={closeButtonStyle} onClick={onClose} aria-label="Close toast">×</button>
    </div>
  );
};

export default Toast;
