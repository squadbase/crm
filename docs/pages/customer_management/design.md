# 顧客管理ページ - 実装方針

## ページタイトル
Customer Management

## レイアウト構成

### 全体レイアウト
```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
│ - Page Title: "顧客管理"                                    │
│ - Search Input (リアルタイム検索)                           │
│ - "新規顧客登録" Button                                     │
├─────────────────────────────────────────────────────────────┤
│ Main Content                                                 │
│ - Customer Data Table                                        │
│   - Columns: 顧客名, 作成日時, 更新日時, アクション         │
│   - Actions: 編集, 削除                                     │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                       │
│ - Pagination Controls                                        │
└─────────────────────────────────────────────────────────────┘
```

### モーダル構成
- **新規顧客登録モーダル**: 顧客名入力フォーム
- **顧客編集モーダル**: 顧客名編集フォーム

- **削除確認ダイアログ**: 削除確認メッセージ

## データベース連携

### 使用テーブル
- **customers**: 顧客情報の主要テーブル
- **orders**: 削除時の関連チェック用

### データ取得・操作SQL

#### 1. 顧客一覧取得（ページネーション対応）
```sql
SELECT
  customer_id,
  customer_name,
  created_at,
  updated_at,
  COUNT(*) OVER() as total_count
FROM customers
WHERE customer_name ILIKE '%{search_term}%'
ORDER BY created_at DESC
LIMIT {limit} OFFSET {offset}
```

#### 2. 顧客検索（リアルタイム）
```sql
SELECT
  customer_id,
  customer_name,
  created_at,
  updated_at
FROM customers
WHERE customer_name ILIKE '%{search_term}%'
ORDER BY customer_name ASC
LIMIT 50
```

#### 3. 新規顧客登録
```sql
INSERT INTO customers (customer_name)
VALUES ({customer_name})
RETURNING customer_id, customer_name, created_at, updated_at
```

#### 4. 顧客情報更新
```sql
UPDATE customers
SET
  customer_name = {customer_name},
  updated_at = NOW()
WHERE customer_id = {customer_id}
RETURNING customer_id, customer_name, created_at, updated_at
```

#### 5. 削除前関連チェック
```sql
SELECT COUNT(*) as order_count
FROM orders
WHERE customer_id = {customer_id}
```

#### 6. 顧客削除（論理削除）
```sql
-- 実際の削除処理は物理削除として実装
-- 関連するordersレコードがある場合は削除不可とする
DELETE FROM customers
WHERE customer_id = {customer_id}
```

## UIコンポーネント

### 使用予定コンポーネント（shadcn/ui）
- `Table`: 顧客一覧表示
- `Input`: 検索フォーム
- `Button`: 各種アクション用
- `Dialog`: モーダル表示
- `Form`: フォーム管理
- `Alert`: エラー・成功メッセージ
- `Pagination`: ページネーション

### カスタムコンポーネント
- `CustomerDataTable`: 顧客一覧テーブル
- `CustomerForm`: 顧客登録・編集フォーム
- `SearchInput`: リアルタイム検索入力
- `DeleteConfirmDialog`: 削除確認ダイアログ

## API設計

### エンドポイント
- `GET /api/customers`: 顧客一覧取得
- `POST /api/customers`: 新規顧客登録
- `PUT /api/customers/[id]`: 顧客情報更新
- `DELETE /api/customers/[id]`: 顧客削除

### パラメータ
- **GET /api/customers**
  - `page`: ページ番号 (default: 1)
  - `limit`: 1ページあたりの件数 (default: 10)
  - `search`: 検索キーワード (optional)

- **POST /api/customers**
  - `customer_name`: 顧客名 (required)

- **PUT /api/customers/[id]**
  - `customer_name`: 顧客名 (required)

- **DELETE /api/customers/[id]**
  - パラメータなし

## バリデーション

### フロントエンド（Zod）
```typescript
const CustomerSchema = z.object({
  customer_name: z.string()
    .min(1, "顧客名は必須です")
    .max(255, "顧客名は255文字以内で入力してください")
    .trim()
});
```

### バックエンド
- 顧客名の重複チェック
- 削除時の関連データチェック
- 入力値のサニタイズ

## 状態管理

### React State
- `customers`: 顧客一覧データ
- `searchTerm`: 検索キーワード
- `currentPage`: 現在のページ
- `totalPages`: 総ページ数
- `loading`: ローディング状態
- `error`: エラー状態

### フォーム状態
- `isCreateDialogOpen`: 新規登録モーダルの表示状態
- `isEditDialogOpen`: 編集モーダルの表示状態
- `editingCustomer`: 編集中の顧客データ
- `isDeleteDialogOpen`: 削除確認ダイアログの表示状態

## エラーハンドリング

### フロントエンド
- ネットワークエラー時のトーストメッセージ
- バリデーションエラーの表示
- 削除時の関連データエラー処理

### バックエンド
- データベースエラーの適切な処理
- 400/404/500エラーの返却
- ログ出力とエラートラッキング

## パフォーマンス最適化

### フロントエンド
- 検索のデバウンス処理（300ms）
- ページネーションによるデータ分割
- 適切なローディング状態の表示

### バックエンド
- customer_nameカラムのインデックス活用
- 適切なLIMIT/OFFSETの設定
- データベースコネクションプーリング

## セキュリティ

### 入力値検証
- XSS対策：入力値のサニタイズ
- SQLインジェクション対策：パラメータ化クエリ
- CSRFトークンの実装

### 認証・認可
- 認証は実装不要（CLAUDE.md指示に従う）
- API呼び出し時のエラーハンドリング