---
id: http
title: HTTP
sidebar_label: HTTP
---

# HTTP (java.net.http, Java 11+)

```java
import java.net.http.*;
import java.net.URI;

// HttpClient はスレッドセーフ — シングルトンで使う
HttpClient client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(10))
    .followRedirects(HttpClient.Redirect.NORMAL)
    .build();

// --- GET ---
HttpRequest getReq = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users/1"))
    .header("Accept", "application/json")
    .GET()
    .build();

// 同期
HttpResponse<String> res = client.send(getReq,
    HttpResponse.BodyHandlers.ofString());
System.out.println(res.statusCode()); // 200
System.out.println(res.body());

// 非同期
CompletableFuture<HttpResponse<String>> future =
    client.sendAsync(getReq, HttpResponse.BodyHandlers.ofString());

future.thenApply(HttpResponse::body)
      .thenAccept(System.out::println)
      .join(); // 完了を待つ

// --- POST JSON ---
String payload = "{\"name\":\"Alice\",\"age\":30}";
HttpRequest postReq = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(payload))
    .build();

HttpResponse<String> postRes = client.send(postReq,
    HttpResponse.BodyHandlers.ofString());

// バイナリ (ファイルダウンロード)
HttpRequest dlReq = HttpRequest.newBuilder()
    .uri(URI.create("https://example.com/file.zip"))
    .build();
HttpResponse<Path> dlRes = client.send(dlReq,
    HttpResponse.BodyHandlers.ofFile(Path.of("downloaded.zip")));
```

:::note[HttpClient はシングルトンで使う]
`HttpClient` は接続プールを内部で管理しているため、リクエストごとに `newBuilder().build()` するのではなく、アプリケーション全体で1つのインスタンスを使い回すのが推奨です。スレッドセーフなので共有しても問題ありません。
:::
