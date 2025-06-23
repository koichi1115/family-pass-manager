# デザインシステム設計書

## 概要

家族用パスワード管理システムのデザインシステムを定義します。一貫性のあるUI/UXを提供し、開発効率とユーザビリティを向上させることを目標としています。

## デザイン原則

### 1. 直感性 (Intuitive)
家族全員が迷わずに操作できる、分かりやすいインターフェース

### 2. 安全性 (Secure)
パスワード管理という機密性の高い用途に適した、信頼できるデザイン

### 3. 効率性 (Efficient)
日常的な使用において、素早く目的を達成できるワークフロー

### 4. 親しみやすさ (Friendly)
技術に詳しくない家族メンバーも親しみを感じられる、温かみのあるデザイン

### 5. 一貫性 (Consistent)
すべての画面・コンポーネントで統一されたルールとパターン

---

## カラーパレット

### メインカラー

```css
/* プライマリー（信頼・安全を表現） */
--color-primary-50:  #e3f2fd;
--color-primary-100: #bbdefb;
--color-primary-200: #90caf9;
--color-primary-300: #64b5f6;
--color-primary-400: #42a5f5;
--color-primary-500: #2196f3;  /* メインブルー */
--color-primary-600: #1e88e5;
--color-primary-700: #1976d2;
--color-primary-800: #1565c0;
--color-primary-900: #0d47a1;

/* セカンダリー（アクセント・親しみやすさ） */
--color-secondary-50:  #f3e5f5;
--color-secondary-100: #e1bee7;
--color-secondary-200: #ce93d8;
--color-secondary-300: #ba68c8;
--color-secondary-400: #ab47bc;
--color-secondary-500: #9c27b0;  /* アクセントパープル */
--color-secondary-600: #8e24aa;
--color-secondary-700: #7b1fa2;
--color-secondary-800: #6a1b9a;
--color-secondary-900: #4a148c;
```

### 機能カラー

```css
/* 成功（保存・完了） */
--color-success-50:  #e8f5e8;
--color-success-100: #c8e6c9;
--color-success-200: #a5d6a7;
--color-success-300: #81c784;
--color-success-400: #66bb6a;
--color-success-500: #4caf50;  /* 成功グリーン */
--color-success-600: #43a047;
--color-success-700: #388e3c;
--color-success-800: #2e7d32;
--color-success-900: #1b5e20;

/* 警告（注意・期限切れ） */
--color-warning-50:  #fffde7;
--color-warning-100: #fff9c4;
--color-warning-200: #fff59d;
--color-warning-300: #fff176;
--color-warning-400: #ffee58;
--color-warning-500: #ffeb3b;  /* 警告イエロー */
--color-warning-600: #fdd835;
--color-warning-700: #fbc02d;
--color-warning-800: #f9a825;
--color-warning-900: #f57f17;

/* エラー（削除・危険） */
--color-error-50:  #ffebee;
--color-error-100: #ffcdd2;
--color-error-200: #ef9a9a;
--color-error-300: #e57373;
--color-error-400: #ef5350;
--color-error-500: #f44336;  /* エラーレッド */
--color-error-600: #e53935;
--color-error-700: #d32f2f;
--color-error-800: #c62828;
--color-error-900: #b71c1c;

/* 情報（ヒント・説明） */
--color-info-50:  #e1f5fe;
--color-info-100: #b3e5fc;
--color-info-200: #81d4fa;
--color-info-300: #4fc3f7;
--color-info-400: #29b6f6;
--color-info-500: #03a9f4;  /* 情報ブルー */
--color-info-600: #039be5;
--color-info-700: #0288d1;
--color-info-800: #0277bd;
--color-info-900: #01579b;
```

### グレースケール

```css
/* モノクロ・グレー */
--color-gray-50:  #fafafa;
--color-gray-100: #f5f5f5;
--color-gray-200: #eeeeee;
--color-gray-300: #e0e0e0;
--color-gray-400: #bdbdbd;
--color-gray-500: #9e9e9e;  /* ベースグレー */
--color-gray-600: #757575;
--color-gray-700: #616161;
--color-gray-800: #424242;
--color-gray-900: #212121;

/* 純色 */
--color-white: #ffffff;
--color-black: #000000;
```

### カテゴリカラー

```css
/* パスワードカテゴリ用カラー */
--color-category-banking:     #1976d2;  /* 銀行：ブルー */
--color-category-ecommerce:   #f57c00;  /* EC：オレンジ */
--color-category-social:      #388e3c;  /* SNS：グリーン */
--color-category-utility:     #7b1fa2;  /* 公共料金：パープル */
--color-category-entertainment: #e91e63; /* エンタメ：ピンク */
--color-category-work:        #5d4037;  /* 業務：ブラウン */
--color-category-other:       #616161;  /* その他：グレー */
```

---

## タイポグラフィ

### フォントファミリー

```css
/* メインフォント（日本語対応） */
--font-family-primary: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', sans-serif;

/* モノスペース（パスワード表示用） */
--font-family-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;

/* 数字（統計・メトリクス用） */
--font-family-numeric: 'SF Pro Display', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
```

### フォントサイズスケール

```css
/* フォントサイズ階層 */
--font-size-xs:   12px;  /* 0.75rem - キャプション */
--font-size-sm:   14px;  /* 0.875rem - 小さなテキスト */
--font-size-base: 16px;  /* 1rem - ベースサイズ */
--font-size-lg:   18px;  /* 1.125rem - 大きめテキスト */
--font-size-xl:   20px;  /* 1.25rem - サブタイトル */
--font-size-2xl:  24px;  /* 1.5rem - セクションタイトル */
--font-size-3xl:  30px;  /* 1.875rem - ページタイトル */
--font-size-4xl:  36px;  /* 2.25rem - 大きなタイトル */
--font-size-5xl:  48px;  /* 3rem - ヒーロータイトル */
```

### フォントウェイト

```css
--font-weight-light:    300;
--font-weight-normal:   400;
--font-weight-medium:   500;
--font-weight-semibold: 600;
--font-weight-bold:     700;
--font-weight-extrabold: 800;
```

### 行間

```css
--line-height-tight:  1.25;  /* タイトル用 */
--line-height-normal: 1.5;   /* 本文用 */
--line-height-relaxed: 1.75; /* 読みやすさ重視 */
```

### 文字間隔

```css
--letter-spacing-tight:  -0.025em;
--letter-spacing-normal:  0em;
--letter-spacing-wide:    0.025em;
```

---

## スペーシング

### スペースユニット

```css
/* スペーシングスケール（8pxベース） */
--space-1:  4px;   /* 0.25rem */
--space-2:  8px;   /* 0.5rem */
--space-3:  12px;  /* 0.75rem */
--space-4:  16px;  /* 1rem */
--space-5:  20px;  /* 1.25rem */
--space-6:  24px;  /* 1.5rem */
--space-8:  32px;  /* 2rem */
--space-10: 40px;  /* 2.5rem */
--space-12: 48px;  /* 3rem */
--space-16: 64px;  /* 4rem */
--space-20: 80px;  /* 5rem */
--space-24: 96px;  /* 6rem */
```

### コンポーネント内マージン

```css
/* コンポーネント内の標準スペーシング */
--spacing-component-xs:  var(--space-1);   /* 4px - 密集 */
--spacing-component-sm:  var(--space-2);   /* 8px - 小 */
--spacing-component-md:  var(--space-4);   /* 16px - 標準 */
--spacing-component-lg:  var(--space-6);   /* 24px - 大 */
--spacing-component-xl:  var(--space-8);   /* 32px - 特大 */
```

---

## エレベーション（影・重なり）

### シャドウスタイル

```css
/* ボックスシャドウ階層 */
--shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md:  0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-lg:  0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-xl:  0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* 特殊効果 */
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
--shadow-none:  none;
```

### Z-index階層

```css
/* レイヤー管理 */
--z-index-dropdown:  1000;
--z-index-sticky:    1020;
--z-index-fixed:     1030;
--z-index-modal:     1040;
--z-index-popover:   1050;
--z-index-tooltip:   1060;
--z-index-toast:     1070;
```

---

## コンポーネント設計

### ボタン

#### プライマリーボタン
```css
.btn-primary {
  background-color: var(--color-primary-500);
  color: var(--color-white);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-medium);
  border: none;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
  background-color: var(--color-primary-600);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-primary:active {
  background-color: var(--color-primary-700);
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}
```

#### セカンダリーボタン
```css
.btn-secondary {
  background-color: transparent;
  color: var(--color-primary-500);
  border: 2px solid var(--color-primary-500);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-medium);
}

.btn-secondary:hover {
  background-color: var(--color-primary-50);
  border-color: var(--color-primary-600);
  color: var(--color-primary-600);
}
```

#### ボタンサイズバリエーション
```css
.btn-xs { padding: var(--space-1) var(--space-2); font-size: var(--font-size-xs); }
.btn-sm { padding: var(--space-2) var(--space-4); font-size: var(--font-size-sm); }
.btn-md { padding: var(--space-3) var(--space-6); font-size: var(--font-size-base); }
.btn-lg { padding: var(--space-4) var(--space-8); font-size: var(--font-size-lg); }
.btn-xl { padding: var(--space-5) var(--space-10); font-size: var(--font-size-xl); }
```

### フォーム要素

#### 入力フィールド
```css
.input-field {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  font-family: var(--font-family-primary);
  transition: all 0.2s ease-in-out;
  background-color: var(--color-white);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.input-field:invalid {
  border-color: var(--color-error-500);
}

.input-field::placeholder {
  color: var(--color-gray-500);
}
```

#### パスワード入力フィールド
```css
.password-field {
  font-family: var(--font-family-mono);
  letter-spacing: 0.05em;
}

.password-field[type="password"] {
  letter-spacing: 0.2em;
}
```

### カード

#### ベースカード
```css
.card {
  background-color: var(--color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
  border: 1px solid var(--color-gray-200);
  transition: all 0.2s ease-in-out;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

#### パスワードカード
```css
.password-card {
  @extend .card;
  border-left: 4px solid var(--color-primary-500);
}

.password-card.high-importance {
  border-left-color: var(--color-error-500);
}

.password-card.medium-importance {
  border-left-color: var(--color-warning-500);
}

.password-card.low-importance {
  border-left-color: var(--color-gray-400);
}
```

### 通知・アラート

#### 成功通知
```css
.alert-success {
  background-color: var(--color-success-50);
  border: 1px solid var(--color-success-200);
  border-left: 4px solid var(--color-success-500);
  color: var(--color-success-800);
  padding: var(--space-4);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--space-4);
}
```

#### エラー通知
```css
.alert-error {
  background-color: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  border-left: 4px solid var(--color-error-500);
  color: var(--color-error-800);
  padding: var(--space-4);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--space-4);
}
```

---

## アイコンシステム

### アイコンライブラリ
- **Material Icons** - メインアイコンセット
- **Heroicons** - 補助アイコン
- **カスタムアイコン** - ブランド専用アイコン

### アイコンサイズ
```css
--icon-xs:  12px;  /* 小さなアイコン */
--icon-sm:  16px;  /* 標準小サイズ */
--icon-md:  20px;  /* 標準サイズ */
--icon-lg:  24px;  /* 大きめ */
--icon-xl:  32px;  /* 特大 */
--icon-2xl: 48px;  /* ヒーローアイコン */
```

### 主要アイコン定義

```typescript
const Icons = {
  // 認証・セキュリティ
  security: 'security',
  fingerprint: 'fingerprint',
  face: 'face',
  key: 'vpn_key',
  
  // パスワード管理
  visibility: 'visibility',
  visibilityOff: 'visibility_off',
  copy: 'content_copy',
  generate: 'casino',
  
  // カテゴリ
  banking: 'account_balance',
  shopping: 'shopping_cart',
  social: 'share',
  utility: 'electric_bolt',
  entertainment: 'movie',
  work: 'work',
  
  // アクション
  add: 'add',
  edit: 'edit',
  delete: 'delete',
  search: 'search',
  filter: 'filter_list',
  
  // ナビゲーション
  menu: 'menu',
  home: 'home',
  settings: 'settings',
  help: 'help',
  
  // 状態
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
  info: 'info',
} as const;
```

---

## アニメーション・トランジション

### トランジション定義

```css
/* 標準的なトランジション */
--transition-fast:   0.15s ease-in-out;
--transition-normal: 0.2s ease-in-out;
--transition-slow:   0.3s ease-in-out;

/* イージング関数 */
--easing-linear:      cubic-bezier(0, 0, 1, 1);
--easing-ease-in:     cubic-bezier(0.4, 0, 1, 1);
--easing-ease-out:    cubic-bezier(0, 0, 0.2, 1);
--easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### ホバーエフェクト

```css
.hover-lift {
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### フェードイン・アウト

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
}

.fade-in {
  animation: fadeIn var(--transition-normal) var(--easing-ease-out);
}

.fade-out {
  animation: fadeOut var(--transition-normal) var(--easing-ease-in);
}
```

### ローディングアニメーション

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## レスポンシブ設計

### ブレークポイント

```css
--breakpoint-xs: 0px;
--breakpoint-sm: 576px;
--breakpoint-md: 768px;
--breakpoint-lg: 992px;
--breakpoint-xl: 1200px;
--breakpoint-2xl: 1400px;
```

### コンテナ幅

```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (min-width: 576px) {
  .container { max-width: 540px; }
}

@media (min-width: 768px) {
  .container { max-width: 720px; }
}

@media (min-width: 992px) {
  .container { max-width: 960px; }
}

@media (min-width: 1200px) {
  .container { max-width: 1140px; }
}
```

### モバイルファースト

```css
/* モバイル（デフォルト） */
.grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* タブレット以上 */
@media (min-width: 768px) {
  .grid {
    flex-direction: row;
    gap: var(--space-6);
  }
}

/* デスクトップ以上 */
@media (min-width: 992px) {
  .grid {
    gap: var(--space-8);
  }
}
```

---

## ダークモード対応

### カラーテーマ切り替え

```css
/* ライトモード（デフォルト） */
:root {
  --bg-primary: var(--color-white);
  --bg-secondary: var(--color-gray-50);
  --text-primary: var(--color-gray-900);
  --text-secondary: var(--color-gray-600);
  --border-color: var(--color-gray-200);
}

/* ダークモード */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: var(--color-gray-900);
    --bg-secondary: var(--color-gray-800);
    --text-primary: var(--color-gray-100);
    --text-secondary: var(--color-gray-300);
    --border-color: var(--color-gray-700);
  }
}

/* 手動切り替え */
[data-theme="dark"] {
  --bg-primary: var(--color-gray-900);
  --bg-secondary: var(--color-gray-800);
  --text-primary: var(--color-gray-100);
  --text-secondary: var(--color-gray-300);
  --border-color: var(--color-gray-700);
}
```

---

## アクセシビリティ

### カラーコントラスト

```css
/* WCAG AA準拠のコントラスト比 4.5:1 以上を確保 */
.text-high-contrast {
  color: var(--color-gray-900);
  background-color: var(--color-white);
}

.text-medium-contrast {
  color: var(--color-gray-700);
  background-color: var(--color-gray-50);
}
```

### フォーカス表示

```css
.focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
  border-radius: var(--border-radius-sm);
}

.focus-visible:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

### 画面読み上げ対応

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## コンポーネント使用例

### パスワードカード

```html
<div class="password-card high-importance">
  <div class="card-header">
    <h3 class="card-title">
      <span class="icon" aria-hidden="true">🏦</span>
      みずほ銀行
    </h3>
    <div class="card-actions">
      <button class="btn-icon" aria-label="パスワードを表示">
        <span class="icon">👁️</span>
      </button>
      <button class="btn-icon" aria-label="パスワードを編集">
        <span class="icon">✏️</span>
      </button>
    </div>
  </div>
  
  <div class="card-content">
    <p class="text-secondary">ID: yamada****</p>
    <p class="text-secondary">重要度: <span class="badge badge-error">高</span></p>
    <p class="text-secondary">期限: 2025/6/23</p>
  </div>
</div>
```

### 通知バナー

```html
<div class="alert alert-success" role="alert">
  <span class="icon" aria-hidden="true">✅</span>
  <div class="alert-content">
    <p class="alert-title">パスワードを保存しました</p>
    <p class="alert-description">3秒後に自動で閉じます</p>
  </div>
  <button class="alert-close" aria-label="通知を閉じる">
    <span class="icon">❌</span>
  </button>
</div>
```

---

## 実装ガイドライン

### CSS変数の活用

```css
/* コンポーネント固有の変数定義 */
.button {
  --button-padding-x: var(--space-4);
  --button-padding-y: var(--space-2);
  --button-border-radius: var(--border-radius-md);
  
  padding: var(--button-padding-y) var(--button-padding-x);
  border-radius: var(--button-border-radius);
}
```

### ユーティリティクラス

```css
/* マージン・パディング */
.m-0 { margin: 0; }
.m-1 { margin: var(--space-1); }
.p-0 { padding: 0; }
.p-1 { padding: var(--space-1); }

/* テキスト */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

/* 表示・非表示 */
.hidden { display: none; }
.sr-only { /* スクリーンリーダー専用 */ }
```

---

このデザインシステムを基に、Material-UIやTailwind CSSなどのUIライブラリをカスタマイズして実装していきます。