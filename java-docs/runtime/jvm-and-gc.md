---
id: jvm-and-gc
title: JVM と GC
sidebar_label: JVM と GC
---

# JVM と GC

Java プログラムは **JVM (Java Virtual Machine)** 上で動作します。コンパイル時に **バイトコード (.class)** に変換され、実行時に **JIT (Just-In-Time) コンパイラ**がネイティブコードに変換します。

## プリミティブ型 vs 参照型

| 特性 | プリミティブ型 | 参照型 (Object) |
| --- | --- | --- |
| 格納場所 | スタック | ヒープ (参照はスタック) |
| null | 不可 | 可能 |
| == 演算 | 値の比較 | 参照の比較 |
| ラッパー | `int` → `Integer` | オートボクシングで相互変換 |

```java
// プリミティブとラッパー
int primitive = 42;
Integer boxed = primitive;    // オートボクシング
int unboxed   = boxed;        // アンボクシング

// == は参照比較、値の比較には equals()
Integer a = 200;
Integer b = 200;
System.out.println(a == b);      // false (ヒープの別オブジェクト)
System.out.println(a.equals(b)); // true

// -128〜127 はキャッシュされる
Integer x = 100;
Integer y = 100;
System.out.println(x == y);      // true (キャッシュ)

// GC (明示的呼び出しは非推奨)
System.gc();

// メモリ情報
Runtime rt = Runtime.getRuntime();
System.out.println("最大メモリ: " + rt.maxMemory() / 1024 / 1024 + " MB");
System.out.println("使用中: "     + (rt.totalMemory() - rt.freeMemory()) / 1024 / 1024 + " MB");
```

:::caution[Integer の == 比較]
`Integer` などのラッパー型は `-128〜127` の範囲だけキャッシュされ同一インスタンスが再利用されるため、その範囲では `==` がたまたま `true` になります。範囲外では別インスタンスになり `==` は `false` になるため、値の比較には常に `equals()` を使うべきです。
:::
