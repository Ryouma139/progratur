---
id: linq-methods
title: LINQ 拡張メソッド
sidebar_label: LINQ 拡張メソッド
---

# LINQ 拡張メソッド

[LINQ 文法](../syntax/linq.md) で紹介したクエリ構文は、実際には `System.Linq` 名前空間の拡張メソッド呼び出しに変換されます。メソッド構文の方がよく使われるので、代表的なものをまとめます。

## フィルタ・射影

```csharp
var numbers = Enumerable.Range(1, 10); // 1〜10

var evens = numbers.Where(n => n % 2 == 0);
var doubled = numbers.Select((n, index) => n * 2); // index も受け取れる
var names = new[] { "Alice", "Bob" };
var lengths = names.Select(n => n.Length);
```

## 集計

```csharp
var scores = new[] { 80, 92, 75, 60, 88 };

int sum = scores.Sum();
double avg = scores.Average();
int max = scores.Max();
int min = scores.Min();
int count = scores.Count(s => s >= 80);

// Aggregate: 任意の畳み込み処理（他言語の reduce に相当）
int product = scores.Aggregate(1, (acc, s) => acc * s > 0 ? acc : acc); // 累積計算の例
string joined = names.Aggregate((a, b) => $"{a}, {b}"); // "Alice, Bob"
```

## 並び替え・グループ化

```csharp
var sorted = scores.OrderBy(s => s);              // 昇順
var sortedDesc = scores.OrderByDescending(s => s); // 降順
var multiSort = names
    .OrderBy(n => n.Length)
    .ThenBy(n => n); // 第一キーが同じ場合の第二キー

var grouped = names.GroupBy(n => n.Length);
foreach (var g in grouped)
{
    Console.WriteLine($"長さ{g.Key}: {string.Join(",", g)}");
}
```

## 要素の取得

```csharp
var first = names.First();                 // なければ例外
var firstOrNull = names.FirstOrDefault();   // なければ既定値 (参照型なら null)
var single = names.SingleOrDefault(n => n == "Bob"); // 0件/2件以上なら例外(Default系は0件ならnull)
var any = numbers.Any(n => n > 5);          // 1つでも条件を満たすか
var all = numbers.All(n => n > 0);          // 全て条件を満たすか

var top3 = numbers.Take(3);        // 先頭3件
var skip3 = numbers.Skip(3);       // 先頭3件を飛ばす
var page2 = numbers.Skip(3).Take(3); // ページング
```

## 集合演算・変換

```csharp
var a = new[] { 1, 2, 3 };
var b = new[] { 2, 3, 4 };

var union = a.Union(b);         // {1,2,3,4}
var intersect = a.Intersect(b); // {2,3}
var except = a.Except(b);       // {1}

List<int> list = numbers.ToList();
int[] array = numbers.ToArray();
Dictionary<int, int> dict = numbers.ToDictionary(n => n, n => n * n);
```

:::note[`IEnumerable<T>` と遅延実行]
`Where` / `Select` などは呼び出した時点では実行されず、`ToList()` や `foreach` で列挙されて初めて処理が走ります。データベースクエリ (Entity Framework Core など) では、この特性を利用して LINQ 式が SQL に変換されてから実行されます。
:::
