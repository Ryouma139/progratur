---
id: stream-api
title: Stream API
sidebar_label: Stream API
---

# Stream API

```java
import java.util.stream.*;

List<String> words = List.of("apple", "banana", "cherry", "avocado", "blueberry");

// 基本操作
List<String> result = words.stream()
    .filter(s -> s.startsWith("a"))          // フィルタ
    .map(String::toUpperCase)                 // 変換
    .sorted()                                 // ソート
    .collect(Collectors.toList());            // 収集

// toList() Java 16+
List<String> result2 = words.stream()
    .filter(s -> s.length() > 5)
    .toList();  // 不変リスト

// 集計
long count   = words.stream().filter(s -> s.length() > 5).count();
Optional<String> longest = words.stream()
    .max(Comparator.comparingInt(String::length));
int totalLen = words.stream().mapToInt(String::length).sum();
double avg   = words.stream().mapToInt(String::length).average().orElse(0);

// reduce
int product = IntStream.rangeClosed(1, 5)
    .reduce(1, (acc, n) -> acc * n); // 120 (5!)

// groupingBy / partitioningBy
Map<Integer, List<String>> byLen = words.stream()
    .collect(Collectors.groupingBy(String::length));

Map<Boolean, List<String>> partitioned = words.stream()
    .collect(Collectors.partitioningBy(s -> s.length() > 5));

// joining
String csv = words.stream().collect(Collectors.joining(", ")); // apple, banana, ...

// flatMap
List<List<Integer>> nested = List.of(List.of(1, 2), List.of(3, 4));
List<Integer> flat = nested.stream()
    .flatMap(Collection::stream)
    .toList(); // [1, 2, 3, 4]

// 数値ストリーム
int sum = IntStream.range(1, 11).sum();      // 1〜10の合計: 55
IntStream.iterate(0, n -> n + 2).limit(5)   // 0, 2, 4, 6, 8
    .forEach(System.out::println);

// parallel stream (注意: スレッドセーフなコレクタを使うこと)
long countParallel = words.parallelStream()
    .filter(s -> s.length() > 5)
    .count();
```

:::caution[Stream は一度しか消費できない]
`Stream` は一度終端操作（`collect` / `forEach` / `count` など）を呼ぶと消費済みになり、同じインスタンスに再度操作を連鎖させると `IllegalStateException` になります。再利用したい場合はコレクションから都度 `.stream()` を呼び直します。
:::

:::caution[parallelStream の使い所]
`parallelStream()` は要素数が少ない・処理が軽い場合はスレッド分割のオーバーヘッドの方が大きくなり逆に遅くなることがあります。また `groupingBy` などの副作用を持つ操作をスレッドセーフでないコレクションに書き込むと壊れるため、まず通常の `stream()` で十分速いかを確認してから検討するのが安全です。
:::
