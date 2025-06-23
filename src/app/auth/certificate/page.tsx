'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import {
  Security,
  Smartphone,
  Computer,
  CheckCircle,
  Error,
  Info,
  Refresh,
} from '@mui/icons-material';
import { Button, Loading } from '@/components/ui';
import { styled } from '@mui/material/styles';

// クライアント証明書情報の型
interface ClientCertificate {
  id: string;
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  fingerprint: string;
  deviceType: 'mobile' | 'desktop';
  isValid: boolean;
}

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

const CertificateList = styled(List)(({ theme }) => ({
  marginTop: theme.spacing(2),
  '& .MuiListItem-root': {
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    
    '&.selected': {
      backgroundColor: theme.palette.primary.light,
      borderColor: theme.palette.primary.main,
    },
  },
}));

const CertificateSelect: React.FC = () => {
  const router = useRouter();
  const [certificates, setCertificates] = useState<ClientCertificate[]>([]);
  const [selectedCertId, setSelectedCertId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);

  // 証明書一覧の取得
  useEffect(() => {
    loadClientCertificates();
  }, []);

  const loadClientCertificates = async () => {
    try {
      setLoading(true);
      setError('');

      // Web Crypto APIで証明書を取得（実装時は実際のAPI）
      const mockCertificates: ClientCertificate[] = [
        {
          id: 'cert-1',
          subject: 'CN=田中太郎のiPhone',
          issuer: 'CN=家族証明書CA',
          validFrom: new Date('2024-01-01'),
          validTo: new Date('2025-12-31'),
          fingerprint: 'SHA1:12:34:56:78:90:AB:CD:EF',
          deviceType: 'mobile',
          isValid: true,
        },
        {
          id: 'cert-2',
          subject: 'CN=田中花子のMacBook',
          issuer: 'CN=家族証明書CA',
          validFrom: new Date('2024-01-01'),
          validTo: new Date('2025-12-31'),
          fingerprint: 'SHA1:AB:CD:EF:12:34:56:78:90',
          deviceType: 'desktop',
          isValid: true,
        },
      ];

      // 証明書の有効性をチェック
      const validatedCerts = mockCertificates.map(cert => ({
        ...cert,
        isValid: cert.validTo > new Date(),
      }));

      setCertificates(validatedCerts);
    } catch (err) {
      setError('証明書の読み込みに失敗しました。ブラウザで証明書が正しくインストールされているか確認してください。');
      console.error('Certificate loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateSelect = (certId: string) => {
    setSelectedCertId(certId);
  };

  const handleContinue = async () => {
    if (!selectedCertId) return;

    try {
      setIsValidating(true);
      
      // 証明書の検証（実装時は実際のAPI）
      const response = await fetch('/api/auth/certificate/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateId: selectedCertId,
        }),
      });

      if (response.ok) {
        // マスターパスワード入力画面へ
        router.push('/auth/master-password');
      } else {
        setError('証明書の認証に失敗しました。');
      }
    } catch (err) {
      setError('認証中にエラーが発生しました。');
      console.error('Certificate validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    return deviceType === 'mobile' ? <Smartphone /> : <Computer />;
  };

  const getStatusChip = (cert: ClientCertificate) => {
    if (!cert.isValid) {
      return <Chip label="期限切れ" color="error" size="small" />;
    }
    
    const daysUntilExpiry = Math.floor(
      (cert.validTo.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilExpiry < 30) {
      return <Chip label={`${daysUntilExpiry}日後期限切れ`} color="warning" size="small" />;
    }
    
    return <Chip label="有効" color="success" size="small" />;
  };

  if (loading) {
    return (
      <AuthContainer>
        <Loading
          type="circular"
          size="large"
          message="証明書を読み込んでいます..."
        />
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <AuthPaper>
        <Box textAlign="center" mb={3}>
          <Security sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            クライアント証明書を選択
          </Typography>
          <Typography variant="body1" color="text.secondary">
            認証に使用する証明書を選択してください
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {certificates.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              利用可能な証明書が見つかりません。<br />
              デバイスに証明書がインストールされていることを確認してください。
            </Typography>
            <Button
              startIcon={<Refresh />}
              onClick={loadClientCertificates}
              sx={{ mt: 2 }}
            >
              再読み込み
            </Button>
          </Alert>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              利用可能な証明書 ({certificates.length}件)
            </Typography>
            
            <CertificateList>
              {certificates.map((cert) => (
                <ListItem
                  key={cert.id}
                  className={selectedCertId === cert.id ? 'selected' : ''}
                  disablePadding
                >
                  <ListItemButton
                    onClick={() => handleCertificateSelect(cert.id)}
                    disabled={!cert.isValid}
                  >
                    <ListItemIcon>
                      {getDeviceIcon(cert.deviceType)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            {cert.subject.replace('CN=', '')}
                          </Typography>
                          {getStatusChip(cert)}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            発行者: {cert.issuer.replace('CN=', '')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            有効期限: {cert.validTo.toLocaleDateString('ja-JP')}
                          </Typography>
                        </Box>
                      }
                    />
                    {selectedCertId === cert.id && (
                      <CheckCircle color="primary" />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </CertificateList>

            <Divider sx={{ my: 3 }} />

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => router.back()}
              >
                戻る
              </Button>
              <Button
                variant="contained"
                onClick={handleContinue}
                disabled={!selectedCertId || isValidating}
                loading={isValidating}
              >
                続行
              </Button>
            </Box>
          </>
        )}

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>注意:</strong> 証明書は家族メンバーごとに発行されます。
            適切な証明書を選択してください。
          </Typography>
        </Alert>
      </AuthPaper>
    </AuthContainer>
  );
};

export default CertificateSelect;