---
id: itertools-functools
title: itertools / functools
sidebar_label: itertools / functools
---

# itertools / functools

```python
import itertools
import functools

# --- itertools ---

# chain — 複数のイテラブルを連結
list(itertools.chain([1,2], [3,4], [5]))  # [1,2,3,4,5]
list(itertools.chain.from_iterable([[1,2],[3,4]])) # [1,2,3,4]

# product — 直積 (デカルト積)
list(itertools.product("AB", [1,2]))  # [('A',1),('A',2),('B',1),('B',2)]
list(itertools.product(range(3), repeat=2))  # 3×3の組み合わせ

# permutations / combinations
list(itertools.permutations("ABC", 2))   # 順列: AB,AC,BA,BC,CA,CB
list(itertools.combinations("ABC", 2))   # 組み合わせ: AB,AC,BC
list(itertools.combinations_with_replacement("AB", 2))  # AA,AB,BB

# groupby — 連続する同じキーのグループ
data = [("A",1),("A",2),("B",3),("A",4)]
for key, group in itertools.groupby(data, key=lambda x: x[0]):
    print(key, list(group))
# A [('A',1),('A',2)], B [('B',3)], A [('A',4)]

# islice — 遅延スライス
list(itertools.islice(range(100), 5, 15, 2))  # [5,7,9,11,13]

# takewhile / dropwhile
list(itertools.takewhile(lambda x: x < 5, [1,2,3,5,1,2]))  # [1,2,3]
list(itertools.dropwhile(lambda x: x < 5, [1,2,3,5,1,2]))  # [5,1,2]

# cycle / repeat / count
# itertools.cycle([1,2,3])  → 1,2,3,1,2,3,...  (無限)
# itertools.repeat(0, 5)    → 0,0,0,0,0
# itertools.count(10, 2)    → 10,12,14,...  (無限)

# accumulate
list(itertools.accumulate([1,2,3,4,5]))              # [1,3,6,10,15] (累積和)
list(itertools.accumulate([1,2,3,4,5], lambda a,b: a*b)) # 階乗

# --- functools ---

# reduce
from functools import reduce
product = reduce(lambda a, b: a * b, [1,2,3,4,5])  # 120

# partial — 引数の一部を固定
from functools import partial
def power(base, exp): return base ** exp
square = partial(power, exp=2)
cube   = partial(power, exp=3)
print(square(4), cube(3))  # 16 27

# singledispatch — 型によるディスパッチ
from functools import singledispatch
@singledispatch
def process(value):
    return f"不明: {value}"

@process.register(int)
def _(value): return f"整数: {value * 2}"

@process.register(str)
def _(value): return f"文字列: {value.upper()}"

print(process(5))       # 整数: 10
print(process("hello")) # 文字列: HELLO
```

:::caution[groupby は事前ソートが前提]
`itertools.groupby` は「連続する」同じキーの要素だけをグループ化します。上の例のように離れた位置に同じキー（`"A"` が2箇所）があると別グループとして分かれてしまうため、キーでグループ化したいだけなら事前に `sorted(data, key=...)` してから渡す必要があります。
:::
