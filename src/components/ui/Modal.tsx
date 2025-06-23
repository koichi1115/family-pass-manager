'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogProps,
  IconButton,
  Typography,
  Slide,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { styled } from '@mui/material/styles';

// スライドトランジション
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// 拡張されたModalProps
export interface ModalProps extends Omit<DialogProps, 'title'> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
  fullScreenMobile?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// スタイル付きDialog
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogTitle-root': {
    paddingBottom: theme.spacing(1),
  },
  
  '& .MuiDialogContent-root': {
    paddingTop: theme.spacing(2),
  },
  
  '& .MuiPaper-root': {
    borderRadius: theme.spacing(2),
    
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(1),
      width: `calc(100% - ${theme.spacing(2)})`,
    },
  },
}));

// タイトル部分のスタイル
const TitleContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));

const TitleContent = styled('div')({
  flex: 1,
  minWidth: 0, // テキストオーバーフロー対応
});

export const Modal: React.FC<ModalProps> = ({
  title,
  subtitle,
  children,
  actions,
  showCloseButton = true,
  onClose,
  fullScreenMobile = true,
  maxWidth = 'sm',
  open,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldFullScreen = fullScreenMobile && isMobile;
  
  return (
    <StyledDialog
      {...props}
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={shouldFullScreen}
      TransitionComponent={Transition}
      keepMounted={false}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {(title || showCloseButton) && (
        <DialogTitle id="modal-title">
          <TitleContainer>
            <TitleContent>
              {title && (
                <Typography variant="h6" component="h2">
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </TitleContent>
            {showCloseButton && onClose && (
              <IconButton
                onClick={onClose}
                size="small"
                aria-label="閉じる"
                sx={{
                  color: 'grey.500',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                <Close />
              </IconButton>
            )}
          </TitleContainer>
        </DialogTitle>
      )}
      
      <DialogContent id="modal-description">
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions>
          {actions}
        </DialogActions>
      )}
    </StyledDialog>
  );
};

// 確認ダイアログ専用コンポーネント
export interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'info' | 'warning' | 'error';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  onConfirm,
  onCancel,
  severity = 'info',
}) => {
  const getColor = () => {
    switch (severity) {
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'primary';
    }
  };
  
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      maxWidth="xs"
      actions={
        <>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: severity === 'error' ? '#d32f2f' : '#1976d2',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <Typography>{message}</Typography>
    </Modal>
  );
};

export default Modal;