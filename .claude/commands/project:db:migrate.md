---
name: project:db:migrate
description: データベースのテーブルを作成する
---

## タスクの概要

このコマンドを使うと、データベースのテーブルを作成します。

使用例: `claude project:db:migrate`

`src/lib/db/schema.ts`, `src/lib/db/seed.ts`に定義されているテーブルをマイグレーションしてください。
テーブルのマイグレーションには必ずpackage.jsonに定義されているDB関連のコマンドを使用してください。

## 操作対象

dockerでデータベースを立ち上げて、マイグレーションを行ってください。