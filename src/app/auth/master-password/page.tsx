'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  Link,
} from '@mui/material';
import {
  Key,
  Visibility,
  VisibilityOff,
  Security,
  Warning,
} from '@mui/icons-material';
import { Button, Input } from '@/components/ui';
import { styled } from '@mui/material/styles';
import { evaluatePasswordStrength } from '@/lib/crypto';

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
  maxWidth: 500,
  width: '100%',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[8],
}));

const SecurityNotice = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.info.light,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.info.main}`,
  marginBottom: theme.spacing(3),
}));

const MasterPasswordAuth: React.FC = () => {
  const router = useRouter();
  const [masterPassword, setMasterPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

  // パスワード強度の評価
  useEffect(() => {
    if (masterPassword.length > 0) {
      const strength = evaluatePasswordStrength(masterPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [masterPassword]);

  // ロック時間のカウントダウン
  useEffect(() => {
    if (isLocked && lockTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setLockTimeRemaining(lockTimeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLocked && lockTimeRemaining === 0) {
      setIsLocked(false);
      setAttempts(0);
    }
  }, [isLocked, lockTimeRemaining]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!masterPassword.trim()) {
      setError('マスターパスワードを入力してください。');
      return;
    }

    if (isLocked) {
      setError(`アカウントがロックされています。${lockTimeRemaining}秒後に再試行してください。`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // マスターパスワードの認証
      const response = await fetch('/api/auth/master-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          masterPassword,
          rememberDevice,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 認証成功
        localStorage.setItem('authToken', data.token);
        if (rememberDevice) {
          localStorage.setItem('deviceTrusted', 'true');
        }
        
        // ダッシュボードへリダイレクト
        router.push('/dashboard');
      } else {
        // 認証失敗
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          // 5回失敗でアカウントロック（30分）
          setIsLocked(true);
          setLockTimeRemaining(1800); // 30分
          setError('認証に5回失敗しました。アカウントが30分間ロックされます。');
        } else if (newAttempts >= 3) {
          // 3回以上失敗で警告
          setError(`マスターパスワードが正しくありません。残り${5 - newAttempts}回の試行でアカウントがロックされます。`);
        } else {
          setError('マスターパスワードが正しくありません。');
        }
      }
    } catch (err) {
      setError('認証中にエラーが発生しました。しばらく待ってから再試行してください。');
      console.error('Master password auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMasterPassword(e.target.value);
    if (error) setError(''); // エラーをクリア
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <AuthContainer>
      <AuthPaper>
        <Box textAlign="center" mb={3}>
          <Key sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            マスターパスワード
          </Typography>
          <Typography variant="body1" color="text.secondary">
            家族パスワード管理システムにアクセスするためのマスターパスワードを入力してください
          </Typography>
        </Box>

        <SecurityNotice>
          <Box display="flex" alignItems="flex-start" gap={1}>
            <Security color="info" />
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                セキュリティについて
              </Typography>
              <Typography variant="body2">
                マスターパスワードは暗号化キーの生成に使用されます。
                忘れた場合、保存されているパスワードにアクセスできなくなります。
              </Typography>
            </Box>
          </Box>
        </SecurityNotice>

        {error && (
          <Alert 
            severity={attempts >= 3 ? "error" : "warning"} 
            sx={{ mb: 2 }}
            icon={attempts >= 3 ? <Warning /> : undefined}
          >
            {error}
            {isLocked && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                ロック解除まで: {formatTime(lockTimeRemaining)}
              </Typography>
            )}
          </Alert>
        )}

        {attempts > 0 && !isLocked && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              認証試行回数: {attempts}/5回
            </Typography>
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Input
            fullWidth
            type="password"
            label="マスターパスワード"
            value={masterPassword}
            onChange={handlePasswordChange}
            showPasswordToggle
            strengthIndicator
            passwordStrength={passwordStrength}
            disabled={isLocked}
            autoFocus
            autoComplete="current-password"
            sx={{ mb: 3 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                disabled={isLocked}
              />
            }
            label="このデバイスを信頼する (30日間)"
            sx={{ mb: 3 }}
          />

          <Box display="flex" gap={2} justifyContent="flex-end" mb={2}>
            <Button
              variant="outlined"
              onClick={() => router.push('/auth/certificate')}
              disabled={loading || isLocked}
            >
              戻る
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={loading}
              disabled={!masterPassword.trim() || isLocked}
              fullWidth
            >
              ログイン
            </Button>
          </Box>
        </Box>

        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="text.secondary">
            マスターパスワードを忘れた場合は、
            <Link href="/auth/reset" underline="hover">
              アカウント復旧
            </Link>
            をご利用ください。
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>ヒント:</strong> マスターパスワードは他の家族メンバーと共有せず、
            安全な場所に保管してください。
          </Typography>
        </Alert>
      </AuthPaper>
    </AuthContainer>
  );
};

export default MasterPasswordAuth;