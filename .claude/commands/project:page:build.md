---
name: project:page:build
description: ダッシュボードのページを実装する
---

## タスクの概要

このコマンドを使うと、アプリのページを実装します。追加したページはBI Dashboardのメニューに追加してください。
ページ内のタイトルや説明分の色や配置は他のページと合わせるようにしてください。

使用例: `claude project:page:build {page-name}`

※ {page-name}が指定されていない場合は、実行前に必ず確認しなおしてください。

- `docs/pages/CLAUDE.md`が全体のページ定義のガイドラインです。
- `docs/pages/{page-name}/CLAUDE.md`に記載されている内容が作成するアプリの要件定義書です。
- `docs/pages/{page-name}/design.md`に記載されている内容が実装方針です。

## 操作対象

Next.jsのアプリを実装してアプリのページを実装してください。
