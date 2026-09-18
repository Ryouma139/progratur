---
id: http
title: HTTP
sidebar_label: HTTP
---

# HTTP

## HttpClient の基本

`HttpClient` は接続を内部でプールするため、リクエストのたびに `new` して `using` で破棄するのは**アンチパターン**です。アプリケーション全体で使い回す（あるいは `IHttpClientFactory` を使う）のが基本です。

```csharp
// アプリ全体で1つ生成して使い回す（static もしくは DI コンテナで管理）
private static readonly HttpClient client = new HttpClient
{
    BaseAddress = new Uri("https://api.example.com/"),
    Timeout = TimeSpan.FromSeconds(10),
};
```

## GET リクエスト

```csharp
// 文字列としてそのまま取得
string json = await client.GetStringAsync("users/1");

// ステータスコードやヘッダーも扱いたい場合
HttpResponseMessage response = await client.GetAsync("users/1");
response.EnsureSuccessStatusCode(); // 2xx以外なら例外
string body = await response.Content.ReadAsStringAsync();

// JSONを直接デシリアライズ
var user = await client.GetFromJsonAsync<User>("users/1");
```

## POST / PUT リクエスト

```csharp
public record CreateUserRequest(string Name, string Email);

var request = new CreateUserRequest("Alice", "alice@example.com");

// JSON を自動シリアライズして送信
HttpResponseMessage res = await client.PostAsJsonAsync("users", request);
res.EnsureSuccessStatusCode();
var created = await res.Content.ReadFromJsonAsync<User>();

// 任意のコンテンツを送りたい場合
var content = new StringContent("raw body", Encoding.UTF8, "text/plain");
await client.PutAsync("users/1", content);
```

## ヘッダー・認証

```csharp
client.DefaultRequestHeaders.Add("User-Agent", "MyApp/1.0");

var req = new HttpRequestMessage(HttpMethod.Get, "secure/data");
req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
HttpResponseMessage secureRes = await client.SendAsync(req);
```

## エラー処理とタイムアウト

```csharp
try
{
    using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
    var res = await client.GetAsync("slow-endpoint", cts.Token);
    res.EnsureSuccessStatusCode();
}
catch (HttpRequestException ex)
{
    Console.WriteLine($"HTTPエラー: {ex.Message}");
}
catch (TaskCanceledException)
{
    Console.WriteLine("タイムアウトまたはキャンセルされました");
}
```

## ASP.NET Core での IHttpClientFactory

Webアプリ・APIサーバー側では `HttpClient` を直接 `new` せず、`IHttpClientFactory` 経由で取得するのが推奨されます（接続の再利用・DNS変更への追従・名前付き構成が可能）。

```csharp
// Program.cs
builder.Services.AddHttpClient("api", c =>
{
    c.BaseAddress = new Uri("https://api.example.com/");
});

// 利用側（DIで受け取る）
public class UserService(IHttpClientFactory factory)
{
    public Task<User?> GetUserAsync(int id)
    {
        var client = factory.CreateClient("api");
        return client.GetFromJsonAsync<User>($"users/{id}");
    }
}
```
