import React, { useState, useEffect, createContext, useContext } from 'react';
import { X } from 'lucide-react';

// Create Toast Context
const ToastContext = createContext();

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showMessage = (message, duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type: 'default', duration }]);
    
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  };

  const showError = (message, duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type: 'error', duration }]);
    
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showMessage, showError }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

// Individual Toast
const Toast = ({ id, message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-gray-800';

  return (
    <div
      className={`flex items-center gap-3 ${bgColor} text-white border border-black px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <p className="flex-1 text-sm">{message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};