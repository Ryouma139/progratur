---
id: collections
title: コレクション
sidebar_label: コレクション
---

# コレクション

## `List<T>` — 可変長配列

```csharp
var list = new List<int> { 1, 2, 3 };
list.Add(4);
list.Insert(0, 0);      // 先頭に挿入
list.Remove(2);         // 値 2 を削除
list.RemoveAt(0);       // インデックス 0 を削除
bool has = list.Contains(3);
int idx = list.IndexOf(3);

foreach (var item in list)
{
    Console.WriteLine(item);
}
```

## `Dictionary<TKey, TValue>` — 連想配列

```csharp
var scores = new Dictionary<string, int>
{
    ["Alice"] = 90,
    ["Bob"] = 75,
};

scores["Carol"] = 88;             // 追加・更新
scores.TryGetValue("Dave", out int score); // キーがなければ score は 0

if (scores.TryGetValue("Alice", out int aliceScore))
{
    Console.WriteLine(aliceScore);
}

foreach (var (name, s) in scores) // KeyValuePair の分解代入
{
    Console.WriteLine($"{name}: {s}");
}
```

## `HashSet<T>` — 重複のない集合

```csharp
var a = new HashSet<int> { 1, 2, 3 };
var b = new HashSet<int> { 2, 3, 4 };

a.Add(3);           // 既に存在するので何も起きない
a.UnionWith(b);      // 和集合: {1,2,3,4}
a.IntersectWith(b);  // 積集合: {2,3,4}
a.ExceptWith(b);     // 差集合
```

## `Queue<T>` / `Stack<T>`

```csharp
var queue = new Queue<string>(); // FIFO
queue.Enqueue("A");
queue.Enqueue("B");
Console.WriteLine(queue.Dequeue()); // "A"

var stack = new Stack<string>(); // LIFO
stack.Push("A");
stack.Push("B");
Console.WriteLine(stack.Pop()); // "B"
```

## 配列 (Array)

```csharp
int[] fixed3 = new int[3];        // 既定値 (0) で初期化された固定長配列
int[] literal = { 1, 2, 3 };
int[,] matrix = new int[2, 3];    // 多次元配列
int[][] jagged = new int[2][];    // ジャグ配列（配列の配列）
jagged[0] = new[] { 1, 2 };
jagged[1] = new[] { 1, 2, 3 };
```

## 不変コレクション (Immutable)

```csharp
using System.Collections.Immutable;

var original = ImmutableList.Create(1, 2, 3);
var updated = original.Add(4); // 元の original は変更されず、新しいインスタンスが返る
Console.WriteLine(original.Count); // 3
Console.WriteLine(updated.Count);  // 4
```

## インターフェースの選び方

| インターフェース | 用途 |
| --- | --- |
| `IEnumerable<T>` | 列挙だけできればよい（読み取り専用の最小契約） |
| `ICollection<T>` | 件数取得・追加・削除も行いたい |
| `IList<T>` | インデックスアクセスも行いたい |
| `IReadOnlyList<T>` | 外部に公開するが変更はさせたくない |

:::tip[引数・戻り値の型選び]
メソッドの引数には要求する操作を満たす最小のインターフェース（例: 列挙するだけなら `IEnumerable<T>`）を使い、内部実装には具象型（`List<T>` など）を使うと、呼び出し側の柔軟性が上がります。
:::
