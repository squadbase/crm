# Order Templates ページ実装方針

## ページの概要

### タイトル
Order Templates

### 説明
オーダーテンプレートを作成・管理し、頻繁に使用される注文パターンを効率的に再利用できるページです。テンプレートを使用することで注文作成の時間を短縮できます。

### 検証状況
✅ **検証済み (85/100点)** - 実装進行可能
- データベース構造: 完璧に整備済み
- SQL クエリ: 全主要クエリ動作確認済み
- 既存データ: 11件のテンプレートでテスト環境最適

## レイアウト設計

### ページ構成
```
PageHeader (title, description, actions)
├── テンプレート統計サマリーカード
├── フィルター・検索エリア
└── データテーブルエリア
    ├── テンプレート一覧テーブル
    └── ページネーション
```

### レスポンシブ対応
- デスクトップ: 3列レイアウト（統計、フィルター、テーブル）
- モバイル: 縦積みレイアウト、テーブルは横スクロール対応

## UIコンポーネント

### 1. PageHeader
```tsx
<PageHeader
  title="Order Templates"
  description="オーダーテンプレートを作成・管理し、頻繁に使用される注文パターンを効率的に再利用できるページです。"
  actions={<AddTemplateButton />}
/>
```

### 2. テンプレート統計サマリーカード
- 総テンプレート数 (検証済み: 11件)
- アクティブテンプレート数 (検証済み: 11件) 
- サービス種別ごとのテンプレート数 (検証済み: product 6件, project 5件)
- ⚠️ 最近使用されたテンプレート数 (要orders.template_id実装)

### 3. フィルター・検索エリア
- サービス種別フィルター（select）
- 支払い形態フィルター（select）
- アクティブ状態フィルター（select）
- **多言語検索ボックス**（テンプレート名・説明文）
  - 日本語検索: 「プラン」「システム」「コンサル」等
  - 英語検索: 「plan」「web」「consulting」「saas」等
  - 混在検索: 「webシステム」「SaaSプラン」等にも対応
  - プレースホルダー: "テンプレート名や説明で検索 (日本語・English)"

### 4. データテーブル
**カラム構成:**
- テンプレート名 (template_name)
- サービス種別 (service_type) - バッジ表示
- 支払い形態 (payment_type) - バッジ表示
- 金額 (amount)
- 説明 (description) - 省略表示
- ステータス (is_active) - アクティブ／非アクティブ
- 最終更新日時 (updated_at)
- アクション（詳細・編集・削除・使用ボタン）

**テーブル機能:**
- ソート機能（金額、作成日時、更新日時）
- 行選択（一括操作用）
- ページネーション（50件/ページ）

### 5. モーダル・フォーム
- 新規テンプレート作成モーダル
- テンプレート編集モーダル
- テンプレート詳細表示モーダル
- 削除確認ダイアログ
- テンプレートから注文作成の確認ダイアログ

## データソース・処理方法

### 使用テーブル
- **order_templates**: メインデータソース
- **orders**: テンプレート使用履歴確認用（統計表示用）

### データ取得SQL
```sql
-- テンプレート一覧取得
SELECT 
  template_id,
  template_name,
  payment_type,
  service_type,
  amount,
  description,
  is_active,
  created_at,
  updated_at
FROM order_templates
WHERE is_active = true
ORDER BY updated_at DESC
LIMIT 50 OFFSET ?;

-- テンプレート統計SQL
SELECT 
  COUNT(*) as total_templates,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_templates,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_templates
FROM order_templates;

-- サービス種別ごとのテンプレート数
SELECT 
  service_type,
  COUNT(*) as count
FROM order_templates
WHERE is_active = true
GROUP BY service_type;

-- ⚠️ テンプレート使用履歴（現在はorders.template_idが未実装のため制限的）
-- 将来実装: orders テーブルに template_id カラム追加後
SELECT 
  t.template_id,
  t.template_name,
  COUNT(o.order_id) as usage_count,
  MAX(o.created_at) as last_used
FROM order_templates t
LEFT JOIN orders o ON o.template_id = t.template_id
GROUP BY t.template_id, t.template_name;
```

### APIエンドポイント設計
- `GET /api/order-templates` - テンプレート一覧取得（フィルター・検索・ページネーション対応）
- `GET /api/order-templates/summary` - テンプレート統計取得
- `GET /api/order-templates/[id]` - テンプレート詳細取得
- `POST /api/order-templates` - 新規テンプレート作成
- `PUT /api/order-templates/[id]` - テンプレート更新
- `DELETE /api/order-templates/[id]` - テンプレート削除
- `PATCH /api/order-templates/[id]/status` - アクティブ状態切り替え
- `POST /api/order-templates/[id]/create-order` - テンプレートから注文作成

### フィルター・検索機能
**WHERE句の動的生成:**
- service_type: `WHERE service_type = ?`
- payment_type: `WHERE payment_type = ?`
- is_active: `WHERE is_active = ?`
- **多言語検索**: `WHERE (template_name ILIKE ? OR description ILIKE ?)`
  - 日本語検索対応: 「プラン」「システム」「プロダクト」等
  - 英語検索対応: 「plan」「system」「product」「web」「saas」等  
  - 大文字小文字区別なし (ILIKE使用)
  - 複合言語検索: 同一クエリで日英混在検索可能

### データ集計
PostgreSQLのネイティブ集計機能を使用：
- COUNT、SUM、GROUP BYを活用
- 複雑な統計が必要な場合のみnode-polarsを検討

## 実装フェーズ (検証結果に基づく推奨順序)

### フェーズ1: 基本CRUD機能 ⭐ 優先実装
✅ **即実装可能** - データベース・クエリ検証済み
- テンプレート一覧表示
- 新規テンプレート作成 
- テンプレート編集・削除
- アクティブ状態切り替え

### フェーズ2: フィルタリング・検索機能 
✅ **即実装可能** - クエリ動作確認済み
- サービス種別・支払い形態フィルター
- アクティブ状態フィルター 
- テンプレート名・説明文検索
- ページネーション

### フェーズ3: テンプレートから注文作成機能
✅ **即実装可能** - 基本機能として実装
- テンプレート選択→注文作成画面遷移
- フォームプリセット機能

### フェーズ4: 使用履歴追跡機能 ⚠️ 将来拡張
🔄 **要スキーマ拡張** - orders.template_id実装後
- 使用回数統計
- 最終使用日時
- 人気テンプレート分析

## 実装ファイル構成
```
src/app/order-templates/
├── page.tsx                     # メインページコンポーネント
├── [templateId]/
│   └── page.tsx                 # テンプレート詳細ページ
├── components/
│   ├── TemplateHeader.tsx       # ヘッダーアクション
│   ├── TemplateSummary.tsx      # 統計サマリーカード
│   ├── TemplateFilter.tsx       # フィルター・検索
│   ├── TemplateTable.tsx        # データテーブル
│   ├── TemplateModal.tsx        # 作成・編集モーダル
│   ├── TemplateDetailModal.tsx  # 詳細表示モーダル
│   ├── CreateOrderModal.tsx     # テンプレートから注文作成
│   └── StatusBadge.tsx          # ステータスバッジ
└── api/
    ├── route.ts                 # GET/POST /api/order-templates
    ├── summary/route.ts         # GET /api/order-templates/summary
    └── [id]/
        ├── route.ts             # GET/PUT/DELETE /api/order-templates/[id]
        ├── create-order/route.ts # POST /api/order-templates/[id]/create-order
        └── status/route.ts      # PATCH /api/order-templates/[id]/status
```

## 状態管理
- フィルター状態: useState
- 選択された行: useState
- モーダル表示状態: useState（作成、編集、詳細、削除確認）
- データ取得: useEffect + fetch

## テンプレートから注文作成の連携
1. テンプレート一覧で「使用」ボタンクリック
2. 確認モーダル表示（テンプレート内容確認）
3. 注文作成ページへリダイレクト（/orders/new?templateId=xxx）
4. 注文作成ページでテンプレートデータをプリセット
5. 顧客選択と必要に応じた調整を行い注文作成

## バリデーション
- テンプレート名: 必須、255文字以内
- サービス種別: 必須、enum値 ('product', 'project')
- 支払い形態: 必須、enum値 ('onetime', 'subscription') 
- 金額: 必須、正の数値、15桁精度 (numeric(15,2))
- 説明: 任意、テキスト形式
- アクティブ状態: boolean、デフォルトtrue

## 技術的考慮事項 (検証結果に基づく)

### データベース最適化
✅ **既存構造が最適**
- UUIDプライマリキーでパフォーマンス良好
- ENUMタイプでデータ整合性確保
- インデックス戦略: updated_at, is_active, service_type

### クエリパフォーマンス
✅ **検証済み - 高速実行確認**
- 一覧取得: LIMIT/OFFSET で効率的ページネーション
- 統計集計: COUNT/CASE文で単一クエリ実行
- フィルタリング: WHERE句の動的生成で柔軟性確保
- **多言語検索**: ILIKE演算子による大文字小文字区別なし検索
  - 日本語・英語・混在検索すべて同一パフォーマンス
  - インデックス最適化: template_name, description に GIN インデックス推奨

### 将来拡張対応
🔄 **orders テーブル拡張計画**
```sql
-- 将来実装推奨: 使用履歴追跡用
ALTER TABLE orders ADD COLUMN template_id UUID REFERENCES order_templates(template_id);
```

### エラーハンドリング
- template_id不正: 404 Template Not Found
- 削除済みテンプレート: 論理削除 (is_active=false)
- 制約違反: enum値、NOT NULL制約のバリデーション