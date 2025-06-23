'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  SlideProps,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Toast設定
export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
  action?: React.ReactNode;
  persistent?: boolean;
}

// スライドトランジション
const SlideTransition = (props: SlideProps) => {
  return <Slide {...props} direction="up" />;
};

// スタイル付きSnackbar
const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
  '& .MuiAlert-root': {
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[6],
    minWidth: 300,
    maxWidth: 500,
    
    [theme.breakpoints.down('sm')]: {
      minWidth: 'auto',
      width: 'calc(100vw - 32px)',
    },
  },
}));

// Toast Context
interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  closeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.type === 'error' ? 0 : 6000),
    };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showToast({ type: 'success', message, title });
  }, [showToast]);

  const showError = useCallback((message: string, title?: string) => {
    showToast({ type: 'error', message, title, persistent: true });
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string) => {
    showToast({ type: 'warning', message, title });
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string) => {
    showToast({ type: 'info', message, title });
  }, [showToast]);

  const closeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container
interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <>
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={onClose}
          offset={index * 70}
        />
      ))}
    </>
  );
};

// 個別Toast Item
interface ToastItemProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
  offset: number;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose, offset }) => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => onClose(toast.id), 300);
  };

  useEffect(() => {
    if (toast.duration && toast.duration > 0 && !toast.persistent) {
      const timer = setTimeout(handleClose, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.persistent]);

  return (
    <StyledSnackbar
      open={open}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        bottom: theme => theme.spacing(3) + offset,
      }}
    >
      <Alert
        severity={toast.type}
        variant="filled"
        onClose={toast.persistent ? undefined : handleClose}
        action={
          toast.action || toast.persistent ? (
            <>
              {toast.action}
              {toast.persistent && (
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={handleClose}
                  aria-label="閉じる"
                >
                  <Close fontSize="small" />
                </IconButton>
              )}
            </>
          ) : undefined
        }
      >
        {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
        {toast.message}
      </Alert>
    </StyledSnackbar>
  );
};

// スタンドアロンToastコンポーネント
export interface ToastProps {
  open: boolean;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
  onClose: () => void;
  action?: React.ReactNode;
}

export const Toast: React.FC<ToastProps> = ({
  open,
  type,
  title,
  message,
  duration = 6000,
  onClose,
  action,
}) => {
  useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  return (
    <StyledSnackbar
      open={open}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        severity={type}
        variant="filled"
        onClose={onClose}
        action={action}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </StyledSnackbar>
  );
};

export default Toast;