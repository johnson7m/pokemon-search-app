// src/contexts/XpContext.js
import React, { createContext } from 'react';
import useToast from '../hooks/useToast';

// Create a context object
const XpContext = createContext(null);

// Provider component that wraps your app
export const XpProvider = ({ children }) => {
  // 1) We call useToast ONCE here
  const {
    showToast,
    toastMessage,
    toastVariant,
    setShowToast,
    triggerToast, // We'll call this xpTrigger
  } = useToast();

  // 2) We'll rename “triggerToast” to “xpTrigger” for clarity
  const xpTrigger = triggerToast;

  // 3) Provide these values to your app
  return (
    <XpContext.Provider
      value={{
        showToast,
        toastMessage,
        toastVariant,
        setShowToast,
        xpTrigger,
      }}
    >
      {children}
    </XpContext.Provider>
  );
};

// We’ll use a simple hook to consume the context
export const useXpContext = () => {
  const ctx = React.useContext(XpContext);
  if (!ctx) {
    throw new Error('useXpContext must be used within an XpProvider');
  }
  return ctx;
};
