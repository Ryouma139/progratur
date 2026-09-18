---
id: if-for-while
title: if / for / while / match
sidebar_label: if / for / while / match
---

# if / for / while / match

## 条件分岐と繰り返し

```python
# if / elif / else
score = 85
if score >= 90:
    print("A ランク")
elif score >= 70:
    print("B ランク")   # ← ここが実行される
else:
    print("C ランク")

# 三項演算子 (条件式)
label = "合格" if score >= 60 else "不合格"

# セイウチ演算子 := (Python 3.8+)
import re
if m := re.search(r"\d+", "abc123"):
    print(m.group())  # 123

# for / while
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# range
for i in range(5):         print(i, end=" ")  # 0 1 2 3 4
for i in range(2, 10, 2):  print(i, end=" ")  # 2 4 6 8

count = 0
while count < 3:
    print(f"count = {count}")
    count += 1

# break / continue / else (ループ完走時に実行)
for i in range(5):
    if i == 3: break
    print(i, end=" ")  # 0 1 2
else:
    print("完走！")  # break されたので実行されない

# zip / zip_longest
names  = ["Alice", "Bob", "Charlie"]
scores = [95, 80, 75]
for name, score in zip(names, scores):
    print(f"{name}: {score}")
```

:::tip[for-else の意味]
`for` / `while` の `else` 節は、ループが `break` されずに完走したときだけ実行されます。「探索して見つからなかった場合」の処理を書くのに便利なパターンです。
:::

## match 文 — 構造的パターンマッチング (Python 3.10+)

```python
command = "quit"

match command:
    case "quit":
        print("終了")
    case "start" | "begin":
        print("開始")
    case _:
        print(f"不明なコマンド: {command}")

# 構造マッチング
point = (1, 0)
match point:
    case (0, 0):
        print("原点")
    case (x, 0):
        print(f"X軸上: x={x}")
    case (0, y):
        print(f"Y軸上: y={y}")
    case (x, y):
        print(f"点: ({x}, {y})")

# 辞書パターン
response = {"status": 200, "body": "OK"}
match response:
    case {"status": 200, "body": body}:
        print(f"成功: {body}")
    case {"status": 404}:
        print("Not Found")
    case {"status": code}:
        print(f"エラー: {code}")

# クラスパターン
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y

p = Point(1, 2)
match p:
    case Point(x=0, y=0):
        print("原点")
    case Point(x=x, y=y) if x == y:
        print(f"対角線上: {x}")
    case Point(x=x, y=y):
        print(f"点: ({x}, {y})")
```

:::note[match は switch と何が違うか]
`match` は単なる値の一致判定（他言語の `switch`）にとどまらず、タプルや辞書、クラスの属性を分解しながらマッチできる「構造的パターンマッチング」です。`case _:` は他のどれにもマッチしなかった場合のワイルドカードです。
:::
