---
id: class-interface
title: class / interface
sidebar_label: class / interface
---

# class / interface

## クラスの基礎

```java
// クラス定義
public class Animal {
    private String name;    // フィールド
    private int    age;

    // コンストラクタ
    public Animal(String name, int age) {
        this.name = name;
        this.age  = age;
    }

    // getter / setter (通常は Lombok @Data で自動生成)
    public String getName() { return name; }
    public void   setName(String name) { this.name = name; }
    public int    getAge()  { return age; }

    // virtualメソッド相当 (Java は基本的にオーバーライド可)
    public String speak() { return "..."; }

    @Override
    public String toString() {
        return name + " (年齢: " + age + ")";
    }
}

// 継承 (extends は1クラスのみ)
public class Dog extends Animal {
    private String breed;

    public Dog(String name, int age, String breed) {
        super(name, age);   // 親コンストラクタ呼び出し
        this.breed = breed;
    }

    @Override
    public String speak() { return "ワン！"; }
}

// 使用
Dog dog = new Dog("ポチ", 3, "柴犬");
System.out.println(dog.speak());     // ワン！
System.out.println(dog.toString());  // ポチ (年齢: 3)
```

## interface と abstract class

```java
// インターフェース (Java 8+ でデフォルトメソッド可)
public interface Shape {
    double area();
    double perimeter();

    // デフォルトメソッド
    default String describe() {
        return String.format("面積: %.2f, 周長: %.2f", area(), perimeter());
    }

    // 静的メソッド
    static Shape circle(double r) { return new Circle(r); }
}

// 複数インターフェースの実装
public interface Drawable { void draw(); }

public class Circle implements Shape, Drawable {
    private final double radius;
    public Circle(double r) { this.radius = r; }

    @Override public double area()      { return Math.PI * radius * radius; }
    @Override public double perimeter() { return 2 * Math.PI * radius; }
    @Override public void   draw()      { System.out.println("○ r=" + radius); }
}

// 抽象クラス
public abstract class Vehicle {
    private final String model;
    public Vehicle(String model) { this.model = model; }
    public String getModel() { return model; }

    public abstract int maxSpeed();               // 必ず実装
    public String type() { return "乗り物"; }    // オーバーライド可
}
```

:::note[interface vs abstract class]
`interface` は「複数実装可能・フィールドを持てない（`static final` 定数のみ）」、`abstract class` は「単一継承のみ・フィールドと状態を持てる」という違いがあります。「〜できる」という振る舞いの契約には interface、「共通の実装を持つ基底クラス」には abstract class を使うのが基本方針です。
:::

## ジェネリクス

```java
// ジェネリッククラス
public class Pair<A, B> {
    private final A first;
    private final B second;

    public Pair(A first, B second) {
        this.first  = first;
        this.second = second;
    }

    public A getFirst()  { return first; }
    public B getSecond() { return second; }
}

Pair<String, Integer> pair = new Pair<>("Alice", 30);

// 境界ワイルドカード
// ? extends T — 上限境界 (読み取り専用)
// ? super   T — 下限境界 (書き込み可)
public double sum(List<? extends Number> list) {
    return list.stream().mapToDouble(Number::doubleValue).sum();
}

// 型境界
public <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}

System.out.println(max(3, 7));       // 7
System.out.println(max("apple", "banana")); // banana
```

:::info[関連ページ]
不変のデータ保持用クラス（レコード）や、サブクラスを限定した継承階層については [records](records) のページを参照してください。
:::
