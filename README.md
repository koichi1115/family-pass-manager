# 家族用パスワード管理システム

## 概要
家族内で安全にID・パスワード情報を共有・管理するためのWebアプリケーション

## 技術スタック
- **Frontend**: Next.js 14 + React + TypeScript + Material-UI
- **Backend**: Vercel Serverless Functions
- **Database**: PlanetScale (MySQL) + Prisma ORM
- **Authentication**: クライアント証明書 + NextAuth.js
- **Deployment**: Vercel
- **Repository**: GitHub

## ディレクトリ構成

```
family-pass-manager/
├── README.md                    # プロジェクト概要
├── CLAUDE.md                    # Claude Code用ガイド
├── package.json                 # 依存関係
├── next.config.js              # Next.js設定
├── tailwind.config.js          # TailwindCSS設定
├── tsconfig.json               # TypeScript設定
├── .env.local                  # 環境変数（ローカル）
├── .env.example                # 環境変数テンプレート
├── .gitignore                  # Git除外設定
│
├── docs/                       # ドキュメント
│   ├── dev-journal.md          # 開発日誌
│   ├── design/                 # 設計書
│   │   ├── requirements.md     # 要件定義書
│   │   ├── system-design.md    # システム設計書
│   │   └── database-design.md  # データベース設計書
│   ├── api/                    # API仕様書
│   └── ui/                     # UI/UX設計書
│
├── src/                        # ソースコード
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 認証関連ページ
│   │   ├── (dashboard)/       # メインアプリページ
│   │   ├── api/               # API Routes
│   │   ├── globals.css        # グローバルスタイル
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── page.tsx           # ホームページ
│   ├── components/            # Reactコンポーネント
│   │   ├── ui/               # 共通UIコンポーネント
│   │   ├── forms/            # フォームコンポーネント
│   │   ├── layout/           # レイアウトコンポーネント
│   │   └── auth/             # 認証コンポーネント
│   ├── lib/                  # ユーティリティライブラリ
│   │   ├── auth.ts           # 認証関連
│   │   ├── crypto.ts         # 暗号化関連
│   │   ├── db.ts             # データベース接続
│   │   └── utils.ts          # 共通関数
│   ├── store/                # 状態管理（Zustand）
│   ├── types/                # TypeScript型定義
│   └── styles/               # スタイルファイル
│
├── prisma/                     # データベース関連
│   ├── schema.prisma          # Prismaスキーマ
│   ├── migrations/            # マイグレーションファイル
│   └── seeds/                 # シードデータ
│
├── public/                     # 静的ファイル
│   ├── icons/                 # アイコン
│   ├── images/                # 画像
│   └── manifest.json          # PWAマニフェスト
│
├── tests/                      # テストファイル
│   ├── __mocks__/             # モックファイル
│   ├── api/                   # APIテスト
│   ├── components/            # コンポーネントテスト
│   └── utils/                 # ユーティリティテスト
│
├── scripts/                    # 運用スクリプト
│   ├── setup.sh              # 初期セットアップ
│   ├── deploy.sh             # デプロイスクリプト
│   └── backup.sh             # バックアップスクリプト
│
├── config/                     # 設定ファイル
│   ├── database.js            # DB設定
│   └── auth.js                # 認証設定
│
├── assets/                     # アセットファイル
│   ├── icons/                 # SVGアイコン
│   └── images/                # 画像素材
│
└── .github/                    # GitHub設定
    ├── workflows/             # GitHub Actions
    └── ISSUE_TEMPLATE/        # Issue テンプレート
```

## セットアップ手順

### 1. 環境準備
```bash
# リポジトリクローン
git clone <repository-url>
cd family-pass-manager

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.local を編集して必要な設定値を入力
```

### 2. データベースセットアップ
```bash
# Prisma初期化
npx prisma generate

# データベースマイグレーション
npx prisma db push

# シードデータ投入
npx prisma db seed
```

### 3. 開発サーバー起動
```bash
npm run dev
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# テスト実行
npm test

# テスト（ウォッチモード）
npm run test:watch

# リント
npm run lint

# 型チェック
npm run type-check

# Prisma Studio起動
npx prisma studio

# データベースリセット
npx prisma migrate reset
```

## セキュリティ

- すべてのパスワードデータはクライアントサイドで暗号化
- クライアント証明書による認証
- HTTPS通信の強制
- 定期的なセキュリティアップデート

## 貢献

1. Issue作成
2. ブランチ作成
3. 変更実装
4. プルリクエスト作成

## ライセンス

MIT License