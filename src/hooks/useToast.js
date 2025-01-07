import { useState } from 'react';

const useToast = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('');

  const triggerToast = (message, variant) => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  return {
    showToast,
    toastMessage,
    toastVariant,
    setShowToast,
    triggerToast,
  };
};

export default useToast;
