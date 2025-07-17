# Orders ページ実装方針

## ページの概要

### タイトル
Orders

### 説明
売上データの管理と各注文のステータス追跡を行うページ。支払い状況や売上実績の把握が可能。

## レイアウト設計

### ページ構成
```
PageHeader (title, description, actions)
├── 売上実績サマリーカード
├── フィルター・検索エリア
└── データテーブルエリア
    ├── 注文一覧テーブル
    └── ページネーション
```

### レスポンシブ対応
- デスクトップ: 3列レイアウト（サマリー、フィルター、テーブル）
- モバイル: 縦積みレイアウト、テーブルは横スクロール対応

## UIコンポーネント

### 1. PageHeader
```tsx
<PageHeader
  title="Orders"
  description="売上データの管理と各注文のステータス追跡を行うページ。支払い状況や売上実績の把握が可能。"
  actions={<AddOrderButton />}
/>
```

### 2. 売上実績サマリーカード
- 総売上金額
- 支払い済み／未払い金額
- サービス種別ごとの売上
- 当月売上実績

### 3. フィルター・検索エリア
- 支払い形態フィルター（select）
- サービス種別フィルター（select）
- 支払い状況フィルター（select）
- 期間フィルター（date picker）
- 検索ボックス（顧客名・説明文）

### 4. データテーブル
**カラム構成:**
- 顧客名 (customer_name)
- サービス種別 (service_type) - バッジ表示
- 支払い形態 (payment_type) - バッジ表示
- 売上期間 (sales_start_dt - sales_end_dt)
- 金額 (amount + currency)
- 支払い状況 (is_paid) - ステータスバッジ
- アクション（編集・削除ボタン）

**テーブル機能:**
- ソート機能（金額、作成日時）
- 行選択（一括操作用）
- ページネーション（50件/ページ）

### 5. モーダル・フォーム
- 新規注文登録モーダル
- 注文編集モーダル
- 削除確認ダイアログ

## データソース・処理方法

### 使用テーブル
- **orders**: メインデータソース
- **customers**: 顧客名取得用（JOIN）

### データ取得SQL
```sql
-- 注文一覧取得（JOINでcustomer情報も取得）
SELECT 
  o.order_id,
  o.customer_id,
  c.customer_name,
  o.payment_type,
  o.service_type,
  o.sales_start_dt,
  o.sales_end_dt,
  o.amount,
  o.currency,
  o.is_paid,
  o.description,
  o.created_at,
  o.updated_at
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
ORDER BY o.created_at DESC
LIMIT 50 OFFSET ?;

-- 売上集計SQL
SELECT 
  COUNT(*) as total_orders,
  SUM(amount) as total_amount,
  SUM(CASE WHEN is_paid = true THEN amount ELSE 0 END) as paid_amount,
  SUM(CASE WHEN is_paid = false THEN amount ELSE 0 END) as unpaid_amount
FROM orders
WHERE sales_start_dt >= ? AND sales_start_dt <= ?;

-- サービス種別ごとの集計
SELECT 
  service_type,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM orders
GROUP BY service_type;
```

### APIエンドポイント設計
- `GET /api/orders` - 注文一覧取得（フィルター・検索・ページネーション対応）
- `GET /api/orders/summary` - 売上実績サマリー取得
- `POST /api/orders` - 新規注文作成
- `PUT /api/orders/[id]` - 注文更新
- `DELETE /api/orders/[id]` - 注文削除
- `PATCH /api/orders/[id]/payment-status` - 支払い状況更新

### フィルター・検索機能
**WHERE句の動的生成:**
- payment_type: `WHERE payment_type = ?`
- service_type: `WHERE service_type = ?`
- is_paid: `WHERE is_paid = ?`
- 期間: `WHERE sales_start_dt BETWEEN ? AND ?`
- 検索: `WHERE (customer_name ILIKE ? OR description ILIKE ?)`

### データ集計
Node.js-polarsを使用せず、PostgreSQLのネイティブ集計機能を使用：
- SUM、COUNT、GROUP BYを活用
- 月次集計は DATE_TRUNC を使用
- 複雑な集計が必要な場合のみnode-polarsを検討

## 実装ファイル構成
```
src/app/orders/
├── page.tsx              # メインページコンポーネント
├── components/
│   ├── OrdersHeader.tsx     # ヘッダーアクション
│   ├── SalesSummary.tsx     # 売上サマリーカード
│   ├── OrdersFilter.tsx     # フィルター・検索
│   ├── OrdersTable.tsx      # データテーブル
│   ├── OrderModal.tsx       # 新規作成・編集モーダル
│   └── StatusBadge.tsx      # ステータスバッジ
└── api/
    ├── route.ts             # GET /api/orders
    ├── summary/route.ts     # GET /api/orders/summary
    └── [id]/route.ts        # PUT/DELETE /api/orders/[id]
```

## 状態管理
- フィルター状態: useState
- 選択された行: useState
- モーダル表示状態: useState
- データ取得: SWR または TanStack Query