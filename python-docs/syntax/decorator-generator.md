---
id: decorator-generator
title: decorator / generator / context manager
sidebar_label: decorator / generator
---

# decorator / generator / context manager

## デコレータ

```python
import functools
import time

# 基本的なデコレータ
def timer(func):
    @functools.wraps(func)  # __name__ などのメタデータを保持
    def wrapper(*args, **kwargs):
        start  = time.perf_counter()
        result = func(*args, **kwargs)
        end    = time.perf_counter()
        print(f"{func.__name__}: {end-start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(0.1)

# 引数付きデコレータ (デコレータファクトリ)
def retry(times=3, exceptions=(Exception,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(times):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt == times - 1:
                        raise
                    print(f"リトライ {attempt + 1}/{times}: {e}")
        return wrapper
    return decorator

@retry(times=3, exceptions=(ConnectionError,))
def fetch_data(url: str) -> str:
    # ...
    return "data"

# クラスベースのデコレータ
class Memoize:
    def __init__(self, func):
        self.func  = func
        self.cache = {}
        functools.update_wrapper(self, func)

    def __call__(self, *args):
        if args not in self.cache:
            self.cache[args] = self.func(*args)
        return self.cache[args]

@Memoize
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)

# 標準のデコレータ
import functools
@functools.lru_cache(maxsize=128)
def expensive(n): return n ** 2

@functools.cache            # Python 3.9+ / lru_cache(maxsize=None) 相当
def cached(n): return n * n
```

:::note[functools.wraps を忘れずに]
デコレータの中で新しい `wrapper` 関数を返すと、元の関数の `__name__` や docstring が失われてしまいます。`@functools.wraps(func)` を付けることで、デバッグ時やドキュメント生成時に元の関数の情報が保たれます。
:::

## ジェネレータ

```python
from typing import Generator, Iterator

# ジェネレータ関数 — yield で値を一つずつ生成
def fibonacci() -> Iterator[int]:
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

# 取り出し
gen = fibonacci()
print([next(gen) for _ in range(8)])  # [0,1,1,2,3,5,8,13]

# 有限ジェネレータ
def squares(n: int) -> Generator[int, None, None]:
    for i in range(n):
        yield i ** 2

print(list(squares(5)))  # [0,1,4,9,16]

# yield from — サブジェネレータへの委譲
def chain(*iterables):
    for it in iterables:
        yield from it

print(list(chain([1,2], [3,4], [5])))  # [1,2,3,4,5]

# send() — 双方向通信
def accumulator():
    total = 0
    while True:
        value = yield total
        if value is None: break
        total += value

acc = accumulator()
next(acc)          # プライムの呼び出しで最初の yield まで進める
acc.send(10)       # 10
acc.send(20)       # 30
print(acc.send(5)) # 35
```

## コンテキストマネージャ

```python
from contextlib import contextmanager, suppress

# __enter__ / __exit__ プロトコル
class ManagedResource:
    def __enter__(self):
        print("リソース取得")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("リソース解放")
        return False  # True なら例外を抑制

with ManagedResource() as r:
    print("使用中")
# リソース取得 → 使用中 → リソース解放

# @contextmanager デコレータで簡単に作れる
@contextmanager
def timer_ctx(label: str):
    start = time.perf_counter()
    try:
        yield  # with ブロックの中身がここで実行
    finally:
        elapsed = time.perf_counter() - start
        print(f"{label}: {elapsed:.4f}s")

with timer_ctx("処理A"):
    time.sleep(0.05)

# suppress — 例外を握りつぶす
with suppress(FileNotFoundError):
    import os
    os.remove("nonexistent.txt")  # エラーを無視

# 複数のコンテキストマネージャ
with open("in.txt") as f_in, open("out.txt", "w") as f_out:
    f_out.write(f_in.read())
```

:::tip[@contextmanager は yield 1回だけ]
`@contextmanager` を付けた関数は「`yield` の前」が `__enter__`、「`yield` の後（`finally` 節）」が `__exit__` に相当します。`try/finally` で挟むことで、`with` ブロック内で例外が起きても後始末が確実に実行されます。
:::
