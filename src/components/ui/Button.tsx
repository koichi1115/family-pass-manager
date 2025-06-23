'use client';

import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

// 拡張されたButtonProps
export interface ButtonProps extends Omit<MuiButtonProps, 'size'> {
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

// スタイル付きButton
const StyledButton = styled(MuiButton)<ButtonProps>(({ theme, size }) => ({
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 500,
  position: 'relative',
  
  // サイズ別スタイル
  ...(size === 'small' && {
    padding: theme.spacing(1, 2),
    fontSize: '0.875rem',
    minHeight: '32px',
  }),
  ...(size === 'medium' && {
    padding: theme.spacing(1.5, 3),
    fontSize: '1rem',
    minHeight: '40px',
  }),
  ...(size === 'large' && {
    padding: theme.spacing(2, 4),
    fontSize: '1.125rem',
    minHeight: '48px',
  }),
  
  // ホバー効果
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[4],
  },
  
  // フォーカス効果
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
  
  // ローディング状態
  '&.loading': {
    pointerEvents: 'none',
  },
}));

// ローディングオーバーレイ
const LoadingOverlay = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderRadius: 'inherit',
}));

export const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  disabled,
  size = 'medium',
  ...props
}) => {
  return (
    <StyledButton
      {...props}
      disabled={disabled || loading}
      size={size}
      className={loading ? 'loading' : ''}
    >
      {children}
      {loading && (
        <LoadingOverlay>
          <CircularProgress size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />
        </LoadingOverlay>
      )}
    </StyledButton>
  );
};

export default Button;