# SnapPrice Web

SnapPrice（スナッププライス）のフロントエンドアプリケーションです。
Next.js (App Router) を使用して構築されており、Supabaseと連携して近隣スーパーの最安値比較を提供します。

## 主な機能

- **商品検索**: 商品名で検索し、取り扱い店舗と価格を一括表示します。
- **最安値比較**: 検索結果を「価格が安い順」に自動ソートし、地域最安値をハイライトします。
- **位置情報連携**: ユーザーの現在地を取得し、各店舗までの距離を表示します。

## 技術スタック

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL / PostGIS)
- **Icons**: [Lucide React](https://lucide.dev/)

## ローカル開発環境のセットアップ

### 前提条件

- Node.js 18以上
- npm

### インストール

```bash
cd web
npm install
```

### 環境変数

ルートディレクトリに `.env.local` ファイルを作成し、以下の変数を設定してください。
（`scraper/.env` の値を流用可能です）

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスしてください。

## ディレクトリ構造

- `src/app`: Next.js App Routerのページコンポーネント
- `src/components`: UIコンポーネント (`ProductSearch`, `StoreList` 等)
- `src/lib`: ユーティリティ (`supabase.ts`, `location.ts`)
