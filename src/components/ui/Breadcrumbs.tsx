'use client';

import React from 'react';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import {
  NavigateNext,
  Home,
  ArrowBack,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';

// パンくずリストアイテム
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

// 拡張されたBreadcrumbsProps
export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
  showHomeButton?: boolean;
  maxItems?: number;
  className?: string;
}

// スタイル付きコンテナ
const BreadcrumbContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    margin: theme.spacing(0, -1, 2, -1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: 0,
  },
}));

// スタイル付きパンくずリスト
const StyledBreadcrumbs = styled(MuiBreadcrumbs)(({ theme }) => ({
  flex: 1,
  
  '& .MuiBreadcrumbs-li': {
    display: 'flex',
    alignItems: 'center',
  },
  
  '& .MuiBreadcrumbs-separator': {
    margin: theme.spacing(0, 0.5),
  },
}));

// パンくずリストアイテムのスタイル
const BreadcrumbItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

// カスタムリンクコンポーネント
const BreadcrumbLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  textDecoration: 'none',
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  fontWeight: 500,
  
  '&:hover': {
    textDecoration: 'underline',
    color: theme.palette.primary.main,
  },
  
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
  },
}));

// 現在ページのテキスト
const CurrentPageText = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  fontSize: '0.875rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
  },
}));

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showBackButton = true,
  showHomeButton = false,
  maxItems = 8,
  className,
}) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push('/dashboard');
  };

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  return (
    <BreadcrumbContainer className={className}>
      {/* 戻るボタン */}
      {showBackButton && (
        <IconButton
          size="small"
          onClick={handleBack}
          aria-label="戻る"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <ArrowBack fontSize="small" />
        </IconButton>
      )}

      {/* ホームボタン */}
      {showHomeButton && (
        <IconButton
          size="small"
          onClick={handleHome}
          aria-label="ホーム"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <Home fontSize="small" />
        </IconButton>
      )}

      {/* パンくずリスト */}
      <StyledBreadcrumbs
        maxItems={maxItems}
        separator={<NavigateNext fontSize="small" />}
        aria-label="パンくずリスト"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = item.current || isLast;

          if (isCurrent) {
            return (
              <CurrentPageText key={index} component="span">
                {item.icon}
                {item.label}
              </CurrentPageText>
            );
          }

          return (
            <BreadcrumbLink
              key={index}
              component="button"
              onClick={() => item.href && handleNavigate(item.href)}
              disabled={!item.href}
              sx={{
                border: 'none',
                background: 'none',
                cursor: item.href ? 'pointer' : 'default',
                padding: 0,
              }}
            >
              {item.icon}
              {item.label}
            </BreadcrumbLink>
          );
        })}
      </StyledBreadcrumbs>
    </BreadcrumbContainer>
  );
};

// パンくずリスト生成ヘルパー
export const createBreadcrumbs = (path: string, customLabels?: Record<string, string>): BreadcrumbItem[] => {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // ホーム
  breadcrumbs.push({
    label: customLabels?.[''] || 'ホーム',
    href: '/dashboard',
    icon: <Home fontSize="small" />,
  });

  // パスセグメント
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    breadcrumbs.push({
      label: customLabels?.[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: isLast ? undefined : currentPath,
      current: isLast,
    });
  });

  return breadcrumbs;
};

// よく使用されるパンくずリストのプリセット
export const CommonBreadcrumbs = {
  Dashboard: (): BreadcrumbItem[] => [
    { label: 'ダッシュボード', current: true, icon: <Home fontSize="small" /> },
  ],
  
  Passwords: (): BreadcrumbItem[] => [
    { label: 'ホーム', href: '/dashboard', icon: <Home fontSize="small" /> },
    { label: 'パスワード管理', current: true },
  ],
  
  PasswordDetail: (serviceName: string): BreadcrumbItem[] => [
    { label: 'ホーム', href: '/dashboard', icon: <Home fontSize="small" /> },
    { label: 'パスワード管理', href: '/passwords' },
    { label: serviceName, current: true },
  ],
  
  Settings: (): BreadcrumbItem[] => [
    { label: 'ホーム', href: '/dashboard', icon: <Home fontSize="small" /> },
    { label: '設定', current: true },
  ],
  
  Profile: (): BreadcrumbItem[] => [
    { label: 'ホーム', href: '/dashboard', icon: <Home fontSize="small" /> },
    { label: '設定', href: '/settings' },
    { label: 'プロフィール', current: true },
  ],
};

export default Breadcrumbs;