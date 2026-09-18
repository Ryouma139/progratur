---
id: if-for-switch
title: if / for / switch
sidebar_label: if / for / switch
---

# if / for / switch

## 条件分岐と繰り返し

```java
// if / else if / else
int score = 85;
if (score >= 90) {
    System.out.println("A ランク");
} else if (score >= 70) {
    System.out.println("B ランク");  // ← ここが実行
} else {
    System.out.println("C ランク");
}

// for / for-each / while
for (int i = 0; i < 5; i++) {
    System.out.print(i + " ");  // 0 1 2 3 4
}

String[] fruits = {"apple", "banana", "cherry"};
for (String fruit : fruits) {
    System.out.println(fruit);
}

int count = 0;
while (count < 3) {
    System.out.println("count = " + count++);
}

// break / continue
for (int i = 0; i < 10; i++) {
    if (i == 3) continue;
    if (i == 7) break;
    System.out.print(i + " ");  // 0 1 2 4 5 6
}
```

## switch 文 と switch 式 (Java 14+)

```java
// 従来の switch 文
String day = "MONDAY";
switch (day) {
    case "SATURDAY":
    case "SUNDAY":
        System.out.println("週末");
        break;
    default:
        System.out.println("平日");
}

// switch 式 (Java 14+ / Arrow ラベル)
String result = switch (day) {
    case "SATURDAY", "SUNDAY" -> "週末";
    case "MONDAY"             -> "月曜日";
    default                   -> "平日";
};

// yield で値を返す (複数文)
int numLetters = switch (day) {
    case "MONDAY", "FRIDAY", "SUNDAY" -> 6;
    case "TUESDAY" -> {
        System.out.println("Tuesday の文字数を計算");
        yield 7;
    }
    default -> day.length();
};

// パターンマッチング switch (Java 21+)
Object obj = 42;
String desc = switch (obj) {
    case Integer i when i > 0 -> "正の整数: " + i;
    case Integer i            -> "整数: " + i;
    case String  s            -> "文字列: " + s;
    case null                 -> "null";
    default                   -> "その他";
};
```

:::tip[switch 文 vs switch 式]
従来の `switch` 文は `break` を書き忘れるとフォールスルー（意図せず次の `case` に処理が続く）するバグの温床でしたが、Java 14+ の `switch` 式（Arrow ラベル `->`）はフォールスルーせず、値を返せるため代入や `return` に直接使えます。新しいコードでは基本的に `switch` 式を選ぶのがおすすめです。
:::
