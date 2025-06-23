'use client';

import React, { useState, forwardRef } from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
  FormHelperText,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ContentCopy,
  CheckCircle,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// 拡張されたInputProps
export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
  showPasswordToggle?: boolean;
  showCopyButton?: boolean;
  strengthIndicator?: boolean;
  passwordStrength?: {
    score: number;
    feedback: string[];
    isStrong: boolean;
  };
}

// スタイル付きTextField
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: 2,
    },
  },
  
  '& .MuiInputLabel-root': {
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

// パスワード強度インジケーター
const StrengthIndicator = styled('div')<{ score: number }>(({ theme, score }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
  
  '& .strength-bar': {
    height: 4,
    flex: 1,
    borderRadius: 2,
    backgroundColor: theme.palette.grey[300],
    
    '&.active': {
      backgroundColor: 
        score <= 1 ? theme.palette.error.main :
        score === 2 ? theme.palette.warning.main :
        score === 3 ? theme.palette.info.main :
        theme.palette.success.main,
    },
  },
}));

export const Input = forwardRef<HTMLDivElement, InputProps>(({
  type = 'text',
  showPasswordToggle = false,
  showCopyButton = false,
  strengthIndicator = false,
  passwordStrength,
  error,
  helperText,
  value,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // パスワード表示切り替え
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  // コピー機能
  const handleCopy = async () => {
    if (value && typeof value === 'string') {
      try {
        await navigator.clipboard.writeText(value);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };
  
  // パスワード表示タイプ
  const inputType = 
    type === 'password' && showPasswordToggle && showPassword ? 'text' : type;
  
  // エンドアドーンメント
  const endAdornment = (showPasswordToggle || showCopyButton) ? (
    <InputAdornment position="end">
      {showCopyButton && (
        <IconButton
          onClick={handleCopy}
          edge="end"
          size="small"
          aria-label="コピー"
        >
          {copySuccess ? (
            <CheckCircle color="success" />
          ) : (
            <ContentCopy />
          )}
        </IconButton>
      )}
      {showPasswordToggle && type === 'password' && (
        <IconButton
          onClick={handleTogglePassword}
          edge="end"
          size="small"
          aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      )}
    </InputAdornment>
  ) : undefined;
  
  return (
    <>
      <StyledTextField
        {...props}
        ref={ref}
        type={inputType}
        value={value}
        error={error}
        variant="outlined"
        InputProps={{
          endAdornment,
          style: type === 'password' ? { fontFamily: 'monospace' } : undefined,
          ...props.InputProps,
        }}
        helperText={
          <>
            {helperText}
            {strengthIndicator && passwordStrength && (
              <div style={{ marginTop: 8 }}>
                <StrengthIndicator score={passwordStrength.score}>
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={index}
                      className={`strength-bar ${
                        index < passwordStrength.score ? 'active' : ''
                      }`}
                    />
                  ))}
                </StrengthIndicator>
                {passwordStrength.feedback.length > 0 && (
                  <FormHelperText>
                    {passwordStrength.feedback.join('、')}
                  </FormHelperText>
                )}
              </div>
            )}
          </>
        }
      />
    </>
  );
});

Input.displayName = 'Input';

export default Input;