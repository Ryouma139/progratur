---
id: if-for-switch
title: if / for / switch
sidebar_label: if / for / switch
---

# if / for / switch

## 条件分岐 — if / else if / else

C# の `if` 文は他のほとんどの言語と同様です。条件式は必ず `bool` 型でなければなりません（C/C++ のような暗黙的な数値変換はありません）。

```csharp
int score = 85;

if (score >= 90)
{
    Console.WriteLine("A ランク");
}
else if (score >= 70)
{
    Console.WriteLine("B ランク"); // ← ここが実行される
}
else
{
    Console.WriteLine("C ランク");
}

// パターンマッチング（C# 7.0+）
object obj = 42;
if (obj is int n && n > 0)
{
    Console.WriteLine($"正の整数: {n}");
}
```

## 繰り返し — for / foreach / while

```csharp
// for: 添字を使った繰り返し
for (int i = 0; i < 5; i++)
{
    Console.WriteLine(i);
}

// foreach: コレクションの各要素を走査
var names = new[] { "太郎", "花子", "次郎" };
foreach (var name in names)
{
    Console.WriteLine(name);
}

// while / do-while
int count = 0;
while (count < 3)
{
    count++;
}

do
{
    count++;
} while (count < 10);

// break / continue はほぼ全言語共通の意味
foreach (var name in names)
{
    if (name == "花子") continue;
    if (name == "次郎") break;
    Console.WriteLine(name);
}
```

## switch 文 / switch 式

従来の `switch` 文に加え、C# 8.0 以降では値を返す **switch 式** が使えます。

```csharp
// 従来の switch 文
int day = 3;
switch (day)
{
    case 1:
    case 7:
        Console.WriteLine("週末");
        break;
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
        Console.WriteLine("平日");
        break;
    default:
        throw new ArgumentOutOfRangeException(nameof(day));
}

// switch 式（式として値を返す。break不要）
string label = day switch
{
    1 or 7 => "週末",
    >= 2 and <= 6 => "平日",
    _ => throw new ArgumentOutOfRangeException(nameof(day)),
};

// 型によるパターンマッチング
object shape = new { Width = 3, Height = 4 };
string description = shape switch
{
    int i => $"整数: {i}",
    string s => $"文字列: {s}",
    null => "null です",
    _ => "不明な型",
};
```

:::note[switch 文と switch 式の違い]
`switch` 文は各 `case` の末尾に `break`（または `return` / `throw`）が必須で、フォールスルー（意図しない次の case への流出）はコンパイルエラーになります。`switch` 式は各アームが値を返す前提の**式**であり、代入や戻り値としてそのまま使える点が特徴です。
:::
