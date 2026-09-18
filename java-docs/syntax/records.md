---
id: records
title: record / sealed class
sidebar_label: record / sealed class
---

# record / sealed class

## record — 不変のデータクラス (Java 16+)

`record` はフィールド・コンストラクタ・`equals` / `hashCode` / `toString` / ゲッターを自動生成する、不変（immutable）データ専用のクラスです。DTO やイベントオブジェクトなど「値そのもの」を表す型に向いています。

```java
public record Person(String name, int age) {
    // コンパクトコンストラクタでバリデーション
    public Person {
        if (age < 0) throw new IllegalArgumentException("年齢は0以上");
    }

    // メソッドも追加可
    public String greeting() { return "こんにちは、" + name + "です"; }
}

Person alice = new Person("Alice", 30);
Person bob   = alice;  // 同じ参照
System.out.println(alice.name());     // Alice
System.out.println(alice.equals(new Person("Alice", 30))); // true
```

:::note[アクセサ名に get は付かない]
通常のクラスの `getName()` と異なり、record のアクセサは `name()` のようにフィールド名そのままです。`toString()` / `equals()` / `hashCode()` も全フィールドを使って自動生成されます。
:::

## sealed class — サブクラスを限定 (Java 17+)

`sealed` を使うと、そのクラス（またはインターフェース）を継承・実装できるクラスを `permits` 句で明示的に限定できます。record と組み合わせることで、代数的データ型のような網羅的な分岐を表現できます。

```java
public sealed class Expr permits Num, Add, Mul {}
public record Num(int value)          extends Expr {}
public record Add(Expr l, Expr r)     extends Expr {}
public record Mul(Expr l, Expr r)     extends Expr {}

// 網羅的なパターンマッチング
int eval(Expr e) {
    return switch (e) {
        case Num(int v)      -> v;
        case Add(var l, var r) -> eval(l) + eval(r);
        case Mul(var l, var r) -> eval(l) * eval(r);
    };
}
```

:::tip[コンパイラによる網羅性チェック]
`Expr` が `sealed` で許可されたサブタイプが `Num` / `Add` / `Mul` のみだとコンパイラが把握しているため、上記の `switch` 式には `default` 節が不要です。将来サブタイプを追加した際は、対応漏れの分岐をコンパイルエラーとして検出できます。
:::
