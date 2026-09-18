---
id: gil-and-memory
title: GIL とメモリ管理
sidebar_label: GIL とメモリ管理
---

# GIL とメモリ管理

:::caution[GIL (Global Interpreter Lock)]
CPython では同時に1スレッドしか Python バイトコードを実行できません。CPU バウンドな並列処理には `multiprocessing` または外部ライブラリ（NumPy など）を使います。I/O バウンドには `asyncio` または `threading` が有効です。Python 3.13+ で GIL が実験的に無効化できるようになりました。
:::

```python
import sys
import gc

# 参照カウント
x = [1, 2, 3]
print(sys.getrefcount(x))  # 2 (x + getrefcount の引数)

# GC (循環参照のクリーンアップ)
gc.collect()
print(gc.get_count())  # (gen0, gen1, gen2) の回収回数

# オブジェクトのメモリサイズ
print(sys.getsizeof([]))        # 56 bytes
print(sys.getsizeof([1]*1000))  # ~8056 bytes

# インターン (小整数・短い文字列は共有)
a = 256; b = 256
print(a is b)  # True (インターン済み)
a = 257; b = 257
print(a is b)  # False (実装依存)

s1 = "hello"; s2 = "hello"
print(s1 is s2)  # True (文字列インターン)

# __slots__ でメモリを節約
class Efficient:
    __slots__ = ("x", "y")  # __dict__ の代わり

    def __init__(self, x, y):
        self.x, self.y = x, y

# 弱参照 — GC に回収させる
import weakref
class BigObject: pass
obj = BigObject()
ref = weakref.ref(obj)
print(ref())   # <BigObject ...>
del obj
print(ref())   # None (回収済み)
```

## CPythonのメモリ管理の仕組み

CPython は主に**参照カウント**でオブジェクトのライフタイムを管理し、参照カウントだけでは解決できない**循環参照**を検出するために世代別ガベージコレクタ（`gc` モジュール）を併用しています。オブジェクトへの参照がなくなった瞬間（カウントが0になった瞬間）にすぐ解放されるため、他言語のGCのような「いつ回収されるか分からない」不確実性が小さいのが特徴です。

:::tip[\_\_slots\_\_ を使う場面]
通常のインスタンスは属性を `__dict__` に保持するためオブジェクトごとにオーバーヘッドがあります。大量にインスタンス化するクラス（数百万件のデータ点など）では `__slots__` で固定属性のみに制限すると、メモリ使用量と属性アクセス速度の両方が改善します。
:::
