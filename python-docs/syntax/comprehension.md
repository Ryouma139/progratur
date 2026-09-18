---
id: comprehension
title: 内包表記
sidebar_label: 内包表記
---

# 内包表記

```python
numbers = range(10)

# リスト内包表記
squares     = [x ** 2 for x in numbers]                      # [0,1,4,9,16,25,36,49,64,81]
even_sq     = [x ** 2 for x in numbers if x % 2 == 0]        # [0,4,16,36,64]
flat        = [x for row in [[1,2],[3,4]] for x in row]       # [1,2,3,4]

# 辞書内包表記
sq_dict     = {x: x**2 for x in range(5)}                    # {0:0, 1:1, 2:4, 3:9, 4:16}
inverted    = {v: k for k, v in sq_dict.items()}

# 集合内包表記
unique_lens = {len(w) for w in ["apple","banana","cherry"]}  # {5, 6}

# ジェネレータ式 (遅延評価 — メモリ効率が良い)
gen  = (x ** 2 for x in numbers)       # ジェネレータオブジェクト
total = sum(x ** 2 for x in numbers)   # sum() に直接渡す
big  = any(x > 50 for x in gen)

# ネストした内包表記
matrix = [[1,2,3],[4,5,6],[7,8,9]]
transposed = [[row[i] for row in matrix] for i in range(3)]
# [[1,4,7],[2,5,8],[3,6,9]]

# walrus 演算子 := と組み合わせ
results = [y for x in range(10) if (y := x * x) > 10]
# [16, 25, 36, 49, 64, 81]
```

:::tip[リスト内包表記 vs ジェネレータ式]
`[...]` （角括弧）はリスト内包表記で、その場で全要素を持つリストを作ります。`(...)` （丸括弧）はジェネレータ式で、要素を1つずつ遅延生成します。巨大なデータを1回だけ走査するなら、メモリを消費しないジェネレータ式（`sum(...)` や `any(...)` に直接渡す形）の方が効率的です。
:::

:::caution[ネストしすぎに注意]
内包表記は簡潔ですが、条件やネストが増えすぎると可読性が急激に落ちます。2重ループを超えるような複雑なロジックは、通常の `for` 文に書き直した方が読みやすいことが多いです。
:::
