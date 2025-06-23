# ディレクトリ構成設計書

## 設計原則

1. **関心の分離**: 機能ごとにディレクトリを分離
2. **スケーラビリティ**: 将来の機能追加に対応可能な構造
3. **保守性**: 開発者が直感的に理解できる構成
4. **Next.js App Router**: Next.js 14のApp Routerに準拠
5. **TypeScript**: 型安全性を重視した構成

## 詳細説明

### `/src` - ソースコードディレクトリ

#### `/src/app` - Next.js App Router
```
app/
├── (auth)/                 # 認証関連ページグループ
│   ├── login/             # ログインページ
│   ├── setup/             # 初期セットアップ
│   └── layout.tsx         # 認証レイアウト
├── (dashboard)/           # メインアプリページグループ  
│   ├── passwords/         # パスワード管理画面
│   ├── history/           # 履歴管理画面
│   ├── settings/          # 設定画面
│   └── layout.tsx         # ダッシュボードレイアウト
├── api/                   # API Routes
│   ├── auth/             # 認証API
│   ├── passwords/        # パスワード管理API
│   └── health/           # ヘルスチェック
├── globals.css           # グローバルスタイル
├── layout.tsx            # ルートレイアウト
└── page.tsx              # ホームページ
```

#### `/src/components` - Reactコンポーネント
```
components/
├── ui/                   # 汎用UIコンポーネント
│   ├── Button.tsx       # ボタン
│   ├── Input.tsx        # 入力フィールド
│   ├── Modal.tsx        # モーダル
│   ├── Card.tsx         # カード
│   └── Loading.tsx      # ローディング
├── forms/               # フォーム関連
│   ├── PasswordForm.tsx # パスワード登録フォーム
│   ├── SearchForm.tsx   # 検索フォーム
│   └── LoginForm.tsx    # ログインフォーム
├── layout/              # レイアウト関連
│   ├── Header.tsx       # ヘッダー
│   ├── Sidebar.tsx      # サイドバー
│   ├── Navigation.tsx   # ナビゲーション
│   └── Footer.tsx       # フッター
├── auth/                # 認証関連
│   ├── ClientCertAuth.tsx     # クライアント証明書認証
│   ├── MasterPasswordInput.tsx # マスターパスワード入力
│   └── FamilyMemberSelector.tsx # 家族メンバー選択
├── password/            # パスワード管理関連
│   ├── PasswordList.tsx # パスワード一覧
│   ├── PasswordCard.tsx # パスワードカード
│   ├── PasswordDetail.tsx # パスワード詳細
│   └── CategoryFilter.tsx # カテゴリフィルター
└── history/             # 履歴管理関連
    ├── HistoryViewer.tsx # 履歴表示
    ├── HistoryDiff.tsx   # 差分表示
    └── HistoryRestore.tsx # 復元機能
```

#### `/src/lib` - ユーティリティライブラリ
```
lib/
├── auth.ts              # 認証関連ユーティリティ
├── crypto.ts            # 暗号化・復号化
├── db.ts                # データベース接続・操作
├── utils.ts             # 汎用ユーティリティ
├── validations.ts       # バリデーションスキーマ
├── constants.ts         # 定数定義
├── api-client.ts        # APIクライアント
└── logger.ts            # ログ出力
```

#### `/src/store` - 状態管理 (Zustand)
```
store/
├── auth.ts              # 認証状態
├── passwords.ts         # パスワード管理状態
├── ui.ts                # UI状態（モーダル、ローディング等）
├── settings.ts          # ユーザー設定
└── index.ts             # ストア統合
```

#### `/src/types` - TypeScript型定義
```
types/
├── auth.ts              # 認証関連型
├── password.ts          # パスワード関連型
├── user.ts              # ユーザー関連型
├── api.ts               # API関連型
├── database.ts          # データベース関連型
└── common.ts            # 共通型
```

### `/docs` - ドキュメントディレクトリ

```
docs/
├── dev-journal.md       # 開発日誌
├── design/              # 設計書
│   ├── requirements.md  # 要件定義書
│   ├── system-design.md # システム設計書
│   └── database-design.md # データベース設計書
├── api/                 # API仕様書
│   ├── auth.md         # 認証API
│   ├── passwords.md    # パスワード管理API
│   └── openapi.yaml    # OpenAPI仕様
└── ui/                  # UI/UX設計書
    ├── wireframes.md   # ワイヤーフレーム
    ├── design-system.md # デザインシステム
    └── user-flow.md    # ユーザーフロー
```

### `/prisma` - データベース関連

```
prisma/
├── schema.prisma        # Prismaスキーマ定義
├── migrations/          # マイグレーションファイル
│   └── 20240623000000_init/
│       └── migration.sql
└── seeds/               # シードデータ
    ├── categories.ts    # カテゴリデータ
    ├── admin-user.ts    # 管理者ユーザー
    └── index.ts         # シード実行
```

### `/tests` - テストディレクトリ

```
tests/
├── __mocks__/           # モックファイル
│   ├── prisma.ts       # Prismaモック
│   └── next-auth.ts    # NextAuthモック
├── api/                 # APIテスト
│   ├── auth.test.ts    # 認証APIテスト
│   └── passwords.test.ts # パスワードAPIテスト
├── components/          # コンポーネントテスト
│   ├── PasswordForm.test.tsx
│   └── PasswordList.test.tsx
├── utils/               # ユーティリティテスト
│   ├── crypto.test.ts  # 暗号化テスト
│   └── validation.test.ts # バリデーションテスト
├── setup.ts             # テストセットアップ
└── jest.config.js       # Jest設定
```

### `/scripts` - 運用スクリプト

```
scripts/
├── setup.sh             # 初期セットアップ
├── deploy.sh            # デプロイスクリプト
├── backup.sh            # データベースバックアップ
├── restore.sh           # データベース復元
├── generate-certs.sh    # 証明書生成
└── health-check.sh      # ヘルスチェック
```

### `/.github` - GitHub設定

```
.github/
├── workflows/           # GitHub Actions
│   ├── ci.yml          # CI/CDワークフロー
│   ├── deploy.yml      # デプロイワークフロー
│   └── security.yml    # セキュリティスキャン
└── ISSUE_TEMPLATE/      # Issue テンプレート
    ├── bug-report.md   # バグレポート
    ├── feature-request.md # 機能要求
    └── security.md     # セキュリティ報告
```

## ファイル命名規則

### コンポーネント
- **PascalCase**: `PasswordForm.tsx`, `UserProfile.tsx`
- **拡張子**: React コンポーネントは `.tsx`

### ユーティリティ・関数
- **camelCase**: `auth.ts`, `apiClient.ts`
- **拡張子**: TypeScript ファイルは `.ts`

### ページ・API Routes
- **kebab-case**: Next.js App Routerのフォルダ名
- **page.tsx**: ページコンポーネント
- **route.ts**: API Route ハンドラー

### テストファイル
- **元ファイル名.test.拡張子**: `auth.test.ts`, `Button.test.tsx`
- **__tests__**: テスト専用ディレクトリ（オプション）

## インポート規則

### 絶対パス設定 (tsconfig.json)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/store/*": ["./src/store/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

### インポート順序
1. React・Next.js
2. サードパーティライブラリ
3. 内部ライブラリ（@/ から始まる）
4. 相対パス（./ から始まる）

```typescript
// Good
import React from 'react';
import { NextPage } from 'next';
import { Button } from '@mui/material';
import { useAuth } from '@/lib/auth';
import { PasswordForm } from '@/components/forms/PasswordForm';
import './styles.css';
```

## 設定ファイル配置

### ルートレベル
- `package.json` - 依存関係
- `next.config.js` - Next.js設定
- `tailwind.config.js` - TailwindCSS設定
- `tsconfig.json` - TypeScript設定
- `eslint.config.js` - ESLint設定
- `prettier.config.js` - Prettier設定

### 環境変数
- `.env.example` - 環境変数テンプレート
- `.env.local` - ローカル開発用（Git除外）
- `.env.production` - 本番環境用（暗号化して管理）

## セキュリティ考慮

### 除外ファイル (.gitignore)
- 環境変数ファイル
- 証明書ファイル
- データベースファイル
- ログファイル
- バックアップファイル

### 機密情報の管理
- `/certs/` - クライアント証明書（Git除外）
- `/backup/` - バックアップファイル（Git除外）
- 環境変数での機密情報管理

---

この構成により、プロジェクトの保守性・拡張性・セキュリティを確保しながら、チーム開発に適した環境を構築できます。