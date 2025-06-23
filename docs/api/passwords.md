# パスワード管理API仕様書

## 概要

パスワード管理APIは、暗号化されたパスワード情報のCRUD操作、検索・フィルタリング機能を提供します。すべてのデータはクライアントサイドで暗号化されてから送受信されます。

## エンドポイント詳細

### 1. パスワード一覧取得

#### `GET /api/passwords`

**概要**: 認証されたユーザーがアクセス可能なパスワード情報の一覧を取得します。

**リクエスト**:
```http
GET /api/passwords?page=1&limit=20&sort=updated_at&order=desc&search=銀行&category=banking&owner=father&shared=true&importance=high
Authorization: Bearer {session_token}
X-Client-Cert: {base64_encoded_certificate}
```

**クエリパラメータ**:
```typescript
interface PasswordListParams {
  // ページネーション
  page?: number;          // ページ番号（デフォルト: 1）
  limit?: number;         // 1ページあたりの件数（デフォルト: 20, 最大: 100）
  
  // ソート
  sort?: 'service_name' | 'updated_at' | 'created_at' | 'importance' | 'expires_at';
  order?: 'asc' | 'desc'; // デフォルト: desc
  
  // フィルタリング
  search?: string;        // サービス名・メモでの部分一致検索
  category?: string[];    // カテゴリフィルター（複数指定可能）
  owner?: string;         // 所有者フィルター
  shared?: boolean;       // 共有パスワードのみ
  importance?: 'low' | 'medium' | 'high'; // 重要度フィルター
  expires_before?: string; // 指定日時より前に期限切れ（ISO 8601）
  created_after?: string;  // 指定日時以降に作成（ISO 8601）
  has_additional_fields?: boolean; // 追加項目を持つもののみ
}
```

**レスポンス**:
```typescript
// 成功時 (200)
{
  "success": true,
  "data": [
    {
      "id": "pwd_abc123",
      "service_name": "みずほ銀行",
      "service_url": "https://www.mizuhobank.co.jp/",
      "owner": {
        "id": "user-123",
        "name": "father",
        "display_name": "お父さん"
      },
      "categories": [
        {
          "id": "cat-banking",
          "name": "banking",
          "display_name": "銀行・金融",
          "color": "#1976d2"
        }
      ],
      "importance": "high",
      "is_shared": false,
      "expires_at": "2025-06-23T00:00:00Z",
      "last_used_at": "2024-06-20T10:30:00Z",
      "usage_count": 15,
      "has_additional_fields": true,
      "encrypted_data": "AES暗号化されたデータ",
      "salt": "暗号化用ソルト",
      "iv": "暗号化用IV",
      "created_at": "2024-01-15T09:00:00Z",
      "updated_at": "2024-06-15T14:20:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  },
  "timestamp": "2024-06-23T12:00:00Z",
  "request_id": "req_abc123"
}
```

**実装例**:
```typescript
// src/app/api/passwords/route.ts
export async function GET(request: NextRequest) {
  const { user } = await validateSession(request);
  const params = parseQueryParams(request.nextUrl.searchParams);
  
  const passwords = await prisma.passwords.findMany({
    where: {
      AND: [
        { isDeleted: false },
        {
          OR: [
            { ownerId: user.id },
            { isShared: true, sharedWith: { array_contains: user.id } }
          ]
        },
        // フィルター条件を動的に追加
        ...buildFilterConditions(params)
      ]
    },
    include: {
      owner: true,
      categories: { include: { category: true } }
    },
    orderBy: { [params.sort]: params.order },
    skip: (params.page - 1) * params.limit,
    take: params.limit
  });

  return NextResponse.json({
    success: true,
    data: passwords.map(formatPasswordResponse),
    meta: await getPaginationMeta(params)
  });
}
```

---

### 2. パスワード作成

#### `POST /api/passwords`

**概要**: 新しいパスワード情報を作成します。

**リクエスト**:
```http
POST /api/passwords
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "service_name": "楽天銀行",
  "service_url": "https://www.rakuten-bank.co.jp/",
  "encrypted_data": "AES暗号化されたパスワードデータ",
  "salt": "暗号化用ソルト",
  "iv": "暗号化用IV",
  "categories": ["cat-banking"],
  "importance": "high",
  "expires_at": "2025-06-23T00:00:00Z",
  "is_shared": false,
  "shared_with": [],
  "notes": "メインの給与振込口座"
}
```

**リクエストボディ**:
```typescript
interface CreatePasswordRequest {
  service_name: string;           // サービス名（必須）
  service_url?: string;           // サービスURL
  encrypted_data: string;         // 暗号化されたパスワードデータ（必須）
  salt: string;                   // 暗号化用ソルト（必須）
  iv: string;                     // 暗号化用IV（必須）
  categories?: string[];          // カテゴリID配列
  importance?: 'low' | 'medium' | 'high'; // 重要度（デフォルト: medium）
  expires_at?: string;            // 有効期限（ISO 8601）
  is_shared?: boolean;            // 共有フラグ（デフォルト: false）
  shared_with?: string[];         // 共有対象ユーザーID配列
  notes?: string;                 // メモ
}
```

**暗号化データ形式**:
```typescript
// encrypted_dataの復号化後の構造
interface DecryptedPasswordData {
  username: string;               // ユーザー名・ID
  password: string;               // メインパスワード
  additional_passwords?: {        // 追加パスワード
    label: string;                // "取引パスワード", "暗証番号" etc.
    value: string;
    description?: string;
  }[];
  security_questions?: {          // 秘密の質問
    question: string;
    answer: string;
  }[];
  notes?: string;                 // その他メモ
  structured_data?: {             // 将来拡張用
    [key: string]: any;
  };
}
```

**レスポンス**:
```typescript
// 成功時 (201)
{
  "success": true,
  "data": {
    "id": "pwd_xyz789",
    "service_name": "楽天銀行",
    "service_url": "https://www.rakuten-bank.co.jp/",
    "owner": {
      "id": "user-123",
      "name": "father",
      "display_name": "お父さん"
    },
    "categories": [...],
    "importance": "high",
    "is_shared": false,
    "expires_at": "2025-06-23T00:00:00Z",
    "created_at": "2024-06-23T12:00:00Z",
    "updated_at": "2024-06-23T12:00:00Z"
  },
  "timestamp": "2024-06-23T12:00:00Z",
  "request_id": "req_def456"
}

// バリデーションエラー (422)
{
  "success": false,
  "error": {
    "code": "VALIDATION_REQUIRED",
    "message": "必須項目が入力されていません",
    "details": {
      "field": "service_name",
      "message": "サービス名は必須です"
    }
  }
}
```

---

### 3. パスワード詳細取得

#### `GET /api/passwords/[id]`

**概要**: 指定されたパスワード情報の詳細を取得します。

**リクエスト**:
```http
GET /api/passwords/pwd_abc123
Authorization: Bearer {session_token}
```

**レスポンス**:
```typescript
// 成功時 (200)
{
  "success": true,
  "data": {
    "id": "pwd_abc123",
    "service_name": "みずほ銀行",
    "service_url": "https://www.mizuhobank.co.jp/",
    "owner": {
      "id": "user-123",
      "name": "father",
      "display_name": "お父さん"
    },
    "categories": [...],
    "importance": "high",
    "is_shared": false,
    "expires_at": "2025-06-23T00:00:00Z",
    "last_used_at": "2024-06-20T10:30:00Z",
    "usage_count": 15,
    "encrypted_data": "AES暗号化されたデータ",
    "salt": "暗号化用ソルト",
    "iv": "暗号化用IV",
    "created_at": "2024-01-15T09:00:00Z",
    "updated_at": "2024-06-15T14:20:00Z",
    "access_history": [
      {
        "accessed_at": "2024-06-20T10:30:00Z",
        "accessed_by": {
          "id": "user-123",
          "display_name": "お父さん"
        },
        "action": "view"
      }
    ]
  }
}

// アクセス権限なし (403)
{
  "success": false,
  "error": {
    "code": "BUSINESS_ACCESS_DENIED",
    "message": "このパスワード情報にアクセスする権限がありません"
  }
}
```

---

### 4. パスワード更新

#### `PUT /api/passwords/[id]`

**概要**: 既存のパスワード情報を更新します。

**リクエスト**:
```http
PUT /api/passwords/pwd_abc123
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "service_name": "みずほ銀行（更新）",
  "encrypted_data": "新しく暗号化されたデータ",
  "salt": "新しい暗号化用ソルト",
  "iv": "新しい暗号化用IV",
  "change_reason": "パスワード変更のため",
  "categories": ["cat-banking"],
  "importance": "high",
  "expires_at": "2026-06-23T00:00:00Z"
}
```

**リクエストボディ**:
```typescript
interface UpdatePasswordRequest {
  service_name?: string;
  service_url?: string;
  encrypted_data?: string;        // 更新する場合は salt, iv も必須
  salt?: string;
  iv?: string;
  categories?: string[];
  importance?: 'low' | 'medium' | 'high';
  expires_at?: string;
  is_shared?: boolean;
  shared_with?: string[];
  notes?: string;
  change_reason: string;          // 変更理由（必須）
}
```

**レスポンス**:
```typescript
// 成功時 (200)
{
  "success": true,
  "data": {
    "id": "pwd_abc123",
    "service_name": "みずほ銀行（更新）",
    // ... その他の更新されたフィールド
    "updated_at": "2024-06-23T12:00:00Z"
  }
}
```

---

### 5. パスワード削除

#### `DELETE /api/passwords/[id]`

**概要**: パスワード情報を削除します（論理削除）。

**リクエスト**:
```http
DELETE /api/passwords/pwd_abc123
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "delete_reason": "サービス解約のため"
}
```

**レスポンス**:
```typescript
// 成功時 (204)
// No Content

// 既に削除済み (404)
{
  "success": false,
  "error": {
    "code": "BUSINESS_PASSWORD_NOT_FOUND",
    "message": "指定されたパスワード情報が見つかりません"
  }
}
```

---

### 6. パスワード検索

#### `GET /api/passwords/search`

**概要**: 高度な検索条件でパスワード情報を検索します。

**リクエスト**:
```http
GET /api/passwords/search?q=銀行&fuzzy=true&fields=service_name,notes&category=banking&owner=father&limit=10
Authorization: Bearer {session_token}
```

**クエリパラメータ**:
```typescript
interface SearchParams {
  q: string;                      // 検索クエリ（必須）
  fuzzy?: boolean;               // あいまい検索（デフォルト: false）
  fields?: string[];             // 検索対象フィールド
  category?: string[];           // カテゴリフィルター
  owner?: string;                // 所有者フィルター
  importance?: string;           // 重要度フィルター
  date_range?: {                 // 日付範囲
    from: string;
    to: string;
  };
  limit?: number;                // 結果件数制限
}
```

**レスポンス**:
```typescript
// 成功時 (200)
{
  "success": true,
  "data": {
    "results": [...],             // 検索結果（パスワード一覧と同じ形式）
    "total": 15,
    "query": "銀行",
    "search_time_ms": 45,
    "suggestions": [              // 検索候補
      "銀行口座",
      "ネット銀行",
      "銀行カード"
    ]
  }
}
```

---

### 7. パスワード使用記録

#### `POST /api/passwords/[id]/access`

**概要**: パスワード情報への アクセスを記録します。

**リクエスト**:
```http
POST /api/passwords/pwd_abc123/access
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "action": "view",
  "device_info": {
    "platform": "iPhone",
    "user_agent": "Mozilla/5.0..."
  }
}
```

**レスポンス**:
```typescript
// 成功時 (201)
{
  "success": true,
  "data": {
    "access_logged": true,
    "usage_count": 16,
    "last_used_at": "2024-06-23T12:00:00Z"
  }
}
```

---

## 暗号化・復号化フロー

### クライアントサイド暗号化

```typescript
// クライアントサイドでの暗号化処理
import CryptoJS from 'crypto-js';

class PasswordCrypto {
  static async encryptPasswordData(
    data: DecryptedPasswordData, 
    masterPassword: string
  ): Promise<EncryptedData> {
    // ソルトとIVを生成
    const salt = CryptoJS.lib.WordArray.random(128/8).toString();
    const iv = CryptoJS.lib.WordArray.random(128/8).toString();
    
    // マスターパスワードからキーを派生
    const key = CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256/32,
      iterations: 100000
    });
    
    // データを暗号化
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data), 
      key, 
      {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    ).toString();
    
    return { encrypted, salt, iv };
  }
  
  static async decryptPasswordData(
    encryptedData: string,
    salt: string,
    iv: string,
    masterPassword: string
  ): Promise<DecryptedPasswordData> {
    // キーを再生成
    const key = CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256/32,
      iterations: 100000
    });
    
    // データを復号化
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData, 
      key, 
      {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  }
}
```

## バリデーション

### サーバーサイドバリデーション

```typescript
// src/lib/validations/password.ts
import { z } from 'zod';

export const CreatePasswordSchema = z.object({
  service_name: z.string()
    .min(1, 'サービス名は必須です')
    .max(200, 'サービス名は200文字以内で入力してください'),
    
  service_url: z.string()
    .url('有効なURLを入力してください')
    .optional(),
    
  encrypted_data: z.string()
    .min(1, '暗号化データは必須です'),
    
  salt: z.string()
    .length(32, 'ソルトは32文字である必要があります'),
    
  iv: z.string()
    .length(32, 'IVは32文字である必要があります'),
    
  categories: z.array(z.string().uuid())
    .optional(),
    
  importance: z.enum(['low', 'medium', 'high'])
    .default('medium'),
    
  expires_at: z.string()
    .datetime('有効な日時形式で入力してください')
    .optional(),
    
  is_shared: z.boolean()
    .default(false),
    
  shared_with: z.array(z.string().uuid())
    .optional(),
    
  notes: z.string()
    .max(1000, 'メモは1000文字以内で入力してください')
    .optional()
});

export const UpdatePasswordSchema = CreatePasswordSchema.partial().extend({
  change_reason: z.string()
    .min(1, '変更理由は必須です')
    .max(500, '変更理由は500文字以内で入力してください')
});
```

## エラーハンドリング

### パスワード管理エラーコード

| コード | メッセージ | HTTP Status | 説明 |
|--------|------------|-------------|------|
| `PASSWORD_NOT_FOUND` | パスワード情報が見つかりません | 404 | 指定IDのパスワードなし |
| `PASSWORD_ACCESS_DENIED` | アクセス権限がありません | 403 | 閲覧・編集権限なし |
| `PASSWORD_ALREADY_EXISTS` | 同じサービスのパスワードが既に存在します | 409 | 重複登録 |
| `PASSWORD_ENCRYPTED_DATA_INVALID` | 暗号化データが無効です | 422 | 暗号化データ破損 |
| `PASSWORD_CATEGORY_NOT_FOUND` | 指定されたカテゴリが見つかりません | 404 | 無効なカテゴリID |
| `PASSWORD_SHARED_WITH_INVALID` | 共有対象ユーザーが無効です | 422 | 無効な共有設定 |
| `PASSWORD_CHANGE_REASON_REQUIRED` | 変更理由は必須です | 422 | 更新時の変更理由なし |

## セキュリティ考慮事項

### 1. データアクセス制御

```typescript
// アクセス権限チェック
export async function checkPasswordAccess(
  passwordId: string, 
  userId: string, 
  action: 'read' | 'write' | 'delete'
): Promise<boolean> {
  const password = await prisma.passwords.findUnique({
    where: { id: passwordId },
    include: { sharedWith: true }
  });
  
  if (!password || password.isDeleted) {
    return false;
  }
  
  // 所有者は全権限
  if (password.ownerId === userId) {
    return true;
  }
  
  // 共有パスワードの場合
  if (password.isShared) {
    const hasAccess = password.sharedWith.some(share => 
      share.userId === userId && share.permission >= getRequiredPermission(action)
    );
    return hasAccess;
  }
  
  return false;
}
```

### 2. 監査ログ

```typescript
// パスワード操作のログ記録
export async function logPasswordAccess(
  passwordId: string,
  userId: string,
  action: string,
  details?: any
) {
  await prisma.systemLogs.create({
    data: {
      userId,
      logLevel: 'info',
      eventType: 'password_access',
      message: `Password ${action}: ${passwordId}`,
      details: {
        password_id: passwordId,
        action,
        ...details
      },
      ipAddress: getClientIP(),
      userAgent: getUserAgent()
    }
  });
}
```

---

## テストケース

### 単体テスト

```typescript
describe('Password API', () => {
  describe('POST /api/passwords', () => {
    it('should create password with valid data', async () => {
      const passwordData = {
        service_name: 'テスト銀行',
        encrypted_data: 'encrypted_test_data',
        salt: 'a'.repeat(32),
        iv: 'b'.repeat(32)
      };
      
      const response = await request(app)
        .post('/api/passwords')
        .set('Authorization', `Bearer ${validToken}`)
        .send(passwordData)
        .expect(201);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.service_name).toBe('テスト銀行');
    });
    
    it('should reject invalid encryption data', async () => {
      const invalidData = {
        service_name: 'テスト銀行',
        encrypted_data: '',  // 空文字は無効
        salt: 'short',       // 長さ不足
        iv: 'b'.repeat(32)
      };
      
      const response = await request(app)
        .post('/api/passwords')
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidData)
        .expect(422);
        
      expect(response.body.error.code).toBe('VALIDATION_REQUIRED');
    });
  });
});
```

---

次はカテゴリ管理APIと履歴管理APIの仕様書を作成し、OpenAPI仕様書に統合します。