---
id: basic-types
title: 基本型
sidebar_label: 基本型
---

# 基本型

## プリミティブ型とラッパークラス

| プリミティブ | ラッパー | サイズ | 範囲 |
| --- | --- | --- | --- |
| `boolean` | `Boolean` | 1 bit | true / false |
| `byte` | `Byte` | 8 bit | -128 〜 127 |
| `int` | `Integer` | 32 bit | ±2,147,483,647 |
| `long` | `Long` | 64 bit | ±9.2 × 10¹⁸ |
| `float` | `Float` | 32 bit | 約 7 桁 |
| `double` | `Double` | 64 bit | 約 15 桁 |
| `char` | `Character` | 16 bit | Unicode |

```java
// 数値リテラル (アンダースコアで読みやすく)
int million = 1_000_000;
long big    = 9_999_999_999L;
double pi   = 3.141_592_653;

// var (Java 10+) — ローカル変数の型推論
var list = new ArrayList<String>();  // ArrayList<String>
var map  = new HashMap<String, Integer>();

// String 操作
String s = "Hello, Java!";
System.out.println(s.length());            // 12
System.out.println(s.toUpperCase());       // HELLO, JAVA!
System.out.println(s.contains("Java"));    // true
System.out.println(s.replace("Java", "World")); // Hello, World!
System.out.println(s.substring(7, 11));    // Java
System.out.println(s.strip());             // 前後の空白除去 (Unicode 対応)
System.out.println(String.join(", ", "A", "B", "C")); // A, B, C
System.out.println(s.startsWith("Hello")); // true

// テキストブロック (Java 15+)
String json = """
        {
            "name": "Alice",
            "age": 30
        }
        """;

// String.format / formatted
String msg = "名前: %s, 年齢: %d".formatted("Alice", 30);

// StringBuilder
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 5; i++) {
    sb.append(i).append(", ");
}
System.out.println(sb.toString()); // 0, 1, 2, 3, 4,

// Optional (null の安全な代替)
Optional<String> opt = Optional.of("hello");
String value = opt
    .filter(v -> v.length() > 3)
    .map(String::toUpperCase)
    .orElse("default");    // HELLO

Optional<String> empty = Optional.empty();
empty.ifPresent(System.out::println);       // 何もしない
String safe = empty.orElseGet(() -> "N/A"); // N/A
```

:::tip[Optional は戻り値専用]
`Optional` はメソッドの**戻り値**として「値が無いかもしれない」ことを表現するための型で、フィールドや引数の型として使うのは避けるのが定石です（`null` チェックの置き換えとしてフィールドに使うと逆に冗長になります）。
:::
