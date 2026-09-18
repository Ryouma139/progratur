---
id: async-await
title: async / await
sidebar_label: async / await
---

# async / await

## 基本形

`async` を付けたメソッドの中で `await` を使うと、非同期処理の完了を待つ間スレッドをブロックせずに済みます。戻り値は `Task`（値を返さない）または `Task<T>`（`T` を返す）にします。

```csharp
public async Task<string> FetchDataAsync()
{
    using var client = new HttpClient();
    // await した時点で呼び出し元スレッドは解放される
    string result = await client.GetStringAsync("https://example.com");
    return result;
}

// 呼び出し側
string data = await FetchDataAsync();
Console.WriteLine(data);
```

## `Task` / `Task<T>` / `ValueTask<T>`

```csharp
// 値を返さない非同期処理
public async Task SaveAsync(string text)
{
    await File.WriteAllTextAsync("out.txt", text);
}

// 値を返す非同期処理
public async Task<int> CountLinesAsync(string path)
{
    var lines = await File.ReadAllLinesAsync(path);
    return lines.Length;
}

// 割り当てを減らしたい高頻度呼び出し向け（キャッシュヒット等）には ValueTask<T>
public ValueTask<int> GetCachedOrComputeAsync(int key)
{
    if (_cache.TryGetValue(key, out var value))
    {
        return new ValueTask<int>(value); // 同期完了、Task割り当てなし
    }
    return new ValueTask<int>(ComputeAsync(key));
}
```

## 並行実行 — Task.WhenAll / Task.WhenAny

複数の非同期処理を直列に `await` すると合計時間がかかります。並行に走らせたい場合は `Task.WhenAll` を使います。

```csharp
Task<string> t1 = FetchAsync("https://a.example.com");
Task<string> t2 = FetchAsync("https://b.example.com");

// 2つのリクエストを同時に実行し、両方の完了を待つ
string[] results = await Task.WhenAll(t1, t2);

// どれか1つが終わった時点で進めたい場合
Task<string> firstDone = await Task.WhenAny(t1, t2);
```

## 例外処理

`await` している式が例外を投げた場合、通常の `try/catch` でそのまま捕捉できます。

```csharp
try
{
    await FetchDataAsync();
}
catch (HttpRequestException ex)
{
    Console.WriteLine($"通信エラー: {ex.Message}");
}
```

## キャンセル — CancellationToken

長時間かかる非同期処理は `CancellationToken` を受け取れるようにし、呼び出し元がキャンセルできるようにするのが定石です。

```csharp
public async Task ProcessAsync(CancellationToken ct)
{
    for (int i = 0; i < 100; i++)
    {
        ct.ThrowIfCancellationRequested();
        await Task.Delay(100, ct);
    }
}

using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));
try
{
    await ProcessAsync(cts.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("キャンセルされました");
}
```

:::caution[async void は避ける]
`async void` は呼び出し元が完了を待てず、例外も呼び出し元に伝播しません（アプリがクラッシュすることがあります）。イベントハンドラー以外では常に `async Task` を使ってください。
:::
