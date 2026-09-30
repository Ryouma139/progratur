---
slug: claude-code-cloudflare-integration
title: Claude CodeとCloudflareを連携すると何ができるのか
authors: [ryouma]
tags: [claude-code, cloudflare, mcp, ai]
---

Claude Codeはプラグイン形式でMCP（Model Context Protocol）サーバーを追加でき、外部サービスをエージェント経由で操作できるようになります。CloudflareもMCPサーバーを公式に提供しており、連携すると何が可能になるのかを整理します。

{/* truncate */}

## セットアップの流れ

Cloudflareとの連携は、Claude Codeのプラグイン機構を通して行います。

```
/plugin marketplace add cloudflare/skills
/plugin install cloudflare@cloudflare
```

1つ目のコマンドで、CloudflareがGitHub上で公開している `cloudflare/skills` リポジトリをプラグインマーケットプレイスとして登録します。2つ目のコマンドで、そこから「Cloudflare Skills」と「Cloudflare MCPサーバー」をインストールします。インストール範囲は `local` / `project` / `user` のいずれかから選択できます。

インストール後、`/plugin` コマンドの Installed タブから「Cloudflare MCP」を選ぶと、ブラウザ経由でCloudflareダッシュボードにアクセスしOAuth認証を行う流れになります。

## 連携で何ができるようになるか

MCPサーバーを通じて、Claude CodeがCloudflareのアカウント情報や設定を直接参照・操作できるようになります。具体的に確認されている操作は次の通りです。

| カテゴリ | できること |
| --- | --- |
| アカウント情報 | ログイン中のユーザー詳細、所属組織の確認 |
| ゾーン（ドメイン）管理 | 登録済みドメインの設定情報の取得 |
| セキュリティ設定 | WAFルールやマネージドルールセットの確認・分析 |

加えて、「Cloudflareプラットフォーム上でAI開発環境を構築・デプロイするためのスキル」も複数同梱されています。Workers・KV・R2・D1といった個別のプロダクト向けには、これとは別に**ドメイン固有のMCPサーバー**も用意されているとのことで、今回の連携はまず「アカウント横断でCloudflareの設定状況を会話しながら把握する」用途が主軸になります。

## 認証方法の選択肢と注意点

認証方式は2種類用意されており、それぞれ特性が異なります。

### OAuth認証（推奨）
- Webブラウザ経由で認証し、「Read only」「Editor」などのアクセステンプレートから権限スコープを選べる
- 認証情報はマシン単位で共有される。**作業ディレクトリを切り替えても同じアカウントのまま**になる点に注意

### APIトークン（Bearer Token）
- `.mcp.json` にトークンを記載する方式で、作業ディレクトリごとに異なるアカウントを設定できる
- ただし**トークンが平文で保存される**ため、リポジトリへの誤コミットなどに注意が必要
- 現状、IPアドレスによるアクセス制限には対応していない

複数アカウントを使い分けたい場合は、`/mcp` コマンドから「Clear authentication」で一旦認証情報を削除し、別アカウントで再度「Authenticate」する、という手順を踏みます。

## 運用上のポイント

- 権限設定はMCPサーバー側にそのまま反映される。Read onlyでインストールしていれば書き込み系の操作は行えない
- OAuth認証はマシン単位で共有されるため、複数プロジェクト・複数アカウントを横断して作業する場合は認証切り替えの手間を考慮する
- APIトークンを使う場合、`.mcp.json` がリポジトリにコミットされないよう`.gitignore`などで確実に除外する

## まとめ

Claude CodeとCloudflareの連携は、MCPプラグインのインストールとOAuth認証だけで完了する手軽さが特徴です。ドメイン管理やWAF設定の確認といった「調べる」作業をエージェント越しに行える一方、認証情報の共有範囲（OAuthはマシン単位）やAPIトークンの平文保存といったセキュリティ面の特性は把握した上で使う必要があります。

参考: [Claude CodeとCloudflareを連携してみた - Classmethod](https://dev.classmethod.jp/articles/cloudflare-agent-setup-claude-code/)
