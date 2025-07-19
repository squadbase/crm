---
name: project:db:define
description: データベースのテーブルを作成する
---

## タスクの概要

このコマンドを使うと、データベースの定義を作成します。

使用例: `claude project:db:define`

`docs/database.md`にデータベースの定義を参考にテーブル定義、シードデータを作成してください。
テーブル定義の差分を確認して、`docs/database.md`を正としてテーブル定義、シードデータを更新してください。

## 操作対象

- `src/lib/db/schema.ts`にテーブル定義を作成してください。
- `src/lib/db/seed.ts`にシードデータを作成してください。
