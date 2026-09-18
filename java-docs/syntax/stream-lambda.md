---
id: stream-lambda
title: lambda / 関数型インターフェース
sidebar_label: lambda / 関数型インターフェース
---

# lambda / 関数型インターフェース

## ラムダ式と関数型インターフェース

```java
import java.util.function.*;

// java.util.function の主要インターフェース
Function<String, Integer> len    = String::length;  // メソッド参照
Function<Integer, Integer> sq    = x -> x * x;
Function<Integer, Integer> lenSq = len.andThen(sq); // 合成

Consumer<String> print  = System.out::println;
Supplier<String> hello  = () -> "Hello!";
Predicate<Integer> even = n -> n % 2 == 0;
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;

System.out.println(len.apply("Hello"));   // 5
System.out.println(sq.apply(4));          // 16
System.out.println(even.test(6));         // true
System.out.println(even.negate().test(6));// false
System.out.println(add.apply(3, 4));      // 7

// カスタム関数型インターフェース
@FunctionalInterface
interface TriFunction<A, B, C, R> {
    R apply(A a, B b, C c);
}

TriFunction<Integer, Integer, Integer, Integer> sum3 =
    (a, b, c) -> a + b + c;
System.out.println(sum3.apply(1, 2, 3)); // 6

// メソッド参照の種類
List<String> words = List.of("hello", "world");
words.forEach(System.out::println);             // インスタンス::メソッド (任意のインスタンス)
words.stream().map(String::toUpperCase).toList(); // 同上
words.stream().sorted(String::compareTo).toList(); // 同上

List.of("a", "b").stream()
    .map(s -> s.repeat(3))  // ラムダ
    .toList();               // ["aaa", "bbb"]
```

:::note[Stream API は別ページ]
`List` や `Map` に対する `.stream()` を使った集計・変換の詳しい使い方は [Stream API](../stdlib/stream-api) のページにまとめています。
:::
