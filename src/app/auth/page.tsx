'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Security,
  Key,
  Dashboard,
  PhoneIphone,
  Computer,
} from '@mui/icons-material';
import { Button, Loading } from '@/components/ui';
import { styled } from '@mui/material/styles';

// スタイル付きコンポーネント
const AuthContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
}));

const AuthPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 600,
  width: '100%',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[8],
}));

const FeatureBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const AuthWelcome: React.FC = () => {
  const router = useRouter();

  // 既存の認証状態をチェック
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            router.push('/dashboard');
            return;
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
        }
        
        // 無効なトークンを削除
        localStorage.removeItem('authToken');
      }
    };

    checkAuthStatus();
  }, [router]);

  const handleStartAuth = () => {
    router.push('/auth/certificate');
  };

  const steps = [
    {
      label: 'クライアント証明書',
      description: 'デバイスにインストールされた証明書を選択',
      icon: <Security />,
    },
    {
      label: 'マスターパスワード',
      description: '暗号化キー生成用のマスターパスワードを入力',
      icon: <Key />,
    },
    {
      label: 'ダッシュボード',
      description: '認証完了後、パスワード管理画面にアクセス',
      icon: <Dashboard />,
    },
  ];

  return (
    <AuthContainer>
      <AuthPaper>
        <Box textAlign="center" mb={4}>
          <Security sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            家族パスワード管理システム
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            安全で便利な家族専用パスワード管理
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>初回ログインの方へ:</strong> 管理者から配布されたクライアント証明書を
            事前にデバイスにインストールしてください。
          </Typography>
        </Alert>

        <Typography variant="h6" gutterBottom>
          主な機能
        </Typography>
        
        <FeatureBox>
          <Security color="primary" />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Zero-Knowledge暗号化
            </Typography>
            <Typography variant="body2" color="text.secondary">
              サーバーには暗号化されたデータのみ保存され、平文は見えません
            </Typography>
          </Box>
        </FeatureBox>

        <FeatureBox>
          <PhoneIphone color="primary" />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              マルチデバイス対応
            </Typography>
            <Typography variant="body2" color="text.secondary">
              iPhone、iPad、Mac、Windowsなど様々なデバイスからアクセス可能
            </Typography>
          </Box>
        </FeatureBox>

        <FeatureBox>
          <Key color="primary" />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              パスワード自動生成
            </Typography>
            <Typography variant="body2" color="text.secondary">
              強力なパスワードの自動生成と安全な保存・管理
            </Typography>
          </Box>
        </FeatureBox>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          認証手順
        </Typography>
        
        <Stepper orientation="vertical" sx={{ mb: 3 }}>
          {steps.map((step, index) => (
            <Step key={step.label} active={true}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      color: 'white',
                    }}
                  >
                    {React.cloneElement(step.icon, { fontSize: 'small' })}
                  </Box>
                )}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            size="large"
            onClick={handleStartAuth}
            startIcon={<Security />}
            sx={{ minWidth: 200 }}
          >
            ログイン開始
          </Button>
        </Box>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            技術的な問題がある場合は、家族の管理者にお問い合わせください。
          </Typography>
        </Box>
      </AuthPaper>
    </AuthContainer>
  );
};

export default AuthWelcome;