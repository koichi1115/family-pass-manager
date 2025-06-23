'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  IconButton,
  Fab,
} from '@mui/material';
import {
  Add,
  Search,
  Security,
  People,
  History,
  Settings,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import { 
  Button, 
  Input, 
  Card, 
  PasswordCard, 
  Loading,
  Breadcrumbs,
  CommonBreadcrumbs 
} from '@/components/ui';
import { styled } from '@mui/material/styles';

// 統計情報の型
interface DashboardStats {
  totalPasswords: number;
  recentlyAdded: number;
  weakPasswords: number;
  duplicatePasswords: number;
  lastUpdated: Date;
}

// パスワード情報の型
interface PasswordItem {
  id: string;
  serviceName: string;
  serviceUrl?: string;
  serviceIcon?: string;
  username?: string;
  lastUsed?: Date;
  categories: Array<{
    name: string;
    color: string;
    displayName: string;
  }>;
  importance?: 'low' | 'medium' | 'high';
  isWeak?: boolean;
  isDuplicate?: boolean;
}

// スタイル付きコンポーネント
const DashboardContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  minHeight: '100vh',
  backgroundColor: theme.palette.grey[50],
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(['box-shadow', 'transform'], {
    duration: theme.transitions.duration.short,
  }),
  
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

const QuickActionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  cursor: 'pointer',
  transition: theme.transitions.create(['box-shadow', 'transform', 'background-color'], {
    duration: theme.transitions.duration.short,
  }),
  
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-1px)',
    backgroundColor: theme.palette.action.hover,
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: 'white',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[1],
}));

const AddPasswordFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  zIndex: theme.zIndex.fab,
}));

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPasswords, setRecentPasswords] = useState<PasswordItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // データの読み込み
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 統計情報の取得
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // 最近のパスワードの取得
      const passwordsResponse = await fetch('/api/passwords?recent=true&limit=6', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (passwordsResponse.ok) {
        const passwordsData = await passwordsResponse.json();
        setRecentPasswords(passwordsData.passwords || []);
      }
      
    } catch (error) {
      console.error('Dashboard data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/passwords?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add':
        router.push('/passwords/new');
        break;
      case 'search':
        router.push('/passwords');
        break;
      case 'members':
        router.push('/members');
        break;
      case 'history':
        router.push('/history');
        break;
      case 'settings':
        router.push('/settings');
        break;
      default:
        break;
    }
  };

  const handlePasswordClick = (passwordId: string) => {
    router.push(`/passwords/${passwordId}`);
  };

  if (loading) {
    return (
      <DashboardContainer>
        <Loading
          type="circular"
          size="large"
          message="ダッシュボードを読み込んでいます..."
        />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer maxWidth="lg">
      <Breadcrumbs items={CommonBreadcrumbs.Dashboard()} />
      
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          ダッシュボード
        </Typography>
        <Typography variant="body1" color="text.secondary">
          家族パスワード管理システム
        </Typography>
      </Box>

      {/* 統計情報 */}
      {stats && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <Security sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.totalPasswords}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                保存されたパスワード
              </Typography>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.recentlyAdded}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                今月追加
              </Typography>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.weakPasswords}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                脆弱なパスワード
              </Typography>
            </StatsCard>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <History sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.duplicatePasswords}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                重複パスワード
              </Typography>
            </StatsCard>
          </Grid>
        </Grid>
      )}

      {/* 検索バー */}
      <SearchContainer>
        <Input
          fullWidth
          placeholder="パスワードを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            endAdornment: (
              <IconButton onClick={handleSearch}>
                <Search />
              </IconButton>
            ),
          }}
        />
      </SearchContainer>

      <Grid container spacing={3}>
        {/* クイックアクション */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            クイックアクション
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <QuickActionCard onClick={() => handleQuickAction('add')}>
                <Box display="flex" flexDirection="column" alignItems="center" p={1}>
                  <Add sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    パスワード追加
                  </Typography>
                </Box>
              </QuickActionCard>
            </Grid>
            
            <Grid item xs={6}>
              <QuickActionCard onClick={() => handleQuickAction('search')}>
                <Box display="flex" flexDirection="column" alignItems="center" p={1}>
                  <Search sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    パスワード検索
                  </Typography>
                </Box>
              </QuickActionCard>
            </Grid>
            
            <Grid item xs={6}>
              <QuickActionCard onClick={() => handleQuickAction('members')}>
                <Box display="flex" flexDirection="column" alignItems="center" p={1}>
                  <People sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    家族管理
                  </Typography>
                </Box>
              </QuickActionCard>
            </Grid>
            
            <Grid item xs={6}>
              <QuickActionCard onClick={() => handleQuickAction('settings')}>
                <Box display="flex" flexDirection="column" alignItems="center" p={1}>
                  <Settings sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    設定
                  </Typography>
                </Box>
              </QuickActionCard>
            </Grid>
          </Grid>
        </Grid>

        {/* 最近のパスワード */}
        <Grid item xs={12} md={8}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              最近のパスワード
            </Typography>
            <Button
              variant="text"
              onClick={() => router.push('/passwords')}
            >
              すべて表示
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {recentPasswords.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Security sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    まだパスワードが登録されていません
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    最初のパスワードを追加してみましょう
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleQuickAction('add')}
                  >
                    パスワードを追加
                  </Button>
                </Paper>
              </Grid>
            ) : (
              recentPasswords.map((password) => (
                <Grid item xs={12} sm={6} key={password.id}>
                  <PasswordCard
                    serviceName={password.serviceName}
                    serviceUrl={password.serviceUrl}
                    serviceIcon={password.serviceIcon}
                    username={password.username}
                    lastUsed={password.lastUsed}
                    categories={password.categories}
                    importance={password.importance}
                    onClick={() => handlePasswordClick(password.id)}
                  />
                </Grid>
              ))
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* フローティングアクションボタン */}
      <AddPasswordFab
        color="primary"
        aria-label="パスワード追加"
        onClick={() => handleQuickAction('add')}
      >
        <Add />
      </AddPasswordFab>
    </DashboardContainer>
  );
};

export default Dashboard;