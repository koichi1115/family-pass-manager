# API設計書 - 概要

## API概要

家族用パスワード管理システムのREST APIは、Next.js App Routerの`api/`ディレクトリに実装され、以下の機能を提供します。

## 基本設計原則

### 1. RESTfulな設計
- HTTP メソッドの適切な使用（GET, POST, PUT, DELETE）
- リソース指向のURL設計
- HTTPステータスコードの適切な使用

### 2. セキュリティファースト
- すべてのエンドポイントでクライアント証明書認証
- 機密データの暗号化
- レート制限とブルートフォース対策

### 3. 一貫性のあるレスポンス形式
- 統一されたJSONレスポンス構造
- エラーハンドリングの標準化
- 適切なHTTPヘッダー設定

## エンドポイント一覧

### 認証関連 (`/api/auth`)
| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/api/auth/certificate` | クライアント証明書検証 |
| POST | `/api/auth/session` | セッション作成 |
| GET | `/api/auth/session` | セッション検証 |
| DELETE | `/api/auth/session` | ログアウト |
| POST | `/api/auth/master-password` | マスターパスワード検証 |

### パスワード管理 (`/api/passwords`)
| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/passwords` | パスワード一覧取得 |
| POST | `/api/passwords` | パスワード作成 |
| GET | `/api/passwords/[id]` | パスワード詳細取得 |
| PUT | `/api/passwords/[id]` | パスワード更新 |
| DELETE | `/api/passwords/[id]` | パスワード削除 |
| GET | `/api/passwords/search` | パスワード検索 |

### 履歴管理 (`/api/history`)
| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/passwords/[id]/history` | 変更履歴取得 |
| POST | `/api/passwords/[id]/restore` | 履歴復元 |

### カテゴリ管理 (`/api/categories`)
| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/categories` | カテゴリ一覧取得 |
| POST | `/api/categories` | カテゴリ作成 |
| PUT | `/api/categories/[id]` | カテゴリ更新 |
| DELETE | `/api/categories/[id]` | カテゴリ削除 |

### 家族メンバー管理 (`/api/members`)
| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/members` | 家族メンバー一覧取得 |
| GET | `/api/members/me` | 現在のユーザー情報取得 |
| PUT | `/api/members/me` | ユーザー設定更新 |

### システム管理 (`/api/system`)
| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/api/system/health` | ヘルスチェック |
| GET | `/api/system/info` | システム情報取得 |

## 共通仕様

### リクエストヘッダー
```http
Content-Type: application/json
Authorization: Bearer {session_token}
X-Client-Cert: {client_certificate}
X-Request-ID: {unique_request_id}
```

### レスポンス形式

#### 成功レスポンス
```typescript
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    has_next?: boolean;
    has_prev?: boolean;
  };
  timestamp: string;
  request_id: string;
}
```

#### エラーレスポンス
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // エラーコード
    message: string;        // ユーザー向けメッセージ
    details?: any;          // 詳細情報
    field?: string;         // バリデーションエラー時のフィールド名
  };
  timestamp: string;
  request_id: string;
}
```

### HTTPステータスコード

| Code | 説明 | 使用場面 |
|------|------|----------|
| 200 | OK | 正常処理完了 |
| 201 | Created | リソース作成成功 |
| 204 | No Content | 削除成功・データなし |
| 400 | Bad Request | リクエストエラー |
| 401 | Unauthorized | 認証エラー |
| 403 | Forbidden | 認可エラー |
| 404 | Not Found | リソース未発見 |
| 409 | Conflict | リソース競合 |
| 422 | Unprocessable Entity | バリデーションエラー |
| 429 | Too Many Requests | レート制限 |
| 500 | Internal Server Error | サーバーエラー |

### エラーコード体系

#### 認証・認可エラー (AUTH_*)
- `AUTH_CERT_MISSING` - クライアント証明書なし
- `AUTH_CERT_INVALID` - クライアント証明書無効
- `AUTH_SESSION_EXPIRED` - セッション期限切れ
- `AUTH_MASTER_PASSWORD_REQUIRED` - マスターパスワード必要
- `AUTH_MASTER_PASSWORD_INVALID` - マスターパスワード無効

#### バリデーションエラー (VALIDATION_*)
- `VALIDATION_REQUIRED` - 必須項目エラー
- `VALIDATION_FORMAT` - フォーマットエラー
- `VALIDATION_LENGTH` - 長さエラー
- `VALIDATION_DUPLICATE` - 重複エラー

#### ビジネスロジックエラー (BUSINESS_*)
- `BUSINESS_PASSWORD_NOT_FOUND` - パスワード未発見
- `BUSINESS_ACCESS_DENIED` - アクセス拒否
- `BUSINESS_OPERATION_FAILED` - 操作失敗

#### システムエラー (SYSTEM_*)
- `SYSTEM_DATABASE_ERROR` - データベースエラー
- `SYSTEM_ENCRYPTION_ERROR` - 暗号化エラー
- `SYSTEM_RATE_LIMIT` - レート制限

### ページネーション

大量データの取得時は以下のパラメータを使用：

```typescript
interface PaginationParams {
  page?: number;     // ページ番号（1から開始）
  limit?: number;    // 1ページあたりの件数（デフォルト: 20, 最大: 100）
  sort?: string;     // ソートフィールド
  order?: 'asc' | 'desc'; // ソート順序
}
```

### フィルタリング・検索

```typescript
interface FilterParams {
  search?: string;        // フリーワード検索
  category?: string[];    // カテゴリフィルター
  owner?: string;         // 所有者フィルター
  importance?: 'low' | 'medium' | 'high'; // 重要度フィルター
  shared?: boolean;       // 共有フラグ
  expires_before?: string; // 期限切れ前
  created_after?: string;  // 作成日以降
}
```

## セキュリティ考慮事項

### 1. 認証・認可
- すべてのAPIでクライアント証明書検証
- セッショントークンによる認証
- マスターパスワードによる追加認証

### 2. データ保護
- 機密データのクライアントサイド暗号化
- HTTPSによる通信暗号化
- ログにおける機密情報のマスキング

### 3. 攻撃対策
- レート制限（IP・ユーザー単位）
- ブルートフォース攻撃対策
- SQLインジェクション対策
- XSS・CSRF対策

### 4. 監査ログ
- すべてのAPI呼び出しをログ記録
- 機密操作の詳細ログ
- 異常アクセスの検知・通知

## 開発・テスト環境

### 1. 開発環境
- ローカル開発: `http://localhost:3000/api`
- モックデータの使用
- 開発用クライアント証明書

### 2. ステージング環境
- URL: `https://staging.family-pass.example.com/api`
- 本番同等データでのテスト
- 自動テストの実行

### 3. 本番環境
- URL: `https://family-pass.example.com/api`
- 高可用性・パフォーマンス監視
- セキュリティ監視

## API使用例

### 基本的な認証フロー
```javascript
// 1. クライアント証明書でセッション作成
const session = await fetch('/api/auth/session', {
  method: 'POST',
  headers: {
    'X-Client-Cert': clientCert,
    'Content-Type': 'application/json'
  }
});

// 2. マスターパスワード検証
const masterAuth = await fetch('/api/auth/master-password', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    master_password: 'user-input-password'
  })
});

// 3. パスワード一覧取得
const passwords = await fetch('/api/passwords', {
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
    'X-Client-Cert': clientCert
  }
});
```

---

## 次のステップ

1. **詳細API仕様書作成** - 各エンドポイントの詳細仕様
2. **OpenAPI仕様書作成** - Swagger対応のAPI仕様
3. **API実装開始** - Next.js App Routerでの実装
4. **テストケース作成** - 単体・結合テストの作成