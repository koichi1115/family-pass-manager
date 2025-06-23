import CryptoJS from 'crypto-js';
import { randomBytes } from 'crypto';

// 暗号化設定
const ALGORITHM = 'AES';
const KEY_SIZE = 256;
const IV_SIZE = 128;
const SALT_SIZE = 128;
const ITERATIONS = 100000;

// 暗号化されたデータの型定義
export interface EncryptedData {
  encrypted: string;
  salt: string;
  iv: string;
}

// パスワード情報の型定義
export interface PasswordData {
  username: string;
  password: string;
  additionalPasswords?: Array<{
    label: string;
    value: string;
    description?: string;
  }>;
  securityQuestions?: Array<{
    question: string;
    answer: string;
  }>;
  notes?: string;
  structuredData?: Record<string, any>;
}

// マスターパスワード検証用のハッシュ生成
export function generateMasterPasswordHash(masterPassword: string, salt?: string): {
  hash: string;
  salt: string;
} {
  const passwordSalt = salt || randomBytes(16).toString('hex');
  const hash = CryptoJS.PBKDF2(masterPassword, passwordSalt, {
    keySize: 256 / 32,
    iterations: ITERATIONS,
  }).toString();
  
  return { hash, salt: passwordSalt };
}

// マスターパスワードの検証
export function verifyMasterPassword(
  inputPassword: string,
  storedHash: string,
  storedSalt: string
): boolean {
  const { hash } = generateMasterPasswordHash(inputPassword, storedSalt);
  return hash === storedHash;
}

// 暗号化キーの生成
export function deriveEncryptionKey(masterPassword: string, salt: string): string {
  return CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: KEY_SIZE / 32,
    iterations: ITERATIONS,
  }).toString();
}

// データの暗号化
export function encryptData(data: PasswordData, masterPassword: string): EncryptedData {
  try {
    // ソルトとIVを生成
    const salt = CryptoJS.lib.WordArray.random(SALT_SIZE / 8).toString();
    const iv = CryptoJS.lib.WordArray.random(IV_SIZE / 8).toString();
    
    // 暗号化キーを生成
    const key = deriveEncryptionKey(masterPassword, salt);
    
    // データをJSON文字列に変換
    const jsonData = JSON.stringify(data);
    
    // AES-256-CBCで暗号化
    const encrypted = CryptoJS.AES.encrypt(jsonData, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
    
    return { encrypted, salt, iv };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('データの暗号化に失敗しました');
  }
}

// データの復号化
export function decryptData(
  encryptedData: EncryptedData,
  masterPassword: string
): PasswordData {
  try {
    const { encrypted, salt, iv } = encryptedData;
    
    // 暗号化キーを再生成
    const key = deriveEncryptionKey(masterPassword, salt);
    
    // 復号化
    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    
    // UTF-8文字列に変換
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error('復号化に失敗しました。マスターパスワードが正しくない可能性があります。');
    }
    
    // JSONパース
    return JSON.parse(decryptedString) as PasswordData;
  } catch (error) {
    console.error('Decryption failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('データの復号化に失敗しました');
  }
}

// セキュアなランダム文字列生成
export function generateSecureRandomString(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

// パスワード強度評価
export function evaluatePasswordStrength(password: string): {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
} {
  const feedback: string[] = [];
  let score = 0;
  
  // 長さチェック
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('8文字以上にしてください');
  }
  
  // 小文字チェック
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('小文字を含めてください');
  }
  
  // 大文字チェック
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('大文字を含めてください');
  }
  
  // 数字チェック
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('数字を含めてください');
  }
  
  // 特殊文字チェック
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('特殊文字を含めてください');
  }
  
  // 長さボーナス
  if (password.length >= 12) {
    score = Math.min(score + 1, 4);
  }
  
  // 最終スコア調整（0-4の範囲）
  score = Math.min(Math.max(score, 0), 4);
  
  const isStrong = score >= 3;
  
  if (isStrong && feedback.length === 0) {
    feedback.push('強力なパスワードです');
  }
  
  return { score, feedback, isStrong };
}

// セキュアなパスワード生成
export function generateSecurePassword(options: {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeSimilar?: boolean;
} = {}): string {
  const {
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = true,
  } = options;
  
  let chars = '';
  
  if (includeLowercase) {
    chars += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
  }
  
  if (includeUppercase) {
    chars += excludeSimilar ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  
  if (includeNumbers) {
    chars += excludeSimilar ? '23456789' : '0123456789';
  }
  
  if (includeSymbols) {
    chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }
  
  if (!chars) {
    throw new Error('少なくとも一つの文字種を選択してください');
  }
  
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  
  return password;
}

// ハッシュ値の検証（クライアント証明書用）
export function generateCertificateHash(certificateData: string): string {
  return CryptoJS.SHA256(certificateData).toString();
}

// セッショントークンの生成
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

// セキュアな比較（タイミング攻撃対策）
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}