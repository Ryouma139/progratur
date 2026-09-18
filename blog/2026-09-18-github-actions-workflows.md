---
slug: github-actions-workflows
title: GitHub Actions のワークフローとは何か
authors: [ryouma]
tags: [github-actions, ci-cd, devops]
---

このリポジトリ自体も `.github/workflows/deploy.yml` で GitHub Pages への自動デプロイを行っています。改めて GitHub Actions の「ワークフロー」がどういう概念で構成されているかを、公式ドキュメントに沿って整理します。

参考: [GitHub Docs - ワークフローと Actions の概念](https://docs.github.com/ja/actions/concepts/workflows-and-actions/workflows)

{/* truncate */}

## ワークフローとは

**ワークフロー（Workflow）** とは、1つ以上のジョブを実行する「構成可能な自動化プロセス」のこと。YAMLファイルとして定義し、リポジトリの `.github/workflows` ディレクトリに置く。1つのリポジトリに複数のワークフローを置くことができ、それぞれ「テスト用」「デプロイ用」「Issueの自動ラベリング用」のように役割を分けて運用できる。

## ワークフローを構成する3要素

ワークフローは大きく3つの要素の組み合わせで成り立つ。

| 要素 | 役割 |
| --- | --- |
| イベント（Event） | ワークフローを起動するきっかけ。`on` キーで定義する |
| ジョブ（Job） | ランナー（実行環境）上で走る処理のまとまり |
| ステップ（Step） | ジョブの中の個別タスク。スクリプト実行 or アクション呼び出し |

さらにジョブの中で使う **アクション（Action）** と、実際にジョブを実行するマシンである **ランナー（Runner）** を合わせて理解すると全体像がつかめる。

- **Job**: ランナー上で実行される処理単位。1つのワークフローに複数のジョブを定義でき、既定では並列実行される（`needs` で依存関係を張ると順序を制御できる）
- **Step**: ジョブ内の個別タスク。シェルコマンドを直接実行するか、再利用可能なアクションを呼び出す
- **Action**: ワークフローの記述を簡略化するための「再利用可能な拡張機能」。自作もできるし、GitHub Marketplace で公開されているものを使うこともできる
- **Runner**: ジョブが実際に実行されるマシン環境（GitHub がホストする `ubuntu-latest` などのほか、セルフホストランナーも使える）

## トリガーの種類

ワークフローの実行は次のいずれかによって開始される。

- リポジトリ内のイベント（`push`、`pull_request`、`release` の作成など）
- 外部システムからの `repository_dispatch`
- `schedule` によるcron定期実行
- `workflow_dispatch` による手動実行

## 実行の流れ

1. リポジトリ内でイベントが発生する
2. GitHub がそのコミットSHAに対応するワークフローファイルを探す
3. `on` の条件に一致するワークフローが起動する
4. ランナー環境が用意され、`GITHUB_SHA`（コミットSHA）や `GITHUB_REF`（Git ref）などの環境変数が設定された上でジョブが実行される

## 具体例：このリポジトリのデプロイワークフロー

このサイトの `main` ブランチへの push をトリガーに、Docusaurusのビルド成果物を GitHub Pages にデプロイしている実際の設定が以下。

```yaml title=".github/workflows/deploy.yml"
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - uses: actions/configure-pages@v5

      - uses: actions/upload-pages-artifact@v3
        with:
          path: build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

この1ファイルの中に、ここまで説明した概念がすべて対応づけられる。

| YAMLのキー | 対応する概念 |
| --- | --- |
| `on.push.branches` / `on.workflow_dispatch` | トリガー（イベント） |
| `jobs.build` / `jobs.deploy` | ジョブ。2つ定義されており `needs: build` で `deploy` が `build` の後に実行されるよう順序づけている |
| `runs-on: ubuntu-latest` | ランナー |
| `steps` 配下の各項目 | ステップ |
| `uses: actions/checkout@v4` 等 | アクションの呼び出し |
| `run: npm ci` / `run: npm run build` | シェルコマンドを直接実行するステップ |
| `with: { node-version: 20, cache: npm }` | 呼び出すアクションへの入力パラメータ |

## まとめ

GitHub Actions のワークフローは「イベントで起動し、ジョブの中のステップを順に実行する」というシンプルな構造の組み合わせでできている。`on` でいつ動かすか、`jobs` で何を並列/直列に走らせるか、`steps` で各ジョブの中身（自作コマンド or 既存アクション）を決める、という3層で読み解くと、他人が書いたワークフローファイルも追いやすくなる。
