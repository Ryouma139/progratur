---
id: collections
title: コレクション
sidebar_label: コレクション
---

# コレクション

## List — ArrayList / LinkedList

```java
import java.util.*;

// 不変リスト (List.of は変更不可)
List<String> immutable = List.of("apple", "banana", "cherry");

// 可変リスト
List<String> list = new ArrayList<>(immutable);
list.add("date");
list.add(1, "avocado");  // インデックス指定
list.addAll(List.of("elderberry", "fig"));
list.remove("banana");   // 値で削除
list.remove(0);          // インデックスで削除
list.removeIf(s -> s.startsWith("a")); // 条件で削除

// 取得・検索
String first  = list.get(0);
int    idx    = list.indexOf("cherry");   // -1 なら未発見
boolean has   = list.contains("cherry");
int    size   = list.size();

// ソート
Collections.sort(list);
list.sort(Comparator.comparingInt(String::length));
list.sort(Comparator.comparingInt(String::length).reversed());

// サブリスト (ビュー、変更が元に反映される)
List<String> sub = list.subList(1, 3);

// 変換
Object[] arr  = list.toArray();
String[] sarr = list.toArray(String[]::new);
```

## Map — HashMap / LinkedHashMap / TreeMap

```java
// 不変マップ
Map<String, Integer> immutable = Map.of("apple", 3, "banana", 5);

// 可変マップ
Map<String, Integer> map = new HashMap<>(immutable);
map.put("cherry", 12);
map.putIfAbsent("date", 1);         // なければ追加
map.computeIfAbsent("key", k -> k.length()); // なければ計算して追加
map.merge("apple", 2, Integer::sum); // apple = 3 + 2 = 5

map.remove("banana");

// 取得
int val    = map.get("apple");       // null の場合 NPE
int safe   = map.getOrDefault("mango", 0); // なければデフォルト
boolean ok = map.containsKey("cherry");

// 反復
map.forEach((k, v) -> System.out.println(k + " = " + v));
for (Map.Entry<String, Integer> e : map.entrySet()) {
    System.out.println(e.getKey() + ": " + e.getValue());
}

// LinkedHashMap — 挿入順を保持
Map<String, Integer> linked = new LinkedHashMap<>();

// TreeMap — キー順にソート
Map<String, Integer> sorted = new TreeMap<>();
```

## Set / Queue / Deque

```java
// HashSet — 重複なし
Set<Integer> set1 = new HashSet<>(Set.of(1, 2, 3, 4));
Set<Integer> set2 = new HashSet<>(Set.of(3, 4, 5, 6));
set1.retainAll(set2); // 積集合: {3, 4}
set1.addAll(set2);    // 和集合

// ArrayDeque — スタックとキューの両方に使える
Deque<String> deque = new ArrayDeque<>();
deque.offerLast("A");   // キュー: 末尾に追加
deque.offerLast("B");
deque.offerFirst("Z");  // スタック: 先頭に追加
String head = deque.pollFirst(); // Z
String tail = deque.pollLast();  // B

// PriorityQueue — 優先度付きキュー (デフォルトは最小ヒープ)
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(5); pq.offer(1); pq.offer(3);
System.out.println(pq.poll()); // 1 (最小値)
System.out.println(pq.poll()); // 3

// 最大ヒープ
PriorityQueue<Integer> maxPq = new PriorityQueue<>(Comparator.reverseOrder());
maxPq.offer(5); maxPq.offer(1); maxPq.offer(3);
System.out.println(maxPq.poll()); // 5 (最大値)
```

:::note[List.of / Map.of / Set.of は不変]
`List.of(...)` などのファクトリメソッドで作ったコレクションは変更不可（`add` などを呼ぶと `UnsupportedOperationException`）です。変更したい場合は `new ArrayList<>(immutable)` のようにコピーしてから操作します。
:::
