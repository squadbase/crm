---
name: project:page:design
description: アプリのページの実装方針を設計する
---

## タスクの概要

このコマンドを使うと、アプリのページの実装方針を設計します。

使用例: `claude project:page:design {page-name}`

※ {page-name}が指定されていない場合は、実行前に必ず確認しなおしてください。

- `docs/pages/{page-name}/CLAUDE.md`に記載されている方針に従ってページの実装方針を設計してください。
- `docs/pages/{page-name}/CLAUDE.md`に記載されている内容が実装方針を立てるべきアプリのページの要件定義書になります。
- `docs/pages/{page-name}/design.md`に記載されている内容が実装方針になります。このファイルがある場合は過去の実装方針として参考にしてください。
- `docs/pages/{page-name}/validation.md`に記載されている内容が実装方針の検証結果になります。このファイルがある場合は過去の検証結果として参考にしてください。

## 操作対象

`docs/pages/{page-name}/design.md`を更新してください。

以下の内容を必ず含めるようにしてください。
- ページのタイトル
- ページのレイアウトや使用するUIコンポーネント
- ページに使用するデータベースのテーブルとその処理方法