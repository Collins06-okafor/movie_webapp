import React from 'react';

const Modal = ({ isOpen, onClose, title, type = 'info', children }) => {
  if (!isOpen) return null;

  const getModalStyle = () => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    animation: 'fadeIn 0.3s ease-out'
  });

  const getModalContentStyle = () => ({
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '0',
    minWidth: '300px',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    animation: 'slideInUp 0.3s ease-out'
  });

  const getHeaderStyle = () => {
    const baseStyle = {
      padding: '20px',
      borderBottom: '1px solid #dee2e6',
      borderRadius: '8px 8px 0 0'
    };

    const typeStyles = {
      success: { backgroundColor: '#d4edda', color: '#155724' },
      error: { backgroundColor: '#f8d7da', color: '#721c24' },
      warning: { backgroundColor: '#fff3cd', color: '#856404' },
      info: { backgroundColor: '#d1ecf1', color: '#0c5460' }
    };

    return { ...baseStyle, ...typeStyles[type] };
  };

  return (
    <div style={getModalStyle()} onClick={onClose}>
      <div style={getModalContentStyle()} onClick={e => e.stopPropagation()}>
        <div style={getHeaderStyle()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 style={{ margin: 0, fontWeight: '600' }}>{title}</h5>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                lineHeight: 1,
                opacity: 0.7
              }}
            >
              ×
            </button>
          </div>
        </div>
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
export default Modal;