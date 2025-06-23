import React from 'react';
import { Metadata } from 'next';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Logout, AccountCircle, Menu } from '@mui/icons-material';

export const metadata: Metadata = {
  title: 'ダッシュボード - 家族パスワード管理システム',
  description: '家族パスワード管理システムのダッシュボード',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            家族パスワード管理
          </Typography>
          <IconButton color="inherit" aria-label="プロフィール">
            <AccountCircle />
          </IconButton>
          <IconButton color="inherit" aria-label="ログアウト">
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;