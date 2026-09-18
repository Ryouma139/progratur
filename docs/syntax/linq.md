---
id: linq
title: LINQ 文法
sidebar_label: LINQ 文法
---

# LINQ 文法

LINQ (Language Integrated Query) は、コレクションやデータソースに対して SQL に似たクエリ構文、あるいはメソッドチェーンで問い合わせを書ける仕組みです。ここでは**クエリ構文**を扱います（メソッド構文（拡張メソッド）は [LINQ 拡張メソッド](../stdlib/linq-methods.md) を参照）。

## クエリ構文の基本

```csharp
var numbers = new[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

var evenSquares =
    from n in numbers
    where n % 2 == 0
    orderby n descending
    select n * n;

foreach (var v in evenSquares)
{
    Console.WriteLine(v); // 100, 64, 36, 16, 4
}
```

## select と匿名型への射影

```csharp
public record Product(string Name, decimal Price, string Category);

var products = new List<Product>
{
    new("キーボード", 8000, "周辺機器"),
    new("マウス", 3000, "周辺機器"),
    new("モニター", 25000, "ディスプレイ"),
};

var query =
    from p in products
    where p.Price >= 5000
    select new { p.Name, TaxIncluded = p.Price * 1.1m };

foreach (var item in query)
{
    Console.WriteLine($"{item.Name}: {item.TaxIncluded:C}");
}
```

## group by — グループ化

```csharp
var byCategory =
    from p in products
    group p by p.Category into g
    select new { Category = g.Key, Count = g.Count(), Total = g.Sum(p => p.Price) };

foreach (var g in byCategory)
{
    Console.WriteLine($"{g.Category}: {g.Count()}件 合計{g.Total:C}");
}
```

## join — 結合

```csharp
public record Order(int Id, string ProductName, int CustomerId);
public record Customer(int Id, string Name);

var orders = new[] { new Order(1, "キーボード", 1), new Order(2, "マウス", 2) };
var customers = new[] { new Customer(1, "山田"), new Customer(2, "佐藤") };

var joined =
    from o in orders
    join c in customers on o.CustomerId equals c.Id
    select new { c.Name, o.ProductName };

foreach (var item in joined)
{
    Console.WriteLine($"{item.Name} さんが {item.ProductName} を注文");
}
```

## let — クエリ内の中間変数

```csharp
var result =
    from p in products
    let taxIncluded = p.Price * 1.1m
    where taxIncluded > 10000
    select new { p.Name, taxIncluded };
```

:::note[遅延実行]
LINQ クエリは定義しただけでは実行されず、`foreach` や `ToList()` / `ToArray()` などで実際に列挙されたタイミングで初めて評価されます（**遅延実行**）。同じクエリを複数回列挙すると、その都度元のデータソースが再評価される点に注意してください。
:::
