---
slug: http-client-comparison
title: C# / Java / Python の標準HTTPクライアントを比較する
authors: [ryouma]
tags: [csharp, java, python, http, api]
---

外部APIを呼ぶ処理は、どの言語で書いても最終的にやること（GETする、JSONを投げる、認証ヘッダーを付ける、タイムアウトを設定する）はほぼ同じです。しかし標準ライブラリのAPI設計は言語ごとにかなり性格が違います。3言語の「標準搭載のHTTPクライアント」を横に並べて比較してみます。

{/* truncate */}

## 比較表

| | C# | Java | Python |
| --- | --- | --- | --- |
| クラス | `System.Net.Http.HttpClient` | `java.net.http.HttpClient` (11+) | `urllib.request`（標準）/ `requests`（事実上の標準） |
| 非同期の扱い | `async`/`await`が標準搭載、同期APIは基本無し | 同期(`send`)・非同期(`sendAsync`)を両方提供 | 標準は同期のみ。非同期は`aiohttp`/`httpx`が別途必要 |
| JSON連携 | `GetFromJsonAsync<T>`など`System.Net.Http.Json`拡張で直結 | 標準では非対応、Jackson等と手動で組み合わせ | 標準では非対応、`requests`の`.json()`で簡易対応 |
| インスタンスの扱い | アプリ全体で使い回す（`IHttpClientFactory`推奨） | スレッドセーフなのでシングルトンで使い回す | `requests.Session()`で使い回す |
| エラー時の挙動 | 4xx/5xxでも例外は飛ばない（`EnsureSuccessStatusCode()`が必要） | 同上、ステータスコードは自分でチェック | `requests`も同様（`raise_for_status()`が必要） |

3つとも「4xx/5xx で自動的に例外にはならない」という共通の罠がある一方、**非同期をどこまで標準機能として抱え込むか**の思想差がはっきり出ています。

## GET リクエストの見比べ

```csharp title="C#"
HttpResponseMessage response = await client.GetAsync("users/1");
response.EnsureSuccessStatusCode();
var user = await client.GetFromJsonAsync<User>("users/1");
```

```java title="Java (java.net.http)"
HttpRequest req = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users/1"))
    .GET()
    .build();
HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
```

```python title="Python (requests)"
resp = session.get("https://api.example.com/users/1", timeout=10)
resp.raise_for_status()
data = resp.json()
```

C# は `HttpClient` に加えて `System.Net.Http.Json` という拡張メソッド群を標準ライブラリ側で用意しており、JSONとの往復が1行で書けるように設計されています。Java はビルダーパターンでリクエストを組み立てる分、記述量は増えますが、`BodyHandlers`によって「文字列で受け取るか」「ファイルに直接落とすか」を型で選べる柔軟さがあります。Python の `requests` は標準ライブラリではなくサードパーティですが、実質的にPythonでHTTPを書く際のデファクトスタンダードになっています。

## なぜ Python だけ標準に「事実上の標準」が要るのか

C# と Java は、それぞれ .NET / JDK に強力なHTTPクライアントを標準搭載した時期（.NET 初期、Java 11）がありました。一方Pythonの標準 `urllib` は歴史的経緯からAPIが低レベルなまま据え置かれ、コミュニティ側で `requests` が事実上の標準の座を獲得しました。標準ライブラリを見るだけでは分からない、こうしたエコシステムの成熟過程の違いも、複数言語を横断すると見えてきます。

詳しい書き方は各言語のリファレンスも参照してください: [C# HTTP](/csharp/stdlib/http) / [Java HTTP](/java/stdlib/http) / [Python HTTP](/python/stdlib/http)
