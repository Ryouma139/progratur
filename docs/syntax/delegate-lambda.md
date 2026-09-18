---
id: delegate-lambda
title: delegate / lambda
sidebar_label: delegate / lambda
---

# delegate / lambda

## delegate — メソッドを参照する型

`delegate` は「このシグネチャのメソッドを指す型」を定義します。関数を変数として持ち回したり、引数として渡したりするための仕組みです。

```csharp
// シグネチャ: int を受け取り bool を返すメソッドの型
public delegate bool Predicate(int value);

bool IsEven(int value) => value % 2 == 0;

Predicate predicate = IsEven;
Console.WriteLine(predicate(4)); // True

// メソッドチェーン: 複数のメソッドをまとめて呼び出す（マルチキャストデリゲート）
Action<string> log = Console.WriteLine;
log += msg => File.AppendAllText("log.txt", msg + "\n");
log("処理開始"); // コンソール出力とファイル追記の両方が実行される
```

## 組み込みデリゲート — Action / Func / Predicate

自前の `delegate` を定義しなくても、.NET には汎用のデリゲート型が用意されています。

| 型 | 意味 |
| --- | --- |
| `Action` | 引数なし・戻り値なし |
| `Action<T1, T2, ...>` | 引数あり・戻り値なし |
| `Func<T1, ..., TResult>` | 引数あり・最後の型引数が戻り値 |
| `Predicate<T>` | `T` を受け取り `bool` を返す（`Func<T, bool>` と同義） |

```csharp
Action greet = () => Console.WriteLine("こんにちは");
Func<int, int, int> add = (a, b) => a + b;
Predicate<string> isEmpty = s => string.IsNullOrEmpty(s);

greet();
Console.WriteLine(add(2, 3));       // 5
Console.WriteLine(isEmpty(""));     // True
```

## lambda 式

```csharp
// 式形式（本体が単一の式）
Func<int, int> square = x => x * x;

// 文形式（本体が複数の文、{}で囲む）
Func<int, int, int> max = (a, b) =>
{
    if (a > b) return a;
    return b;
};

// LINQ での典型的な使い方
var names = new[] { "Alice", "Bob", "Carol" };
var shortNames = names.Where(n => n.Length <= 3).ToList();
```

## クロージャ — 外側の変数を捕捉する

ラムダ式は定義された時点のスコープにある変数（ローカル変数）を「キャプチャ」できます。

```csharp
Func<int, int> MakeCounter()
{
    int count = 0;
    return step =>
    {
        count += step; // 外側の count を捕捉している
        return count;
    };
}

var counter = MakeCounter();
Console.WriteLine(counter(1)); // 1
Console.WriteLine(counter(2)); // 3（同じ count を共有）
```

:::caution[ループ変数のキャプチャ]
`for` / `foreach` のループ変数をラムダで捕捉すると、C# 5.0 以降は「ループの各反復ごとに新しい変数」として扱われるため意図通りに動きますが、変数をループの外で使い回している場合は最終的な値だけが捕捉される点に注意してください。
:::
