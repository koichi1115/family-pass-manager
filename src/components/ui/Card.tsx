'use client';

import React from 'react';
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardActions,
  CardHeader,
  Avatar,
  IconButton,
  Chip,
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// 拡張されたCardProps
export interface CardProps extends MuiCardProps {
  title?: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  action?: React.ReactNode;
  showMoreAction?: boolean;
  onMoreClick?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  elevation?: number;
  hoverable?: boolean;
  clickable?: boolean;
  selected?: boolean;
  importance?: 'low' | 'medium' | 'high';
}

// スタイル付きCard
const StyledCard = styled(MuiCard)<{
  hoverable?: boolean;
  clickable?: boolean;
  selected?: boolean;
  importance?: string;
}>(({ theme, hoverable, clickable, selected, importance }) => ({
  borderRadius: theme.spacing(1.5),
  transition: theme.transitions.create(['box-shadow', 'transform'], {
    duration: theme.transitions.duration.short,
  }),
  
  // 重要度による左ボーダー
  ...(importance && {
    borderLeft: `4px solid ${
      importance === 'high' ? theme.palette.error.main :
      importance === 'medium' ? theme.palette.warning.main :
      theme.palette.grey[400]
    }`,
  }),
  
  // 選択状態
  ...(selected && {
    backgroundColor: theme.palette.primary.light,
    borderColor: theme.palette.primary.main,
  }),
  
  // ホバー効果
  ...(hoverable && {
    '&:hover': {
      boxShadow: theme.shadows[4],
      transform: 'translateY(-2px)',
    },
  }),
  
  // クリック可能
  ...(clickable && {
    cursor: 'pointer',
    '&:hover': {
      boxShadow: theme.shadows[4],
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  }),
}));

// パスワードカード専用のスタイル
const PasswordCardContent = styled(CardContent)(({ theme }) => ({
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
  
  '& .service-info': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  
  '& .service-icon': {
    fontSize: '1.5rem',
  },
  
  '& .service-name': {
    fontWeight: 600,
    fontSize: '1.1rem',
    color: theme.palette.text.primary,
  },
  
  '& .service-url': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  
  '& .password-meta': {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  
  '& .last-used': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
}));

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  avatar,
  action,
  showMoreAction = false,
  onMoreClick,
  children,
  footer,
  elevation = 1,
  hoverable = false,
  clickable = false,
  selected = false,
  importance,
  onClick,
  ...props
}) => {
  const hasHeader = title || subtitle || avatar || action || showMoreAction;
  
  return (
    <StyledCard
      {...props}
      elevation={elevation}
      hoverable={hoverable}
      clickable={clickable}
      selected={selected}
      importance={importance}
      onClick={onClick}
    >
      {hasHeader && (
        <CardHeader
          avatar={avatar}
          title={title}
          subheader={subtitle}
          action={
            <>
              {action}
              {showMoreAction && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoreClick?.();
                  }}
                  size="small"
                  aria-label="その他のオプション"
                >
                  <MoreVert />
                </IconButton>
              )}
            </>
          }
        />
      )}
      
      {children && (
        <CardContent>
          {children}
        </CardContent>
      )}
      
      {footer && (
        <CardActions>
          {footer}
        </CardActions>
      )}
    </StyledCard>
  );
};

// パスワード専用のカードコンポーネント
export interface PasswordCardProps extends Omit<CardProps, 'children'> {
  serviceName: string;
  serviceUrl?: string;
  serviceIcon?: string;
  username?: string;
  lastUsed?: Date;
  categories?: Array<{ name: string; color: string; displayName: string }>;
  onView?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
}

export const PasswordCard: React.FC<PasswordCardProps> = ({
  serviceName,
  serviceUrl,
  serviceIcon = '🔐',
  username,
  lastUsed,
  categories = [],
  importance,
  onView,
  onEdit,
  onCopy,
  ...props
}) => {
  return (
    <Card
      {...props}
      importance={importance}
      hoverable
      showMoreAction
    >
      <PasswordCardContent>
        <div className="service-info">
          <span className="service-icon">{serviceIcon}</span>
          <div>
            <div className="service-name">{serviceName}</div>
            {serviceUrl && (
              <a
                href={serviceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="service-url"
                onClick={(e) => e.stopPropagation()}
              >
                {serviceUrl}
              </a>
            )}
          </div>
        </div>
        
        {username && (
          <div style={{ marginBottom: 8 }}>
            <strong>ID:</strong> {username}
          </div>
        )}
        
        <div className="password-meta">
          {categories.map((category) => (
            <Chip
              key={category.name}
              label={category.displayName}
              size="small"
              style={{
                backgroundColor: category.color + '20',
                color: category.color,
                borderColor: category.color,
              }}
              variant="outlined"
            />
          ))}
        </div>
        
        {lastUsed && (
          <div className="last-used">
            最終使用: {lastUsed.toLocaleDateString('ja-JP')}
          </div>
        )}
      </PasswordCardContent>
    </Card>
  );
};

export default Card;