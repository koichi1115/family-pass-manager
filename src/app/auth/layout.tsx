import React from 'react';
import { Metadata } from 'next';
import { Box } from '@mui/material';

export const metadata: Metadata = {
  title: '認証 - 家族パスワード管理システム',
  description: '家族パスワード管理システムの認証画面',
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'grey.50',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Box>
  );
};

export default AuthLayout;