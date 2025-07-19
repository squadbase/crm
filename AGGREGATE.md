# 集計ロジックの見直し

各ページの集計ロジックを見直して、集計ロジックや表示するメトリクスを整理しましょう。

## データベースの改修
データベースの改修をしてください。
`docs/database.md`を更新して、データベースのマイグレーションをして、その上で改善をしてください。
ordersを二つのテーブルに分けてください。
- orders: onetimeの注文だけを管理する。service_type, payment_type ,sales_start_dtとsales_end_dtは削除する。
- subscriptions: subscriptionの注文だけを管理する。

subscriptionsの定義は、
- subscription_id: UUID
- customer_id: UUID
- description: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

その他に以下のテーブルが必要です。

subscription_amounts:
- subscription_id: UUID
- amount: DECIMAL(15,2)
- start_date: DATE
- end_date: DATE
このテーブルでアップセルや解約率がわかります。

subscription_paid:
- subscription_id: UUID
- year: INTEGER
- month: INTEGER
年月を指定して支払い済を管理する

## Dashboard

### ページの目的

- 過去の売り上げの振り返りと将来の売り上げ予想の正確な把握
- 今月の売り上げ予定と前月比の把握
- 売り上げ関連の各種KPIのモニタリング

### 集計メトリクス

#### メトリクス

- 当月の売り上げ予定
    - onetimeの売上の合計
    - subscriptionの売り上げの合計
- 当月のそれぞれのカテゴリの注文数
    - onetimeの注文数
    - subscriptionの注文数
- 各種KPI
    - onetimeの注文単価
    - subscriptionの注文単価

#### 時系列チャート

時系列のチャートでは、毎月の売上の合計を表示します。チャートは毎月の中で1本の棒グラフとして表現します。
角棒の中でonetimeとsubscriptionの割合を色を分けて表示します。

#### ハイライトレコード

現在のままRecent OrdersとTop Customersを表示します。

## Orders

Payment Type別の売り上げなどのKPIをメトリクスに表示したいです。
subscriptionの場合のアップセルや平均契約期間なども集計できるようにしたいです。

- 当月のonetimeとsubscriptionの売り上げ比率と案件数
- onetimeの未払いの数
- subscriptionの未払いの数