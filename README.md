# Starlight Issue Wiki

GitHubのイシューをベースにしたコンテンツウィキサイト。AstroフレームワークとそのドキュメンテーションフレームワークであるStarlightを使用して構築されています。

## 概要

このプロジェクトは、GitHub上のイシュートラッカーの情報をウィキ形式で閲覧できるようにするウェブアプリケーションです。イシューにタグ付けされた情報を見やすい形で整理し、ナレッジベースとして活用することができます。

## デモサイト

サイトは以下のURLで公開されています：
https://nao-amj.github.io/starlight-issue-wiki-refactored/

## 主な機能

- GitHubイシューからのコンテンツ自動生成
- カテゴリーとタグによるコンテンツ整理
- レスポンシブデザイン
- コードシンタックスハイライト
- 全文検索機能

## 技術スタック

- [Astro](https://astro.build/) - 静的サイトジェネレーター
- [TypeScript](https://www.typescriptlang.org/) - 型安全なJavaScript
- [GitHub Octokit](https://github.com/octokit/rest.js/) - GitHub APIクライアント
- [Marked](https://marked.js.org/) - Markdownパーサー
- [Shiki](https://shiki.matsu.io/) - コードシンタックスハイライター

## ローカル開発環境のセットアップ

### 前提条件

- Node.js 18以上
- npm 9以上

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/nao-amj/starlight-issue-wiki-refactored.git
cd starlight-issue-wiki-refactored

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

これで開発サーバーが http://localhost:4321/starlight-issue-wiki-refactored/ で起動します。

## ビルドとデプロイ

### 手動ビルド

```bash
# プロジェクトをビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

ビルドしたファイルは `dist` ディレクトリに出力されます。

### 自動デプロイ

このプロジェクトはGitHub Actionsを使用して自動デプロイが設定されています。`main`ブランチにプッシュすると、以下のフローが実行されます：

1. コードをチェックアウト
2. Node.jsと依存関係をセットアップ
3. プロジェクトをビルド
4. ビルド結果をGitHub Pagesにデプロイ

## カスタマイズ

サイトをカスタマイズする場合は、以下のファイルを編集してください：

- `astro.config.mjs` - サイト全体の設定
- `src/components/` - UIコンポーネント
- `src/layouts/` - ページレイアウト
- `src/pages/` - コンテンツページ
- `src/styles/` - CSSスタイル

## ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## コントリビューション

バグ報告や機能追加のリクエストは、GitHubのイシュートラッカーを通じてお願いします。プルリクエストも歓迎します。
