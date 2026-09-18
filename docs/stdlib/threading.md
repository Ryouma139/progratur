---
id: threading
title: スレッド
sidebar_label: スレッド
---

# スレッド

## Thread — 低レベルなスレッド生成

`Thread` クラスで直接 OS スレッドを起動できますが、通常のアプリケーションコードでは後述の `Task` ベースの並行処理を使う方が一般的です。

```csharp
var thread = new Thread(() =>
{
    Console.WriteLine($"別スレッドで実行中: {Environment.CurrentManagedThreadId}");
});
thread.Start();
thread.Join(); // 終了を待つ
```

## Task — 高レベルな並行処理

```csharp
// CPUバウンドな処理をスレッドプールで実行
Task<int> task = Task.Run(() =>
{
    int sum = 0;
    for (int i = 0; i < 1_000_000; i++) sum += i;
    return sum;
});

int result = await task;

// 複数タスクの並行実行
var tasks = Enumerable.Range(0, 5)
    .Select(i => Task.Run(() => i * i))
    .ToArray();
int[] results = await Task.WhenAll(tasks);
```

## Parallel クラス — データ並列処理

```csharp
var data = Enumerable.Range(1, 1000).ToArray();

Parallel.For(0, data.Length, i =>
{
    data[i] = data[i] * 2;
});

Parallel.ForEach(data, item =>
{
    Process(item);
});

void Process(int item) { /* 何らかの処理 */ }
```

## 排他制御 — lock / Monitor

複数スレッドから同じデータを書き換える場合は、競合状態 (race condition) を避けるために排他制御が必要です。

```csharp
private readonly object _lockObj = new();
private int _counter = 0;

public void Increment()
{
    lock (_lockObj) // 一度に1スレッドだけがこのブロックに入れる
    {
        _counter++;
    }
}
```

## スレッドセーフなコレクション

```csharp
using System.Collections.Concurrent;

var dict = new ConcurrentDictionary<string, int>();
dict.AddOrUpdate("count", 1, (key, old) => old + 1);

var queue = new ConcurrentQueue<int>();
queue.Enqueue(1);
queue.TryDequeue(out int value);

// 排他制御なしでカウンタをインクリメントしたい場合
int counter = 0;
Interlocked.Increment(ref counter);
```

## SemaphoreSlim — 同時実行数の制限

```csharp
var semaphore = new SemaphoreSlim(initialCount: 3); // 同時に3つまで

async Task LimitedTaskAsync(int id)
{
    await semaphore.WaitAsync();
    try
    {
        Console.WriteLine($"タスク{id}実行中");
        await Task.Delay(1000);
    }
    finally
    {
        semaphore.Release();
    }
}
```

:::note[Task と Thread の使い分け]
`Thread` は1つのOSスレッドを直接占有しますが、`Task` はスレッドプールで管理され、非同期I/O待ちの間はスレッドを占有しません。基本的には `Task` / `async`・`await` を使い、細かいスレッド制御が本当に必要な場合のみ `Thread` を検討します。
:::
