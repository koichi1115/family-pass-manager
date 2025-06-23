'use client';

import React from 'react';
import {
  CircularProgress,
  LinearProgress,
  Skeleton,
  Box,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// 拡張されたLoadingProps
export interface LoadingProps {
  type?: 'circular' | 'linear' | 'skeleton';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'inherit';
  message?: string;
  overlay?: boolean;
  skeletonVariant?: 'text' | 'rectangular' | 'circular';
  skeletonWidth?: number | string;
  skeletonHeight?: number | string;
  skeletonLines?: number;
}

// オーバーレイスタイル
const OverlayContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  zIndex: theme.zIndex.modal,
  backdropFilter: 'blur(2px)',
}));

// ローディングコンテナ
const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  backgroundColor: 'white',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
  minWidth: 200,
}));

// スケルトンコンテナ
const SkeletonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  width: '100%',
}));

export const Loading: React.FC<LoadingProps> = ({
  type = 'circular',
  size = 'medium',
  color = 'primary',
  message,
  overlay = false,
  skeletonVariant = 'text',
  skeletonWidth = '100%',
  skeletonHeight = 40,
  skeletonLines = 3,
}) => {
  // サイズ計算
  const getCircularSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'large': return 56;
      default: return 40;
    }
  };

  // スケルトンローディング
  const renderSkeleton = () => {
    if (skeletonVariant === 'text' && skeletonLines > 1) {
      return (
        <SkeletonContainer>
          {Array.from({ length: skeletonLines }).map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              width={index === skeletonLines - 1 ? '60%' : skeletonWidth}
              height={skeletonHeight}
            />
          ))}
        </SkeletonContainer>
      );
    }

    return (
      <Skeleton
        variant={skeletonVariant}
        width={skeletonWidth}
        height={skeletonHeight}
      />
    );
  };

  // ローディング内容
  const renderLoadingContent = () => {
    switch (type) {
      case 'linear':
        return (
          <Box sx={{ width: '100%', minWidth: 200 }}>
            <LinearProgress color={color} />
            {message && (
              <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                {message}
              </Typography>
            )}
          </Box>
        );
      
      case 'skeleton':
        return renderSkeleton();
      
      default:
        return (
          <>
            <CircularProgress
              size={getCircularSize()}
              color={color}
            />
            {message && (
              <Typography variant="body2" textAlign="center">
                {message}
              </Typography>
            )}
          </>
        );
    }
  };

  // オーバーレイ表示
  if (overlay) {
    return (
      <OverlayContainer>
        <LoadingContainer>
          {renderLoadingContent()}
        </LoadingContainer>
      </OverlayContainer>
    );
  }

  // 通常表示
  if (type === 'skeleton') {
    return renderLoadingContent();
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      p={2}
    >
      {renderLoadingContent()}
    </Box>
  );
};

// ページ全体のローディング
export const PageLoading: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <Loading
    type="circular"
    size="large"
    message={message}
    overlay
  />
);

// コンテンツスケルトン
export const ContentSkeleton: React.FC<{
  lines?: number;
  width?: string | number;
  height?: number;
}> = ({ lines = 3, width = '100%', height = 20 }) => (
  <Loading
    type="skeleton"
    skeletonVariant="text"
    skeletonWidth={width}
    skeletonHeight={height}
    skeletonLines={lines}
  />
);

// カードスケルトン
export const CardSkeleton: React.FC<{
  width?: string | number;
  height?: number;
}> = ({ width = '100%', height = 200 }) => (
  <Loading
    type="skeleton"
    skeletonVariant="rectangular"
    skeletonWidth={width}
    skeletonHeight={height}
  />
);

export default Loading;