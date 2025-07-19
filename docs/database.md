# CRM データベース仕様書

## 概要
売上管理に特化したCRMシステムのデータベース設計。顧客管理と売上管理を中心とした構成。

## テーブル構成

### 1. customers（顧客管理）
顧客情報を管理するメインテーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|-----|
| customer_id | UUID | PRIMARY KEY | 顧客ID |
| customer_name | VARCHAR(255) | NOT NULL | 顧客企業名 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

### 2. orders（売上管理）
売上・注文情報を管理するテーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|-----|
| order_id | UUID | PRIMARY KEY | 注文ID |
| customer_id | UUID | FOREIGN KEY | 顧客ID (customers.customer_id) |
| payment_type | ENUM | NOT NULL | 支払い形態 (onetime, subscription) |
| service_type | ENUM | NOT NULL | サービス種別 (product, project) |
| sales_start_dt | DATE | NOT NULL | 売上開始日 |
| sales_end_dt | DATE | | 売上終了日 (onetimeの場合はsales_start_dtと同じ) |
| amount | DECIMAL(15,2) | NOT NULL | 金額 |
| is_paid | BOOLEAN | DEFAULT FALSE | 支払い済みフラグ |
| description | TEXT | | 説明・備考 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

### 3. order_templates（注文テンプレート）
payment_typeとservice_typeの組み合わせごとの入力テンプレートを管理するテーブル（入力補助用）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|-----|
| template_id | UUID | PRIMARY KEY | テンプレートID |
| payment_type | ENUM | NOT NULL | 支払い形態 (onetime, subscription) |
| service_type | ENUM | NOT NULL | サービス種別 (product, project) |
| template_name | VARCHAR(255) | NOT NULL | テンプレート名 |
| amount | DECIMAL(15,2) | NOT NULL | デフォルト金額 |
| description | TEXT | | デフォルト説明・備考 |
| is_active | BOOLEAN | DEFAULT TRUE | アクティブフラグ |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新日時 |

## ENUM定義

### payment_type
- `onetime`: 一回払い
- `subscription`: 継続課金

### service_type
- `product`: プロダクトサービス
- `project`: プロジェクト案件

## インデックス設計

### customers テーブル
- PRIMARY KEY: customer_id
- UNIQUE INDEX: email
- INDEX: customer_name (部分一致検索用)

### orders テーブル
- PRIMARY KEY: order_id
- FOREIGN KEY INDEX: customer_id
- INDEX: sales_start_dt (日付範囲検索用)
- INDEX: payment_type, service_type (フィルタリング用)

### order_templates テーブル
- PRIMARY KEY: template_id
- UNIQUE INDEX: payment_type, service_type, template_name (同一条件での重複防止)
- INDEX: payment_type, service_type (検索用)
- INDEX: is_active (アクティブテンプレート抽出用)

## ビジネスルール

### 売上管理ルール
1. **一回払い (onetime)**
   - sales_end_dt は sales_start_dt と同じ日付
   - 支払い完了後は is_paid = TRUE

2. **継続課金 (subscription)**
   - sales_end_dt は継続終了日または NULL（継続中）
   - 月次課金の場合は毎月 is_paid をリセット

3. **金額管理**
   - 金額は税込み価格で管理
   - 通貨は JPY をデフォルトとするが、多通貨対応可能

### テンプレート管理ルール
1. **テンプレート設計**
   - payment_type と service_type の組み合わせごとに複数のテンプレートを作成可能
   - 同一条件（payment_type, service_type, template_name）での重複は禁止
   - is_active フラグでテンプレートの有効/無効を管理

2. **入力補助機能**
   - 注文作成時に payment_type と service_type を選択すると対応するテンプレートを提示
   - テンプレート選択時に amount と description がデフォルト値として入力される
   - ユーザーはテンプレート値を自由に変更可能

3. **テンプレート利用**
   - テンプレートと注文データは独立して管理（リレーションなし）
   - テンプレート削除/変更は既存の注文データに影響しない

### データ整合性
1. 顧客削除時は関連する注文データも論理削除
2. 売上データは原則として物理削除禁止
3. 金額データは監査ログとして保持
4. テンプレートの論理削除は is_active フラグで管理
