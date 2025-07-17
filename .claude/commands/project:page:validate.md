---
name: project:page:validate
description: アプリのページの実装方針を検証する
---

## タスクの概要

このコマンドを使うと、アプリのページの実装方針を検証します。
実装方針を確認して、実際にSnowflakeのSQLを実行することでそのようなデータを本当に取得することができて集計が可能か、技術的な検証を行ってください。

使用例: `claude project:page:validate {page-name}`

※ {page-name}が指定されていない場合は、実行前に必ず確認しなおしてください。

- `docs/pages/CLAUDE.md`が全体のページ定義のガイドラインです。
- `docs/pages/{page-name}/CLAUDE.md`に記載されている内容が作成するアプリの要件定義書です。
- `docs/pages/{page-name}/design.md`に記載されている内容が実装方針です。

### 検証方法

`npm run sql {SQL}`を実行するとSQLの実行結果をJSONで取得することができます。DBが立ち上がっていない場合は、package.jsonに記載されているコマンドを使ってテーブルを立ち上げてから実行してください。

## 操作対象

`docs/pages/{page-name}/validation.md`に実装方針についてのフィードバックを記載してください。
フィードバックの中には評価の点数(0~100点)と実装に進んで良いレベルか、まだ再設計が必要か記載をしてください。