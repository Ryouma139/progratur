# progratur(本番用)

C# / Java / Python の学習用プログラミングリファレンスサイト。文法・ランタイム・標準ライブラリを、具体的なコード例とともにまとめる。[Docusaurus](https://docusaurus.io/) 製。

このリポジトリ（`Ryouma139/progratur`）は GitHub Pages による本番デプロイ用のソースリポジトリ。`main` ブランチへの push をトリガーに `.github/workflows/deploy.yml` が動き、`npm run build` の成果物（`build/`）を GitHub Pages にデプロイする。公開URLは [https://ryouma139.github.io/progratur/](https://ryouma139.github.io/progratur/) 。

## 構成

- `docs/` — C# & .NET リファレンス（`/csharp/` 配下）
- `java-docs/` — Java リファレンス（`/java/` 配下、現状は骨組みのみ）
- `python-docs/` — Python リファレンス（`/python/` 配下、現状は骨組みのみ）

3言語とも「文法 → ランタイム → 標準ライブラリ」という共通の章立てで揃えている。サイドバー定義は `sidebars.js`（C#）/ `sidebarsJava.js` / `sidebarsPython.js`。

### 関連ドキュメント

- [README_20260914.md](README_20260914.md) — サイト立ち上げの経緯、技術選定、ハマった不具合（admonition構文の互換性問題など）のまとめ

## ファイルのつながり（読み込み順・呼び出し元）

Docusaurus は起動時に `docusaurus.config.js` を読み込み、そこに書かれた設定から他のファイルを芋づる式に参照しにいく。読み込みの流れは次の通り。

```text
docusaurus.config.js                … 起点。npm start / npm run build が最初に読む
├─ presets[0] "classic" の docs オプション
│    id: 'csharp', path: 'docs', routeBasePath: 'csharp'
│    sidebarPath: './sidebars.js'   ──▶ sidebars.js を読み込む
│                                        └─ 各 items の文字列 ('syntax/if-for-switch' 等)
│                                           ──▶ docs/syntax/if-for-switch.md の
│                                               frontmatter `id:` と突き合わせて解決
├─ plugins[0] "@docusaurus/plugin-content-docs" (id: 'java')
│    path: 'java-docs', routeBasePath: 'java'
│    sidebarPath: './sidebarsJava.js' ──▶ sidebarsJava.js を読み込む
│                                          └─ java-docs/**/*.md を id で解決
├─ plugins[1] "@docusaurus/plugin-content-docs" (id: 'python')
│    path: 'python-docs', routeBasePath: 'python'
│    sidebarPath: './sidebarsPython.js' ──▶ sidebarsPython.js を読み込む
│                                            └─ python-docs/**/*.md を id で解決
├─ themeConfig.navbar.items[0..2] (type: 'docSidebar')
│    docsPluginId: 'csharp' | 'java' | 'python'
│    sidebarId: 'csharpSidebar' | 'javaSidebar' | 'pythonSidebar'
│    ──▶ 対応する sidebars*.js が export しているオブジェクトのキー名
│        （例: sidebars.js の `csharpSidebar: [...]`）を名前で探しにいく
├─ theme.customCss: './src/css/custom.css' ──▶ 全ページに適用される共通スタイル
└─ themeConfig.image / favicon / navbar.logo.src ──▶ static/img/ 配下の画像を参照

src/pages/index.js（トップページ = "/"）
└─ Link の href に '/csharp/intro' '/java/intro' '/python/intro' を直書き
   ──▶ 上記の routeBasePath + 各 intro.md の `slug: /intro` で決まる URL と一致させている
   （ここは自動解決ではなく手打ちなので、ルートを変えたら index.js も直す必要がある）
```

### 各ファイルが「どこから呼び出されるか」対応表

| ファイル | 呼び出し元 | 役割 |
| --- | --- | --- |
| `docusaurus.config.js` | `npm start` / `npm run build`（Docusaurus本体） | 全設定の起点 |
| `sidebars.js` | `docusaurus.config.js` の `presets[0].docs.sidebarPath` | C#サイドバーの章立てを定義 |
| `sidebarsJava.js` | `docusaurus.config.js` の `plugins[0].sidebarPath` | Javaサイドバーの章立てを定義 |
| `sidebarsPython.js` | `docusaurus.config.js` の `plugins[1].sidebarPath` | Pythonサイドバーの章立てを定義 |
| `docs/**/*.md` | `sidebars.js` の items 文字列（frontmatterの`id`で名前解決） | C#の本文ページ |
| `java-docs/**/*.md` | `sidebarsJava.js` の items 文字列 | Javaの本文ページ（現状スタブ） |
| `python-docs/**/*.md` | `sidebarsPython.js` の items 文字列 | Pythonの本文ページ（現状スタブ） |
| `docs/intro.md` 等の `slug: /intro` | `src/pages/index.js` のリンク先URLと対応 | 各言語トップの固定URL |
| `src/pages/index.js` | Docusaurusのファイルベースルーティング（`src/pages/` 配下は自動的にページ化される） | サイト全体のトップページ（3言語ハブ） |
| `src/css/custom.css` | `docusaurus.config.js` の `theme.customCss` | ダーク/パープルテーマの共通スタイル |
| `static/img/*` | `docusaurus.config.js` の `favicon` / `navbar.logo.src` / `themeConfig.image` | favicon・ロゴ・OGP画像 |

新しいページを1つ追加する場合の最短経路は「①`docs/`（または`java-docs/` `python-docs/`）に `.md` を置いて `id:` を書く → ②対応する `sidebars*.js` の `items` にその `id` を1行追加する」の2ステップ。逆にこの2つを両方揃えないと、ファイルを置いてもサイドバーに出てこない（＝迷子ページになる）。

## セットアップ

```bash
npm install
npm start
```

`http://localhost:3000` で確認できる。

## ビルド

```bash
npm run build
```

`build/` ディレクトリに静的ファイルが生成される。
