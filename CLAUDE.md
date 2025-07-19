# CLAUDE.md - AI Assistant Context for Squadbase CRM

## Repository Overview

SquadbaseのCRMアプリを構築する。

## Tech Stack
技術要件
- Next.js v15
- TaildwindCSS v4
- shadcn/ui
- Drizzle ORM
- Database: PostgreSQL built on Neon

* 認証は実装する必要ありません。

## Environment Setup

Required environment variables (in .env file):
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`
- `POSTGRES_SSL` (optional: 'true', 'false', 'require' - auto-detected if not set)

## Important Notes

開発時には、docker composeを使用してローカル環境でPostgreSQLを立ち上げてください。

### PostgreSQL

テーブルの接続やデータの操作、マイグレーションは必ずdrizzleの機能を使用してください。
テーブルの作成や更新などのマイグレーションを行う時は必ずseedを作成してください。

`npm run dev`を実行する際には必ずデータを初期化するかを尋ね、初期化する場合は以下を実行してください。
- 該当のテーブルを全て削除する
- `npm run seed`を実行する

#### PostgreSQLのデータベース仕様書

`docs/database.md`にデータベース仕様書が記載してます。この仕様書に沿ってテーブルとシードを作成してください。

#### PostgreSQLの定義ファイル

- `src/lib/db/schema.ts`にテーブルの定義を記載してください。
- `src/lib/db/seed.ts`にテーブルのシードを記載してください。

## 開発ワークフロー

1. 修正点を明確にして変更点を実装する
2. 対象のページの実装が正しく行われていることをブラウザを使ってテストをする
3. 修正点があれば修正をする
4. 1-3を繰り返し、意図通りの実装になっていることが確認できたらタスクを終了する

* スクリーンキャプチャを撮る時には、必ずplaywright mcpを使ってください。

**注意1**: 開発サーバーを起動する際は、`npm run dev`は使用しないでください。このコマンドは終了しないため、スクリーンショット撮影が正常に動作しません。代わりにtmuxコマンドを使用してtmuxセッション内でサーバーを起動してください。
開発サーバーのポートは`7777`です。

**注意2**: タスクを終了する際には必ずこのプロセスで開いたtmuxのsessionを閉じるようにしてください。

## スタイリングガイドライン

### TailwindCSSの設定について

このプロジェクトでは、カスタムTailwindCSSクラス（`text-heading`、`bg-primary-100`など）が正しく適用されない問題が確認されています。

#### 問題の原因
- TailwindCSS v4の設定またはカスタムトークンが正しく適用されていない
- Next.js 15とTailwindCSS v4の組み合わせでの設定問題

#### 解決策
**すべてのスタイリングにはインラインスタイルを使用してください**

```tsx
// ❌ TailwindCSSクラスは使用しない
<div className="bg-primary-100 text-heading p-4">

// ✅ インラインスタイルを使用する
<div style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '16px' }}>
```

#### 注意事項
1. **すべてのコンポーネント**でインラインスタイルを使用する
2. **ホバー効果**は`onMouseEnter`/`onMouseLeave`イベントハンドラーで実装する
3. **Client Component**の使用が必要な場合は`'use client'`ディレクティブを追加する
4. **一貫性**を保つため、色やサイズは統一された値を使用する

#### 推奨色パレット
- Primary Blue: `#2563eb`
- Gray 50: `#f9fafb`
- Gray 200: `#e5e7eb`
- Gray 400: `#9ca3af`
- Gray 600: `#4b5563`
- Gray 800: `#1f2937`
- Text Primary: `#0f172a`
- Text Secondary: `#6b7280`

## レイアウトガイドライン

### ページヘッダーの統一

すべてのページで一貫したヘッダーデザインを保つため、`PageHeader`コンポーネントを使用してください。

#### 使用方法

```tsx
import { PageHeader } from '@/components/layout/PageHeader';

// ページヘッダーアクションの定義
const headerActions = (
  <>
    <button>Action 1</button>
    <button>Action 2</button>
  </>
);

// ページコンポーネント内で使用
<PageHeader
  title="ページタイトル"
  description="ページの説明文。何を行うページかを1-2文で説明"
  actions={headerActions}
/>
```

#### 設計原則

1. **タイトル**: ページの目的を明確に示す名詞（例：Dashboard, Customer Management）
2. **説明文**: ページの機能や目的を1-2文で簡潔に説明
3. **アクション**: ページの主要な操作ボタンを右端に配置
4. **レスポンシブ**: 小さい画面では要素が縦に積み重なる

#### ヘッダーアクションのスタイリング

アクションボタンは以下の2種類のスタイルを使用：

**セカンダリボタン**:
```tsx
<button style={{
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#374151',
  backgroundColor: 'white',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  cursor: 'pointer'
}}>
```

**プライマリボタン**:
```tsx
<button style={{
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  fontSize: '14px',
  fontWeight: '500',
  color: 'white',
  backgroundColor: '#2563eb',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
}}>
```

### レスポンシブデザイン

#### ブレークポイント
- モバイル: `< 768px`
- デスクトップ: `≥ 768px` (Tailwind `md:` prefix)

#### モバイル対応
- サイドバーは固定スライドメニューとして表示（幅: 260px）
- ハンバーガーメニューでトグル操作
- ページヘッダーのアクションは縦積みで表示
- テーブルやグリッドは横スクロール対応

#### サイドバー仕様
- **幅**: 260px（デスクトップ・モバイル共通）
- **ヘッダー**: 16px フォント、20px パディング
- **ナビゲーション項目**: 14px フォント、10px パディング、18px アイコン
- **項目間の間隔**: 4px

### コンテンツエリア

#### パディング
- デスクトップ: `24px`
- モバイル: `16px`

#### カード・テーブル
- 背景色: `white`
- ボーダー: `1px solid #e2e8f0`
- ボーダーラジアス: `12px`
- シャドウ: `0 1px 3px 0 rgba(0, 0, 0, 0.1)`