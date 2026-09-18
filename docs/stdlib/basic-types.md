---
id: basic-types
title: 基本型
sidebar_label: 基本型
---

# 基本型

## 数値型

| 型 | サイズ | 範囲・用途 |
| --- | --- | --- |
| `int` | 32bit | 一般的な整数。既定の整数リテラル型 |
| `long` | 64bit | 大きな整数。リテラルは `10000000000L` |
| `double` | 64bit 浮動小数点 | 既定の小数リテラル型。誤差あり |
| `decimal` | 128bit 10進数 | 金額計算など誤差を避けたい場合。リテラルは `10.5m` |
| `bool` | - | `true` / `false` |
| `char` | 16bit | UTF-16 の1コード単位 |

```csharp
int i = 42;
long big = 10_000_000_000L; // アンダースコアは桁区切りとして無視される
double d = 3.14;
decimal price = 1980.5m; // 通貨計算には double でなく decimal を使う

Console.WriteLine(0.1 + 0.2);         // 0.30000000000000004 (double の誤差)
Console.WriteLine(0.1m + 0.2m);       // 0.3 (decimal は誤差なし)
```

## string — 文字列

`string` は参照型ですが不変（immutable）です。一度作った文字列の内容は変更できず、連結などの操作は常に新しい文字列を生成します。

```csharp
string s1 = "Hello";
string s2 = s1 + ", World!"; // s1 自体は変わらず、新しい文字列が作られる

// 文字列補間（推奨）
int age = 30;
string message = $"年齢は {age} 歳です";

// 逐語的文字列（エスケープ不要、パス表記などに便利）
string path = @"C:\Users\example\file.txt";

// 大量連結には StringBuilder（string の都度生成コストを避ける）
var sb = new StringBuilder();
for (int i = 0; i < 5; i++)
{
    sb.Append(i).Append(',');
}
Console.WriteLine(sb.ToString()); // 0,1,2,3,4,
```

## null許容型 (Nullable)

```csharp
// 値型に null を許容する
int? maybeNumber = null;
if (maybeNumber.HasValue)
{
    Console.WriteLine(maybeNumber.Value);
}
Console.WriteLine(maybeNumber ?? -1); // null なら -1（null 合体演算子）

// 参照型の null許容 (C# 8.0+, nullable reference types)
string? maybeName = null;
Console.WriteLine(maybeName?.Length); // null条件演算子: null なら全体が null
```

## キャストと変換

```csharp
double d = 3.9;
int truncated = (int)d;           // 3 (明示的キャスト、小数部切り捨て)

string numText = "123";
int parsed = int.Parse(numText);           // 失敗時は例外
bool ok = int.TryParse("abc", out int n);  // 失敗時は false、例外を投げない

object boxed = 42;                 // ボックス化: 値型 → object
int unboxed = (int)boxed;          // アンボックス化
```

:::caution[ボックス化のコスト]
値型を `object` などの参照型として扱うと**ボックス化**が発生し、ヒープ割り当てが起きます。ループ内で頻繁に発生するとパフォーマンスに影響するため、ジェネリクス（`List<int>` など）を使ってボックス化を避けるのが基本です。
:::
