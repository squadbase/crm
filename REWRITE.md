# Rewrite specification

## 1. Tailwind CSS v4 based UI

現在Tailwind CSS v3がインストールされていて、コードの中ではインラインのCSSが使われています。
このコードベースをTailwind CSS v4をインストールして、CSSで指定している部分はTailwind CSS v4のクラスを使って書き換えてください。

## 2. SQL related code should be isolated

SQL関連のコードは以下のルールでまとめてください。

### 集計系のクエリ

ダッシュボードで使用しているクエリは、それぞれSQLファイルとして分離してください。
SQLにプレースホルダーを使いたい場合もあると思うので、.tsファイルで構いませんがSQLの宣言以外はしない形でまとめてください。

`src/app/models/aggregates`ディレクトリにまとめてください。

### 単純なCRUD系のクエリ

単純にテーブルにCRUDをするためのクエリは、drizzleのORMをそのまま使用するとシンプルに記述できます。
これらはそれぞれ用途別に関数にして、`src/app/models`ディレクトリにまとめてください。

