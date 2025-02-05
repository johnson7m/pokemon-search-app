// src/components/ToastPortal.js
import React from 'react';
import ReactDOM from 'react-dom';
import { Toast } from 'react-bootstrap';
import { FaMedal } from 'react-icons/fa';
// Instead of useToast, we import useXpContext
import { useXpContext } from '../contexts/XpContext';

const ToastPortal = () => {
  // read from global xp context
  const {
    showToast,
    toastMessage,
    toastVariant,
    setShowToast,
  } = useXpContext();

  if (!showToast) return null;

  return ReactDOM.createPortal(
    <Toast
      onClose={() => setShowToast(false)}
      show={showToast}
      delay={3000}
      autohide
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 9999999,
        backgroundColor: '#FF1493',
        color: '#fff',
        fontWeight: 'bold',
        width: 'auto',
        minWidth: 'unset',
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Toast.Body
        style={{
          width: 'auto',
          minWidth: 'unset',
          margin: 0,
          padding: 0,
          background: 'none',
          border: 'none',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <FaMedal style={{ marginRight: '0.5rem', fontSize: '1.2rem' }} />
        {toastMessage}
      </Toast.Body>
    </Toast>,
    document.body
  );
};

export default ToastPortal;
