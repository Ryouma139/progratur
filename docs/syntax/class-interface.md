---
id: class-interface
title: class / interface
sidebar_label: class / interface
---

# class / interface

## クラスの基本

```csharp
public class Person
{
    // 自動実装プロパティ
    public string Name { get; set; }
    public int Age { get; private set; }

    // コンストラクタ
    public Person(string name, int age)
    {
        Name = name;
        Age = age;
    }

    public void Birthday()
    {
        Age++;
    }

    public override string ToString() => $"{Name} ({Age})";
}

var alice = new Person("Alice", 30);
alice.Birthday();
Console.WriteLine(alice); // Alice (31)
```

## 継承 / 抽象クラス

```csharp
public abstract class Animal
{
    public string Name { get; }

    protected Animal(string name) => Name = name;

    // 抽象メソッド: 派生クラスで実装必須
    public abstract string Speak();

    // 仮想メソッド: 派生クラスで上書き可能（任意）
    public virtual void Introduce() => Console.WriteLine($"{Name}: {Speak()}");
}

public class Dog : Animal
{
    public Dog(string name) : base(name) { }
    public override string Speak() => "ワン！";
}

Animal a = new Dog("ポチ");
a.Introduce(); // ポチ: ワン！
```

## interface

C# の `interface` はメンバーのシグネチャ（契約）を定義します。1 つのクラスは複数のインターフェースを実装できます（多重継承の代替）。

```csharp
public interface IShape
{
    double Area();
}

public interface IPrintable
{
    void Print();
}

public class Circle : IShape, IPrintable
{
    public double Radius { get; init; } // init: コンストラクタ以外での初期化のみ許可

    public double Area() => Math.PI * Radius * Radius;

    public void Print() => Console.WriteLine($"半径 {Radius} の円、面積 {Area():F2}");
}

IShape shape = new Circle { Radius = 2 };
Console.WriteLine(shape.Area());
```

C# 8.0 以降ではインターフェースに**デフォルト実装**を持たせることもできます。

```csharp
public interface IGreeter
{
    string Name { get; }
    void Greet() => Console.WriteLine($"こんにちは、{Name} さん");
}
```

## record — 値の等価性を持つ型

`record` は主にイミュータブルなデータの表現に使われ、値ベースの等価性比較（`==`）やコピー用の `with` 式が自動生成されます。

```csharp
public record Point(int X, int Y);

var p1 = new Point(1, 2);
var p2 = new Point(1, 2);
Console.WriteLine(p1 == p2); // True（値の等価性）

var p3 = p1 with { X = 10 }; // 一部プロパティだけ変更したコピー
Console.WriteLine(p3); // Point { X = 10, Y = 2 }
```

:::note[class と struct]
`class` は参照型（ヒープに確保され、代入は参照のコピー）、`struct` は値型（スタックや保持先に直接埋め込まれ、代入は値のコピー）です。小さく不変なデータ（座標、金額など）には `struct`、それ以外は基本的に `class` を使います。
:::
