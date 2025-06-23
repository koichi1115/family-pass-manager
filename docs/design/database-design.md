# データベース設計書

## 1. データベース概要

### 1.1 使用技術
- **Database**: PlanetScale (MySQL 8.0互換)
- **ORM**: Prisma
- **Migration**: Prisma Migrate
- **Connection**: Prisma Client with Connection Pooling

### 1.2 設計原則
1. **正規化**: 3NF（第三正規形）に準拠
2. **セキュリティ**: 機密データは暗号化して保存
3. **監査性**: すべての変更を履歴として記録
4. **パフォーマンス**: 適切なインデックス設計
5. **拡張性**: 将来の機能追加に対応可能な設計

## 2. テーブル設計

### 2.1 ER図概要

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   family_members │────┤   passwords     │────┤   categories    │
│                 │     │                 │     │                 │
│ - id (PK)       │     │ - id (PK)       │     │ - id (PK)       │
│ - name          │     │ - owner_id (FK) │     │ - name          │
│ - role          │     │ - service_name  │     │ - color         │
│ - cert_hash     │     │ - encrypted_data│     │ - created_at    │
│ - created_at    │     │ - salt          │     └─────────────────┘
│ - updated_at    │     │ - iv            │              │
│ - is_active     │     │ - created_at    │              │
└─────────────────┘     │ - updated_at    │              │
         │               │ - is_deleted    │              │
         │               └─────────────────┘              │
         │                        │                       │
         │                        │               ┌───────▼──────────┐
         │                        │               │ password_categories│
         │                        │               │                   │
         │                        │               │ - password_id (FK)│
         │                        │               │ - category_id (FK)│
         │                        │               └───────────────────┘
         │                        │
         │                ┌───────▼──────────┐
         │                │ password_history │
         │                │                  │
         │                │ - id (PK)        │
         └────────────────┤ - password_id(FK)│
                          │ - changed_by(FK) │
                          │ - action_type    │
                          │ - old_data       │
                          │ - new_data       │
                          │ - change_reason  │
                          │ - changed_at     │
                          └──────────────────┘
```

### 2.2 テーブル詳細定義

#### 2.2.1 family_members（家族メンバー）

```sql
CREATE TABLE family_members (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role ENUM('father', 'mother', 'son', 'daughter', 'admin') NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  cert_hash VARCHAR(255) UNIQUE NOT NULL COMMENT 'クライアント証明書のハッシュ値',
  cert_expires_at TIMESTAMP NULL COMMENT '証明書有効期限',
  preferences JSON COMMENT 'ユーザー設定（UI設定、通知設定等）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP NULL,
  login_count INT DEFAULT 0,
  
  INDEX idx_cert_hash (cert_hash),
  INDEX idx_role (role),
  INDEX idx_active (is_active),
  INDEX idx_last_login (last_login_at)
);
```

#### 2.2.2 categories（カテゴリ）

```sql
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#1976d2' COMMENT 'カテゴリ表示色（HEX）',
  icon VARCHAR(50) COMMENT 'Material-UI アイコン名',
  sort_order INT DEFAULT 0,
  is_system BOOLEAN DEFAULT FALSE COMMENT 'システム定義カテゴリ',
  created_by VARCHAR(36) REFERENCES family_members(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  INDEX idx_name (name),
  INDEX idx_sort_order (sort_order),
  INDEX idx_active (is_active),
  INDEX idx_system (is_system)
);
```

#### 2.2.3 passwords（パスワード情報）

```sql
CREATE TABLE passwords (
  id VARCHAR(36) PRIMARY KEY,
  owner_id VARCHAR(36) NOT NULL REFERENCES family_members(id),
  service_name VARCHAR(200) NOT NULL,
  service_url VARCHAR(500),
  
  -- 暗号化されたデータ
  encrypted_data TEXT NOT NULL COMMENT 'AES暗号化されたパスワード情報JSON',
  salt VARCHAR(32) NOT NULL COMMENT '暗号化Salt',
  iv VARCHAR(32) NOT NULL COMMENT '暗号化IV',
  
  -- メタデータ
  importance ENUM('low', 'medium', 'high') DEFAULT 'medium',
  expires_at TIMESTAMP NULL COMMENT 'パスワード有効期限',
  last_used_at TIMESTAMP NULL COMMENT '最終使用日時',
  usage_count INT DEFAULT 0 COMMENT '使用回数',
  
  -- 共有設定
  is_shared BOOLEAN DEFAULT FALSE COMMENT '家族共有フラグ',
  shared_with JSON COMMENT '共有対象メンバーID配列',
  
  -- システム情報
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(36) NULL REFERENCES family_members(id),
  
  INDEX idx_owner (owner_id),
  INDEX idx_service (service_name),
  INDEX idx_importance (importance),
  INDEX idx_expires (expires_at),
  INDEX idx_shared (is_shared),
  INDEX idx_deleted (is_deleted),
  INDEX idx_created_at (created_at),
  INDEX idx_updated_at (updated_at),
  
  FULLTEXT idx_service_search (service_name, service_url)
);
```

#### 2.2.4 password_categories（パスワード-カテゴリ関連）

```sql
CREATE TABLE password_categories (
  password_id VARCHAR(36) NOT NULL REFERENCES passwords(id) ON DELETE CASCADE,
  category_id VARCHAR(36) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (password_id, category_id),
  INDEX idx_password (password_id),
  INDEX idx_category (category_id)
);
```

#### 2.2.5 password_history（パスワード変更履歴）

```sql
CREATE TABLE password_history (
  id VARCHAR(36) PRIMARY KEY,
  password_id VARCHAR(36) NOT NULL REFERENCES passwords(id) ON DELETE CASCADE,
  changed_by VARCHAR(36) NOT NULL REFERENCES family_members(id),
  
  action_type ENUM('create', 'update', 'delete', 'restore') NOT NULL,
  change_reason VARCHAR(500),
  
  -- 変更前後のデータ（暗号化済み）
  old_encrypted_data TEXT COMMENT '変更前の暗号化データ',
  new_encrypted_data TEXT COMMENT '変更後の暗号化データ',
  old_salt VARCHAR(32),
  new_salt VARCHAR(32),
  old_iv VARCHAR(32),
  new_iv VARCHAR(32),
  
  -- 変更項目の概要（検索用）
  changed_fields JSON COMMENT '変更されたフィールド一覧',
  
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_password (password_id),
  INDEX idx_changed_by (changed_by),
  INDEX idx_action_type (action_type),
  INDEX idx_changed_at (changed_at)
);
```

#### 2.2.6 user_sessions（ユーザーセッション）

```sql
CREATE TABLE user_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES family_members(id),
  session_token VARCHAR(255) NOT NULL UNIQUE,
  cert_fingerprint VARCHAR(255) NOT NULL COMMENT 'クライアント証明書フィンガープリント',
  
  -- セッション情報
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_info JSON COMMENT 'デバイス情報',
  
  -- セッション状態
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  INDEX idx_user (user_id),
  INDEX idx_token (session_token),
  INDEX idx_fingerprint (cert_fingerprint),
  INDEX idx_expires (expires_at),
  INDEX idx_active (is_active)
);
```

#### 2.2.7 system_logs（システムログ）

```sql
CREATE TABLE system_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NULL REFERENCES family_members(id),
  
  log_level ENUM('debug', 'info', 'warn', 'error', 'fatal') NOT NULL,
  event_type VARCHAR(100) NOT NULL COMMENT 'ログイベント種別',
  message TEXT NOT NULL,
  details JSON COMMENT '詳細情報',
  
  -- トレーシング情報
  request_id VARCHAR(36),
  session_id VARCHAR(36),
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user (user_id),
  INDEX idx_level (log_level),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at),
  INDEX idx_request_id (request_id)
);
```

## 3. 暗号化データ構造

### 3.1 encrypted_data フィールドの構造

```typescript
interface EncryptedPasswordData {
  // 基本情報
  username: string;
  password: string;
  
  // 追加パスワード（銀行の取引パスワード等）
  additional_passwords?: {
    label: string;      // "取引パスワード", "暗証番号" etc.
    value: string;
    description?: string;
  }[];
  
  // 秘密の質問
  security_questions?: {
    question: string;
    answer: string;
  }[];
  
  // その他メモ
  notes?: string;
  
  // 構造化メモ（将来拡張用）
  structured_data?: {
    [key: string]: any;
  };
}
```

### 3.2 preferences フィールドの構造

```typescript
interface UserPreferences {
  // UI設定
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: 'ja' | 'en';
    timezone: string;
    items_per_page: number;
    default_view: 'list' | 'grid' | 'card';
  };
  
  // 通知設定
  notifications: {
    password_expiry: boolean;
    new_entries: boolean;
    security_alerts: boolean;
    email_notifications: boolean;
  };
  
  // セキュリティ設定
  security: {
    auto_logout_minutes: number;
    require_reason_for_changes: boolean;
    mask_passwords_in_list: boolean;
  };
  
  // その他
  misc: {
    favorite_categories: string[];
    quick_access_passwords: string[];
  };
}
```

## 4. インデックス戦略

### 4.1 パフォーマンス重視のインデックス

```sql
-- 複合インデックス
CREATE INDEX idx_passwords_owner_service ON passwords(owner_id, service_name);
CREATE INDEX idx_passwords_shared_active ON passwords(is_shared, is_deleted, updated_at);
CREATE INDEX idx_history_password_date ON password_history(password_id, changed_at DESC);

-- 検索用インデックス
CREATE FULLTEXT INDEX idx_passwords_fulltext ON passwords(service_name, service_url);

-- 期限切れチェック用
CREATE INDEX idx_passwords_expiry ON passwords(expires_at, is_deleted) WHERE expires_at IS NOT NULL;
```

### 4.2 パーティショニング戦略（将来検討）

```sql
-- 履歴テーブルのパーティショニング（月別）
ALTER TABLE password_history 
PARTITION BY RANGE(MONTH(changed_at)) (
  PARTITION p202501 VALUES LESS THAN (2),
  PARTITION p202502 VALUES LESS THAN (3),
  -- ...
  PARTITION pmax VALUES LESS THAN MAXVALUE
);
```

## 5. データ移行・初期データ

### 5.1 初期カテゴリデータ

```sql
INSERT INTO categories (id, name, display_name, color, icon, is_system, sort_order) VALUES
('cat-banking', 'banking', '銀行・金融', '#1976d2', 'AccountBalance', true, 1),
('cat-ecommerce', 'ecommerce', 'ECサイト', '#f57c00', 'ShoppingCart', true, 2),
('cat-social', 'social', 'SNS', '#388e3c', 'Share', true, 3),
('cat-utility', 'utility', '公共料金', '#7b1fa2', 'ElectricBolt', true, 4),
('cat-entertainment', 'entertainment', 'エンタメ', '#e91e63', 'Movie', true, 5),
('cat-work', 'work', '業務関連', '#5d4037', 'Work', true, 6),
('cat-other', 'other', 'その他', '#616161', 'Category', true, 99);
```

### 5.2 管理者ユーザー作成

```sql
INSERT INTO family_members (id, name, role, display_name, cert_hash) VALUES
('admin-user', 'admin', 'admin', 'システム管理者', 'temp-hash-for-setup');
```

## 6. バックアップ・リストア戦略

### 6.1 バックアップポリシー

1. **自動バックアップ**: PlanetScale の自動バックアップ機能を使用
2. **定期エクスポート**: 週次でのデータエクスポート
3. **暗号化バックアップ**: エクスポートデータも暗号化して保存

### 6.2 災害復旧計画

1. **RTO（Recovery Time Objective）**: 4時間以内
2. **RPO（Recovery Point Objective）**: 1時間以内
3. **バックアップ保存期間**: 1年間
4. **テスト復旧**: 月次でのリストアテスト実行

## 7. セキュリティ考慮事項

### 7.1 データベースセキュリティ

1. **接続暗号化**: TLS 1.2以上での接続
2. **アクセス制御**: 最小権限の原則
3. **監査ログ**: すべてのDB操作をログ記録
4. **定期的な脆弱性スキャン**

### 7.2 データ保護

1. **暗号化**: 機密データの暗号化保存
2. **Key Management**: 暗号化キーの安全な管理
3. **データマスキング**: 開発環境での機密データマスキング
4. **論理削除**: 物理削除ではなく論理削除での対応

## 8. パフォーマンス最適化

### 8.1 クエリ最適化

```sql
-- 効率的なパスワード一覧取得
SELECT 
  p.id, p.service_name, p.importance, p.expires_at, p.updated_at,
  fm.display_name as owner_name,
  GROUP_CONCAT(c.display_name) as categories
FROM passwords p
LEFT JOIN family_members fm ON p.owner_id = fm.id
LEFT JOIN password_categories pc ON p.id = pc.password_id
LEFT JOIN categories c ON pc.category_id = c.id
WHERE p.is_deleted = FALSE
  AND (p.owner_id = ? OR p.is_shared = TRUE)
GROUP BY p.id
ORDER BY p.updated_at DESC
LIMIT ? OFFSET ?;
```

### 8.2 接続プール設定

```javascript
// Prisma 接続設定
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'error'],
});

// 接続プール設定例
// DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=10&pool_timeout=20"
```

---

## 次のステップ

1. **Prisma Schema作成** - 上記設計をPrismaスキーマファイルに落とし込み
2. **マイグレーションファイル生成** - 初期テーブル作成用マイグレーション
3. **シードデータ作成** - 初期カテゴリと管理者ユーザーのシードスクリプト
4. **データアクセス層実装** - PrismaClientを使用したCRUD操作の実装