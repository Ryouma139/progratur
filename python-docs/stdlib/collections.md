---
id: collections
title: コレクション
sidebar_label: コレクション
---

# コレクション

## list / tuple / set / dict

```python
# list — 可変シーケンス
lst = [3, 1, 4, 1, 5, 9, 2, 6]
lst.append(7)
lst.extend([8, 0])
lst.insert(0, 100)
lst.remove(1)         # 最初の 1 を削除
lst.pop()             # 末尾を取り出す
lst.pop(0)            # 先頭を取り出す
lst.sort()            # インプレースソート
lst.sort(key=lambda x: -x)  # カスタムキー
sorted_lst = sorted(lst, reverse=True)  # 新しいリスト
lst.reverse()         # 反転 (インプレース)
print(lst.index(5))   # 5 のインデックス
print(lst.count(1))   # 1 の個数
lst2 = lst.copy()     # シャローコピー
import copy
lst3 = copy.deepcopy(lst)  # ディープコピー

# スライス
print(lst[1:4])    # インデックス 1〜3
print(lst[::2])    # 1個おき
print(lst[::-1])   # 逆順

# tuple — 不変シーケンス
t = (1, "hello", 3.14)
a, b, c = t           # アンパック
first, *rest = [1,2,3,4]  # スター式

# set — 重複なし、順序なし
s = {1, 2, 3, 4}
s.add(5)
s.discard(3)  # なくても例外なし
s.remove(2)   # なければ KeyError
print(s & {3,4,5,6})  # 積集合: {4, 5}
print(s | {3,4,5,6})  # 和集合
print(s - {3,4,5,6})  # 差集合

# dict — 挿入順を保持 (Python 3.7+)
d = {"name": "Alice", "age": 30}
d["city"] = "Tokyo"
d.update({"age": 31, "country": "JP"})
val  = d.get("email", "N/A")  # なければデフォルト
d.setdefault("tags", []).append("admin")  # なければ作成

del d["city"]
d.pop("age", None)   # なくても None を返す

for k, v in d.items():    print(f"{k}: {v}")
for k    in d.keys():     print(k)
for v    in d.values():   print(v)

# 辞書のマージ (Python 3.9+)
a = {"x": 1}; b = {"y": 2}
merged = a | b   # {"x":1, "y":2}
a |= b           # インプレース
```

:::note[list.sort() と sorted() の違い]
`lst.sort()` はリスト自身を書き換えて `None` を返し、`sorted(lst)` は元のリストを変更せず新しいリストを返します。元データを保持したいかどうかで使い分けます。
:::

## collections モジュール

```python
from collections import Counter, defaultdict, deque, OrderedDict, namedtuple, ChainMap

# Counter — 要素の出現回数
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
cnt = Counter(words)
print(cnt)                     # Counter({'apple':3,'banana':2,'cherry':1})
print(cnt.most_common(2))      # [('apple',3),('banana',2)]
cnt.update(["apple", "date"])  # 追加カウント

# defaultdict — キー未存在時のデフォルト値
dd = defaultdict(list)
for k, v in [("a", 1), ("b", 2), ("a", 3)]:
    dd[k].append(v)
# defaultdict(<class 'list'>, {'a':[1,3], 'b':[2]})

dd_int = defaultdict(int)
for char in "hello world":
    dd_int[char] += 1

# deque — 両端キュー (O(1) の両端操作)
dq = deque([1, 2, 3], maxlen=5)
dq.appendleft(0)   # [0, 1, 2, 3]
dq.append(4)       # [0, 1, 2, 3, 4]
dq.rotate(2)       # [3, 4, 0, 1, 2] (右に2回転)
dq.popleft()       # 3
dq.pop()           # 2

# namedtuple
Point = namedtuple("Point", ["x", "y", "z"])
p = Point(1, 2, 3)
print(p.x, p.y)     # 1 2
x, y, z = p         # アンパック可
print(p._asdict())  # {'x':1,'y':2,'z':3}

# ChainMap — 複数辞書を一つのビューに
defaults = {"color": "red",  "user": "guest"}
user_cfg = {"color": "blue"}
cfg = ChainMap(user_cfg, defaults)
print(cfg["color"])  # blue (user_cfg を先に検索)
print(cfg["user"])   # guest (defaults にフォールバック)
```

:::tip[list/dict/set の内包表記]
これらのコレクションをリテラルで組み立てる代わりに、`[x**2 for x in range(10)]` のような内包表記でまとめて生成する書き方もよく使われます。詳しくは [内包表記](../syntax/comprehension) のページを参照してください。
:::
